-- +goose Up
create type role_enum as enum ('owner','admin','member');

create table public.org_user (
  user_id uuid references auth.users(id) on delete cascade,
  org_id  bigint references public.org(id) on delete cascade,
  role    role_enum not null default 'member',
  primary key (user_id, org_id)
);

create or replace view public.current_user_orgs as
select  auth.uid() as user_id,
        ou.org_id,
        ou.role
from    public.org_user ou
where   ou.user_id = auth.uid();

create policy "Self manages their row" on public.org_user
for all using (user_id = auth.uid());

create policy "Org members see projects" on public.project
for select using (
  exists (select 1 from public.current_user_orgs c
          where c.org_id = project.org_id)
);

create policy "Admins can insert/update" on public.project
for all using (
  exists (select 1 from public.current_user_orgs c
          where c.org_id = project.org_id
          and   c.role in ('owner','admin'))
);

create policy "Org members read events" on public.savings_event
for select using (
  exists (select 1 from public.current_user_orgs c
          where c.org_id = savings_event.org_id)
);

create policy "CI / CLI insert via service role" on public.savings_event
for insert with check (auth.role() = 'service_role');

alter table public.savings_event enable row level security;
alter table public.project       enable row level security;

create or replace function public.plan_allows(feature text)
returns boolean as $$
select exists (
  select 1
  from billing.org_subscription s
  join current_user_orgs c using (org_id)
  where s.status = 'active'
  and feature in (
    'core',
    case when feature = 'plugins' then 'plugins' end
  )
);
$$ language sql stable security definer;

-- +goose Down
DROP FUNCTION if exists public.plan_allows(text);
DROP VIEW if exists public.current_user_orgs;
DROP TABLE if exists public.org_user;
DROP TYPE if exists role_enum;
