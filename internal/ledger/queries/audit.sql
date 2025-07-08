-- name: InsertAuditRequest :one
INSERT INTO public.audit_request (org_id, period_start, period_end, status)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: InsertAuditFile :one
INSERT INTO public.audit_file (request_id, file_type, s3_url, size_bytes)
VALUES ($1, $2, $3, $4)
RETURNING *;
