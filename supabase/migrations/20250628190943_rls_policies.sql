-- 20250628190943_rls_policies.sql
-- ---------------------------------------------------------------------------
-- Row-Level Security + weekly summary view
-- ---------------------------------------------------------------------------

-------------------------------------------------------------------------------
-- 1 · Enable RLS (noop if already on)
alter table public.savings_event enable row level security;
alter table public.api_key       enable row level security;

-------------------------------------------------------------------------------
-- 2 · Savings-event policies
drop policy if exists org_read_events  on public.savings_event;
drop policy if exists org_insert_events on public.savings_event;

create policy org_read_events
  on public.savings_event
  for select
  to authenticated, service_role
  using (
    org_id = (
      current_setting('request.jwt.claims', true)::json ->> 'org_id'
    )::bigint
  );

create policy org_insert_events
  on public.savings_event
  for insert
  with check (
    org_id = (
      current_setting('request.jwt.claims', true)::json ->> 'org_id'
    )::bigint
  );

-------------------------------------------------------------------------------
-- 3 · API-key policies
drop policy if exists org_read_keys   on public.api_key;
drop policy if exists org_update_keys on public.api_key;
drop policy if exists org_delete_keys on public.api_key;

create policy org_read_keys
  on public.api_key
  for select
  to authenticated, service_role
  using (
    org_id = (
      current_setting('request.jwt.claims', true)::json ->> 'org_id'
    )::bigint
  );

create policy org_update_keys
  on public.api_key
  for update
  to authenticated, service_role
  using (
    org_id = (
      current_setting('request.jwt.claims', true)::json ->> 'org_id'
    )::bigint
  );

create policy org_delete_keys
  on public.api_key
  for delete
  to authenticated, service_role
  using (
    org_id = (
      current_setting('request.jwt.claims', true)::json ->> 'org_id'
    )::bigint
  );

-------------------------------------------------------------------------------
-- 4 · Weekly org-level summary view
create or replace view public.v_org_weekly as
select
  org_id,
  sum(usd) as usd,
  sum(kg)  as kg
from public.savings_event
where ts >= date_trunc('week', now()) - interval '7 days'
group by org_id;
