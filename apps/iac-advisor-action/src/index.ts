// iac-advisor-action/src/index.ts
import * as core     from '@actions/core';
import * as github   from '@actions/github';
import { parseArgs } from 'node:util';        // built-in flag parser
import fetch         from 'node-fetch';
import { parsePlan } from './plan';
import { suggest    , Suggestion } from './suggest';

/* ──────────────────────────────────────────────────────────── */
/*  tiny CLI-flag helper                                        */
/* ──────────────────────────────────────────────────────────── */
const argv = parseArgs({
  args: process.argv.slice(2),
  options: {
    'plan-json': { type: 'string' },
    'api-key'  : { type: 'string' },
    'api-url'  : { type: 'string' },
    'org'      : { type: 'string' },          // optional override
    'repo'     : { type: 'string' }           // optional override
  },
});

/* unified input getter – CLI flag ➜ GitHub input ➜ env var */
function env(n: string) { return process.env[n]; }
function getInput(name: string, envVar: string): string {
  return (argv.values[name] as string) ||
         core.getInput(name)           ||
         env(`INPUT_${envVar}`)        ||
         env(envVar)                   ||
         '';
}

/* ──────────────────────────────────────────────────────────── */
/* push the savings events to VerdLedger                        */
/* ──────────────────────────────────────────────────────────── */
async function pushEvents(
  api: string,
  key: string,
  org: number,
  repo: string,
  sugg: Suggestion[]
) {
  const rows = sugg.map(s => ({
    org,
    repo,
    cloud : s.provider,
    region: s.region,
    sku   : s.altSku,
    kwh   : 0,                 // leave 0 – not used in summary fn
    usd   : -Math.abs(s.deltaUsd),  // negative = saving
    kg    : -Math.abs(s.deltaKg)
  }));

  await fetch(`${api}/v1/events`, {
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(rows)
  });
  core.info(`Pushed ${rows.length} event(s) to ${api}`);
}

/* ──────────────────────────────────────────────────────────── */
/*  main runner                                                 */
/* ──────────────────────────────────────────────────────────── */
async function run() {
  try {
    const api     = getInput('api-url',   'API_URL');
    const key     = getInput('api-key',   'API_KEY');
    const plan    = getInput('plan-json','PLAN_JSON');

    if (!api || !key || !plan) {
      throw new Error('Missing required inputs: api-url, api-key, plan-json');
    }

    /* determine org & repo for event rows */
    const org  = Number(argv.values.org ?? env('INPUT_ORG') ?? 1);         // default org-1
    const repo = (argv.values.repo as string) ??
                 env('INPUT_REPO') ??
                 `${github.context.repo.owner}/${github.context.repo.repo}`;

    /* parse plan + compute suggestions */
    const resources   = parsePlan(plan);
    const suggestions = await suggest(resources, api, key);

    if (!suggestions.length) {
      core.info('No greener alternatives found.');
      return;
    }

    /* build markdown comment */
    const markdown = [
      '### ♻️ VerdLedger suggestions',
      '| Current | Greener | Δ kg CO₂ | Δ Cost |',
      '|---------|---------|---------|--------|',
      ...suggestions.map(s =>
        `| \`${s.sku}\` | \`${s.altSku}\` | **${s.deltaKg.toFixed(2)}** | **$${s.deltaUsd.toFixed(2)}** |`
      ),
    ].join('\n');

    /* PR comment when running inside GitHub */
    if (process.env.GITHUB_TOKEN) {
      const octo = github.getOctokit(process.env.GITHUB_TOKEN);
      const { owner, repo: prRepo, number } = github.context.issue;
      await octo.rest.issues.createComment({
        owner,
        repo: prRepo,
        issue_number: number,
        body: markdown,
      });
    } else {
      core.info('\n' + markdown);                // local echo
    }

    /* push the events so the ledger updates immediately */
    await pushEvents(api, key, org, repo, suggestions);

    core.setOutput('suggestions', JSON.stringify(suggestions));
  } catch (err) {
    core.setFailed((err as Error).stack || (err as Error).message);
  }
}

run();



// import * as core from '@actions/core';
// import * as github from '@actions/github';
// import { parsePlan } from './plan';
// import { suggest }   from './suggest';
// import fetch from 'node-fetch';

// async function run() {
//   try {
//     const api   = core.getInput('api-url');
//     const key   = core.getInput('api-key');
//     const plan  = core.getInput('plan-json');

//     const resources = parsePlan(plan);
//     const sugg      = await suggest(resources, api);

//     if (!sugg.length) {
//       core.info('No greener alternatives found.');
//       return;
//     }

//     const markdown = [
//       `### \u2618\uFE0F VerdLedger suggestions`,
//       '| Current | Greener | \u0394 kg CO\u2082 | \u0394 Cost |',
//       '|---------|---------|---------|-------|',
//       ...sugg.map(s => `| \`${s.sku}\` | \`${s.altSku}\` | **${s.deltaKg.toFixed(2)}** | **$${s.deltaUsd.toFixed(2)}** |`)
//     ].join('\n');

//     const token = process.env.GITHUB_TOKEN!;
//     const octo  = github.getOctokit(token);
//     const { owner, repo, number } = github.context.issue;

//     await octo.rest.issues.createComment({ owner, repo, issue_number: number, body: markdown });

//     // Listen for "verdledger:apply" label on later job
//     core.setOutput('suggestions', JSON.stringify(sugg));

//   } catch (err) {
//     core.setFailed((err as Error).message);
//   }
// }

// run();
