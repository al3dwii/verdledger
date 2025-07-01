-- Check catalog seeded
select count(*) as sku_rows from public.sku_catalogue;

-- RPC vs manual sum
with manual as (
  select coalesce(sum(usd),0) as usd, coalesce(sum(kg),0) as kg
  from public.savings_event where org_id = 1
)
select
  l.total_usd = m.usd and l.total_kg = m.kg as summary_match
from manual m, public.ledger_summary(1) l;
