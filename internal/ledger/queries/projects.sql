-- name: CreateProject :one
INSERT INTO public.project (org_id, name)
VALUES ($1, $2)
RETURNING *;
