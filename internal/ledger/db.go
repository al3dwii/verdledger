package ledger

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// DB is the global connection pool used by the API package.
var DB *pgxpool.Pool

// Connect initialises the pool once at startup.
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
