create table public.activity_log (
  id       uuid primary key default gen_random_uuid(),
  repo     uuid not null ,
  ts       timestamptz not null default now(),
  actor_id uuid,   -- user or service that triggered it
  action   text,   -- 'push' | 'plan' | 'ingest' | …
  meta     jsonb
);
