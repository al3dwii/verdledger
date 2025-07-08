-- name: OrgSummary :one
SELECT * FROM public.ledger_summary($1, NULL);

-- name: ProjectSummary :one
SELECT * FROM public.ledger_summary($1, $2);
