-- name: UpsertSubscription :exec
insert into billing.org_subscription
       (org_id, stripe_customer_id, stripe_subscription_id, status, current_period_end)
values ($1,$2,$3,$4,$5)
on conflict (org_id) do update
set    status=$4, current_period_end=$5;
