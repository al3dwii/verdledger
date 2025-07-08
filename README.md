# VerdLedger
![stars](https://img.shields.io/github/stars/verdledger/verdledger)
![CI](https://github.com/verdledger/verdledger/actions/workflows/action-ci.yml/badge.svg)
![release](https://github.com/verdledger/verdledger/actions/workflows/release.yml/badge.svg)
![nightly](https://github.com/verdledger/verdledger/actions/workflows/refresh.yml/badge.svg)
![sec-scan](https://github.com/verdledger/verdledger/actions/workflows/scan.yml/badge.svg)
![docker](https://img.shields.io/docker/pulls/verdledger/verdledger)
![version](https://img.shields.io/github/v/release/verdledger/verdledger)

VerdLedger is a "Ledger-as-a-Service" platform for tracking carbon savings from infrastructure changes.
See [docs/cli.md](docs/cli.md) for the Go-based CLI tool.

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

### Install

#### macOS / Linux

```sh
brew install verdledger/verdledger/verdledger
```

#### Windows

Download the zip from the [Releases](https://github.com/<user>/verdledger/releases) page or use `scoop`.

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

Carbon emission factors are sourced from the [Carbonifer open-data repo](https://github.com/carbonifer-open-data/carbonifer) (`v2025-02-15`).
