#!/usr/bin/env node
import { Octokit } from '@octokit/rest';
import prompts from 'prompts';
import ora from 'ora';
import yaml from 'js-yaml';
import chalk from 'chalk';

(async () => {
  console.log(chalk.greenBright('\nVerdLedger one-liner installer\n'));

  const { repo, token, apiKey } = await prompts([
    { type: 'text', name: 'repo', message: 'GitHub repo (owner/name)' },
    { type: 'password', name: 'token', message: 'GitHub PAT (repo scope)' },
    { type: 'text', name: 'apiKey', message: 'VerdLedger API key (dashboard)' }
  ]);
  const [owner, name] = String(repo).split('/');
  const gh = new Octokit({ auth: token });

  const spinner = ora('Creating GitHub secret…').start();
  const { data: { key, key_id } } = await gh.actions.getRepoPublicKey({ owner, repo: name });
  const sodium = await import('tweetsodium');
  const encrypted = sodium.sodium_seal(Buffer.from(apiKey), Buffer.from(key, 'base64'));
  await gh.actions.createOrUpdateRepoSecret({
    owner,
    repo: name,
    secret_name: 'VERDLEDGER_KEY',
    encrypted_value: encrypted,
    key_id
  });
  spinner.succeed('Secret added');

  const { data: repoData } = await gh.repos.get({ owner, repo: name });
  const branch = repoData.default_branch;

  const wf = {
    name: 'VerdLedger',
    on: { pull_request: null },
    jobs: {
      advise: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          { uses: 'hashicorp/setup-terraform@v3' },
          { run: 'terraform init' },
          { run: 'terraform plan -out=plan' },
          { run: 'terraform show -json plan > plan.json' },
          {
            uses: 'verdledger/iac-advisor-action@v0.1.0',
            with: {
              'plan-json': 'plan.json',
              'api-key': '${{ secrets.VERDLEDGER_KEY }}',
              'api-url': 'https://api.verdledger.dev'
            }
          }
        ]
      }
    }
  } as const;

  const wfPath = '.github/workflows/verdledger.yml';
  const branchName = 'verdledger/init';
  spinner.start('Pushing workflow branch…');
  const contentBase64 = Buffer.from(yaml.dump(wf)).toString('base64');
  await gh.repos.createOrUpdateFileContents({
    owner,
    repo: name,
    path: wfPath,
    message: 'Add VerdLedger Action',
    content: contentBase64,
    branch: branchName
  });
  await gh.pulls.create({
    owner,
    repo: name,
    head: branchName,
    base: branch,
    title: 'Add VerdLedger IaC Advisor',
    body: '🚀 One-click commit-time carbon & cost suggestions'
  });
  spinner.succeed(`PR opened on branch ${branchName}`);

  console.log(chalk.green('\n✅ All done – open the pull request, merge, and enjoy!\n'));
})();
