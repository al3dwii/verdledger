package middleware

import (
	"database/sql"
	"net/http"

	"github.com/verdledger/verdledger/internal/ledger"
)

// RequireFlag blocks the request unless the named feature flag is TRUE.
func RequireFlag(name string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			// sqlc generated:  FlagEnabled(ctx, flagName) (sql.NullBool, error)
			enabled, err := ledger.Q.FlagEnabled(ctx, name)
			if err != nil {
				http.Error(w, "flag lookup error", http.StatusInternalServerError)
				return
			}

			if !isTrue(enabled) {
				http.Error(w, "feature flag disabled", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// isTrue treats NULL as false.
func isTrue(b sql.NullBool) bool { return b.Valid && b.Bool }
