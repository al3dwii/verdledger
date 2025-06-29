const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const fetch = require('node-fetch');

function parsePlan(path) {
  const plan = JSON.parse(fs.readFileSync(path, 'utf8'));
  const resources = [];
  plan.resource_changes?.forEach(rc => {
    if (rc.change.actions.includes('create')) {
      const provReg = rc.address.split('.')[0];
      const [, provider] = provReg.split('_');
      resources.push({
        provider,
        region: rc.change.after.availability_zone.replace(/[a-z]$/,''),
        sku: rc.change.after.instance_type
      });
    }
  });
  return resources;
}

async function suggest(resources, api) {
  const skus = await fetch(`${api}/v1/skus`).then(r => r.json());
  const table = new Map(skus.map(s => [`${s.cloud}/${s.region}/${s.sku}`, s]));
  return resources.map(r => {
    const base = table.get(`${r.provider}/${r.region}/${r.sku}`);
    const altSku = r.sku.replace(/medium/,'small');
    const alt = table.get(`${r.provider}/${r.region}/${altSku}`) || base;
    const deltaKg = ((base.watts - alt.watts) / 1000) * 0.7;
    const deltaUsd = (base.usd_hour - alt.usd_hour) * 730;
    return { ...r, altSku, deltaKg, deltaUsd };
  }).filter(s => s.deltaKg > 0.1);
}

async function run() {
  try {
    const api = core.getInput('api-url');
    core.getInput('api-key');
    const plan = core.getInput('plan-json');
    const resources = parsePlan(plan);
    const sugg = await suggest(resources, api);
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
    const token = process.env.GITHUB_TOKEN;
    const octo = github.getOctokit(token);
    const { owner, repo, number } = github.context.issue;
    await octo.rest.issues.createComment({ owner, repo, issue_number: number, body: markdown });
    core.setOutput('suggestions', JSON.stringify(sugg));
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
