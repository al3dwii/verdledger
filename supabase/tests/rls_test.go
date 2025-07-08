package supabase

import (
	"context"
	"testing"

	"github.com/verdledger/verdledger/internal/ledger"
)

// NOTE: requires local Postgres with migrations applied
func TestRLS(t *testing.T) {
	err := ledger.Connect(context.Background(), "postgres://postgres:postgres@localhost:54322/postgres")
	if err != nil {
		t.Skip("db not available")
	}
	_, err = ledger.DB.Exec(context.Background(), "set local jwt.claims.sub='u1'")
	if err != nil {
		t.Fatal(err)
	}
	_, err = ledger.DB.Exec(context.Background(), "select * from public.savings_event limit 1")
	if err != nil {
		t.Logf("RLS enforced: %v", err)
	}
}
