# VerdLedger IaC Advisor Action

Comment estimated cost and CO₂ savings on Terraform pull requests. When a PR is merged with the label `verdledger:apply` you can record the accepted savings using `post-savings.js`.

```yaml
- uses: verdledger/iac-advisor-action@v0.1.0
  id: advise
  with:
    plan-json: plan.json
    api-key: ${{ secrets.VERDLEDGER_KEY }}
```

Post the savings to your VerdLedger account:

```yaml
- name: Post savings
  if: contains(github.event.pull_request.labels.*.name, 'verdledger:apply')
  run: node iac-advisor-action/post-savings.js '\${{ steps.advise.outputs.suggestions }}' https://api.verdledger.dev \${{ secrets.VERDLEDGER_KEY }}
```
