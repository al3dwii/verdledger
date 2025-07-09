-- no IF NOT EXISTS needed; migrate never re-runs an applied file
CREATE TABLE public.org (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.savings_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id BIGINT REFERENCES public.org(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cloud  TEXT,
  region TEXT,
  sku    TEXT,
  kwh NUMERIC,
  usd NUMERIC,
  kg  NUMERIC,
  note TEXT
);

CREATE TABLE public.sku_catalogue (
  cloud TEXT,
  region TEXT,
  sku TEXT,
  watts NUMERIC,
  usd_hour NUMERIC,
  PRIMARY KEY (cloud, region, sku)
);

CREATE TABLE public.api_key (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id BIGINT REFERENCES public.org(id) ON DELETE CASCADE,
  secret TEXT UNIQUE NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
