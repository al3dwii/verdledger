package middleware

import (
	"net/http"

	"github.com/verdledger/verdledger/internal/ledger"
)

func RequireFlag(name string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			enabled, _ := ledger.Q.FlagEnabled(r.Context(), name)
			if !enabled {
				http.Error(w, "feature disabled", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
