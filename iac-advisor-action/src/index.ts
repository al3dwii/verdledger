import * as core from '@actions/core';
import * as github from '@actions/github';
import { parsePlan } from './plan';
import { suggest }   from './suggest';
import fetch from 'node-fetch';

async function run() {
  try {
    const api   = core.getInput('api-url');
    const key   = core.getInput('api-key');
    const plan  = core.getInput('plan-json');

    const resources = parsePlan(plan);
    const sugg      = await suggest(resources, api);

    if (!sugg.length) {
      core.info('No greener alternatives found.');
      return;
    }

    const markdown = [
      `### \u2618\uFE0F VerdLedger suggestions`,
      '| Current | Greener | \u0394 kg CO\u2082 | \u0394 Cost |',
      '|---------|---------|---------|-------|',
      ...sugg.map(s => `| \`${s.sku}\` | \`${s.altSku}\` | **${s.deltaKg.toFixed(2)}** | **$${s.deltaUsd.toFixed(2)}** |`)
    ].join('\n');

    const token = process.env.GITHUB_TOKEN!;
    const octo  = github.getOctokit(token);
    const { owner, repo, number } = github.context.issue;

    await octo.rest.issues.createComment({ owner, repo, issue_number: number, body: markdown });

    // Listen for "verdledger:apply" label on later job
    core.setOutput('suggestions', JSON.stringify(sugg));

  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

run();
