# VerdLedger IaC Advisor Action

Comment estimated cost and CO\u2082 savings on Terraform pull requests.

```yaml
- uses: verdledger/iac-advisor-action@v0.1.0
  with:
    plan-json: plan.json
    api-key: ${{ secrets.VERDLEDGER_KEY }}
```
