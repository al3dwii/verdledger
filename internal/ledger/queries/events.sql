-- name: InsertEvent :one
INSERT INTO public.savings_event
  (org_id, project_id, cloud, region, sku, kwh, usd, kg, note)
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: ListEvents :many
SELECT *
FROM   public.savings_event
WHERE  org_id = $1
ORDER  BY ts DESC
LIMIT  $2
OFFSET $3;
