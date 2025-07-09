-- ==================================================================
-- 0002_org_column.sql  ·  Align DB schema with API / Go structs
-- ==================================================================
BEGIN;

-- 1. rename org_id → org and allow NULLs (tests truncate org)
ALTER TABLE public.savings_event
  RENAME COLUMN org_id TO org,
  ALTER COLUMN org DROP NOT NULL;

-- 2. rebuild FK so deletes on org merely NULL the column
ALTER TABLE public.savings_event
  DROP CONSTRAINT IF EXISTS savings_event_org_id_fkey,
  ADD  CONSTRAINT savings_event_org_fkey
    FOREIGN KEY (org) REFERENCES public.org (id) ON DELETE SET NULL;

-- 3. seed a demo org for local tests / fixtures
INSERT INTO public.org (id, name)
VALUES (1, 'demo')
ON CONFLICT DO NOTHING;

COMMIT;
