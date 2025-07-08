package ledger

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// DB is the global pgx connection pool.
var DB *pgxpool.Pool

// Connect initialises DB once at startup.
func Connect(ctx context.Context, url string) error {
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		return err
	}
	if err = pool.Ping(ctx); err != nil {
		return err
	}
	DB = pool
	return nil
}
