-- ==================================================================
-- 0001_init.sql  ·  VerdLedger base schema
-- ==================================================================

-- 1. Organisations --------------------------------------------------
CREATE TABLE public.org (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Immutable ledger ----------------------------------------------
CREATE TABLE public.savings_event (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- NOTE: keep the original column name here; we rename it in 0002
  org_id  BIGINT REFERENCES public.org (id) ON DELETE CASCADE,

  ts     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cloud  TEXT,          -- 'aws' | 'gcp' | 'azure'
  region TEXT,
  sku    TEXT,
  kwh    NUMERIC,
  usd    NUMERIC,
  kg     NUMERIC,
  note   TEXT
);

-- 3. SKU catalogue --------------------------------------------------
CREATE TABLE public.sku_catalogue (
  cloud    TEXT,
  region   TEXT,
  sku      TEXT,
  watts    NUMERIC,
  usd_hour NUMERIC,
  PRIMARY KEY (cloud, region, sku)
);

-- 4. API keys for CI / Action --------------------------------------
CREATE TABLE public.api_key (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     BIGINT REFERENCES public.org (id) ON DELETE CASCADE,
  secret     TEXT UNIQUE NOT NULL,
  label      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
