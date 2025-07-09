-- +goose Up
create table public.advisor_run (
  id         bigserial primary key,
  org_id     bigint references public.org(id),
  project_id bigint references public.project(id),
  ts         timestamptz default now(),
  note       text
);

create table public.advisor_alt (
  run_id        bigint references public.advisor_run(id) on delete cascade,
  current_sku   text,
  alt_sku       text,
  cloud         text,
  region        text,
  usd_current   numeric,
  usd_alt       numeric,
  kg_current    numeric,
  kg_alt        numeric,
  usd_per_kg    numeric,
  primary key (run_id, current_sku, alt_sku)
);

alter table public.advisor_run enable row level security;
alter table public.advisor_alt enable row level security;

create policy "Org read own advisor" on public.advisor_run
  for select using (exists (select 1 from public.current_user_orgs c
                            where c.org_id = advisor_run.org_id));

create policy "Org read alt" on public.advisor_alt
  for select using (exists (select 1 from public.advisor_run r
                            join public.current_user_orgs c
                              on c.org_id = r.org_id
                           where r.id = advisor_alt.run_id));

insert into public.feature_flag values ('finops_greenops_advisor', false);
-- +goose Down
DROP TABLE public.advisor_alt;
DROP TABLE public.advisor_run;
