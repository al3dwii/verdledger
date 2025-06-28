-- 1. Organisations -------------------------------------------
create table public.org (
  id         bigserial primary key,
  name       text        not null,
  created_at timestamptz not null default now()
);

-- 2. Immutable ledger ----------------------------------------
create table public.savings_event (
  id      uuid primary key default gen_random_uuid(),
  org_id  bigint      references public.org(id) on delete cascade,
  ts      timestamptz not null default now(),
  cloud   text,            -- 'aws' | 'gcp' | 'azure'
  region  text,
  sku     text,
  kwh     numeric,
  usd     numeric,
  kg      numeric,
  note    text
);

-- 3. SKU catalogue -------------------------------------------
create table public.sku_catalogue (
  cloud     text,
  region    text,
  sku       text,
  watts     numeric,
  usd_hour  numeric,
  primary key (cloud, region, sku)
);

-- 4. API keys for CI / Action --------------------------------
create table public.api_key (
  id         uuid primary key default gen_random_uuid(),
  org_id     bigint      references public.org(id) on delete cascade,
  secret     text unique not null,
  label      text,
  created_at timestamptz not null default now()
);
