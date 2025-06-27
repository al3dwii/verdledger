# VerdLedger

VerdLedger is a "Ledger-as-a-Service" platform for tracking carbon savings from infrastructure changes.

This repository currently includes the database schema defined via Supabase. More features will be added over time including REST endpoints, a CLI, GitHub actions and a dashboard.


## Running the API locally

```bash
pnpm install
pnpm --filter backend dev
```

Then visit `http://localhost:4000/health` to verify the server is running.
