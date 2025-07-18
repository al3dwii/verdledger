// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: flags.sql

package ledger

import (
	"context"
	"database/sql"
)

const flagEnabled = `-- name: FlagEnabled :one
select enabled from public.feature_flag where name=$1
`

func (q *Queries) FlagEnabled(ctx context.Context, name string) (sql.NullBool, error) {
	row := q.db.QueryRowContext(ctx, flagEnabled, name)
	var enabled sql.NullBool
	err := row.Scan(&enabled)
	return enabled, err
}
