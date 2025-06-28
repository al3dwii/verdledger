create or replace view public.v_org_weekly as
select
  org_id,
  sum(usd) as usd,
  sum(kg)  as kg
from
  public.savings_event
where
  ts >= date_trunc('week', now()) - interval '7 days'
group by org_id;
