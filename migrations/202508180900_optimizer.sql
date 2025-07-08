-- +goose Up
create table public.optimizer_job (
  id           bigserial primary key,
  org_id       bigint references public.org(id) on delete cascade,
  project_id   bigint references public.project(id),
  cloud        text,
  resources    jsonb,
  created_at   timestamptz default now(),
  status       text default 'pending'
);

create table public.optimizer_run (
  id           bigserial primary key,
  job_id       bigint references public.optimizer_job(id) on delete cascade,
  scheduled_ts timestamptz,
  from_region  text,
  to_region    text,
  kg_delta     numeric,
  usd_delta    numeric,
  recommended  boolean,
  created_at   timestamptz default now()
);

alter table public.optimizer_job  enable row level security;
alter table public.optimizer_run  enable row level security;

create policy "Org members" on public.optimizer_job
  for select using (exists (select 1 from public.current_user_orgs c where c.org_id = org_id));

create policy "Org members" on public.optimizer_run
  for select using (exists (select 1 from public.current_user_orgs c where c.org_id =
    (select org_id from public.optimizer_job j where j.id = job_id)));

-- +goose Down
drop table public.optimizer_run;
drop table public.optimizer_job;
