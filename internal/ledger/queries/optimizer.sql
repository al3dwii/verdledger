-- name: InsertOptimizerJob :one
INSERT INTO public.optimizer_job (org_id, project_id, cloud, resources)
VALUES ($1,$2,$3,$4)
RETURNING *;

-- name: InsertOptimizerRun :one
INSERT INTO public.optimizer_run (job_id, scheduled_ts, from_region, to_region, kg_delta, usd_delta, recommended)
VALUES ($1,$2,$3,$4,$5,$6,$7)
RETURNING *;
