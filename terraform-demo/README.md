# Terraform Demo

This directory shows a minimal Terraform setup and GitHub workflow using the VerdLedger IaC Advisor.

The workflow comments estimated savings on pull requests.


```yaml
name: VerdLedger Demo
on: [pull_request]

jobs:
  advisor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: terraform init
      - run: terraform plan -out plan.tfplan
      - run: terraform show -json plan.tfplan > plan.json
      - uses: verdledger/iac-advisor-action@v0.1.0
        with:
          plan-json: plan.json
          api-key: ${{ secrets.VERDLEDGER_KEY }}
```

