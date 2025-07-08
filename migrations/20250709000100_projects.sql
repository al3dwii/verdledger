-- +goose Up
-- 1. Projects -------------------------------------------------
CREATE TABLE public.project (
  id         BIGSERIAL PRIMARY KEY,
  org_id     BIGINT        REFERENCES public.org(id) ON DELETE CASCADE,
  name       TEXT          NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 2. Add project_id to savings_event -------------------------
ALTER TABLE public.savings_event
  ADD COLUMN project_id BIGINT REFERENCES public.project(id) ON DELETE SET NULL;

-- 3. Replace summary helper ----------------------------------
CREATE OR REPLACE FUNCTION public.ledger_summary(
  p_org BIGINT,
  p_project BIGINT DEFAULT NULL
)
RETURNS TABLE(total_usd NUMERIC, total_kg NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(usd),0), COALESCE(SUM(kg),0)
  FROM   public.savings_event
  WHERE  org_id = p_org
    AND  (p_project IS NULL OR project_id = p_project);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- +goose Down
DROP FUNCTION public.ledger_summary(BIGINT,BIGINT);
ALTER TABLE public.savings_event DROP COLUMN project_id;
DROP TABLE public.project;
