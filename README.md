# VerdLedger
![stars](https://img.shields.io/github/stars/verdledger/verdledger)
![CI](https://github.com/verdledger/verdledger/actions/workflows/action-ci.yml/badge.svg)

VerdLedger is a "Ledger-as-a-Service" platform for tracking carbon savings from infrastructure changes.

```bash
git clone https://github.com/verdledger/verdledger && cd verdledger
supabase start && pnpm ws run gen:db && pnpm --filter ./apps/api-server dev
```

This repository currently includes the database schema defined via Supabase. More features will be added over time including REST endpoints, a CLI, GitHub actions and a dashboard.

### 💚 One-line install

```bash
npx verdledger init
```

![init demo](docs/init.gif)

### IaC Advisor GitHub Action

Use this action to comment CO₂ and cost savings on Terraform pull requests.

```yaml
# .github/workflows/advisor.yml
on: pull_request
jobs:
  advisor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: verdledger/iac-advisor-action@v0.1.0
        with:
          plan-json: plan.json
          api-key: ${{ secrets.VERDLEDGER_KEY }}
```

![demo](docs/demo.gif)


### Action comment demo

![PR comment](docs/demo.gif)

## Running the API locally

```bash
pnpm install
pnpm --filter ./apps/api-server dev
```

Then visit `http://localhost:4000/health` to verify the server is running.

## Dashboard configuration

The frontend reads `NEXT_PUBLIC_API_URL` from `.env.local` to know where to
fetch data. In production this is `https://api.verdledger.dev`.
