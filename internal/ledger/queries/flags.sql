-- name: FlagEnabled :one
select enabled from public.feature_flag where name=$1;
