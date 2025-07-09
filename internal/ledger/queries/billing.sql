-- name: UpsertSubscription :exec
insert into billing.org_subscription
(org_id, stripe_customer_id, stripe_subscription_id, status, current_period_end)
values ($1,$2,$3,$4,$5)
on conflict (org_id) do update
set stripe_subscription_id=$3,
    status=$4,
    current_period_end=$5;

-- name: MarkSubscriptionPastDue :exec
update billing.org_subscription
set status='past_due'
where stripe_subscription_id=$1;
