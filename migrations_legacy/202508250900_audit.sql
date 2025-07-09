-- +goose Up
create table public.audit_request (
  id           bigserial primary key,
  org_id       bigint references public.org(id),
  period_start date,
  period_end   date,
  status       text default 'pending',           -- pending | done | error
  created_at   timestamptz default now()
);

create table public.audit_file (
  id           bigserial primary key,
  request_id   bigint references public.audit_request(id) on delete cascade,
  file_type    text,                             -- pdf | xbrl
  s3_url       text,
  size_bytes   bigint,
  created_at   timestamptz default now()
);

alter table public.audit_request enable row level security;
alter table public.audit_file    enable row level security;

create policy "Org members" on public.audit_request
  for select using (auth.uid() in
    (select user_id from public.org_user where org_id = audit_request.org_id));

create policy "Org members" on public.audit_file
  for select using (exists (select 1 from public.audit_request r
                            join public.org_user ou on ou.org_id = r.org_id
                            where r.id = audit_file.request_id and ou.user_id = auth.uid()));

-- +goose Down
drop table public.audit_file;
drop table public.audit_request;
