# VerdLedger
![stars](https://img.shields.io/github/stars/verdledger/verdledger)

VerdLedger is a "Ledger-as-a-Service" platform for tracking carbon savings from infrastructure changes.

```bash
git clone https://github.com/verdledger/verdledger && cd verdledger
supabase start && pnpm ws run gen:db && pnpm --filter backend dev
```

This repository currently includes the database schema defined via Supabase. More features will be added over time including REST endpoints, a CLI, GitHub actions and a dashboard.

### 💚 One-line install

```bash
npx verdledger init
```

![init demo](docs/init.gif)


## Running the API locally

```bash
pnpm install
pnpm --filter backend dev
```

Then visit `http://localhost:4000/health` to verify the server is running.
