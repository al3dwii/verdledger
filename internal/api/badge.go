package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/verdledger/verdledger/internal/ledger"
)

func badgeRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/badge/{org}.svg", badgeSVG)
	r.Get("/badge/{org}.json", badgeJSON)
	return r
}

func atoi64(s string) int64 {
	i, _ := strconv.ParseInt(s, 10, 64)
	return i
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// orgTotalKg queries the events table directly to avoid depending on
// sqlc row types that may change. It returns 0 if the org has no data.
func orgTotalKg(ctx context.Context, orgID int64) float64 {
	var kg sql.NullFloat64
	err := ledger.DB.QueryRow(ctx,
		`select coalesce(sum(kg),0) from public.events where org_id = $1`, orgID).
		Scan(&kg)
	if err != nil || !kg.Valid {
		return 0
	}
	return kg.Float64
}

/* -------------------------------------------------------------------------- */
/*  Handlers                                                                   */
/* -------------------------------------------------------------------------- */

func badgeSVG(w http.ResponseWriter, r *http.Request) {
	orgID := atoi64(chi.URLParam(r, "org"))
	value := fmt.Sprintf("%.0f kg", orgTotalKg(r.Context(), orgID))

	w.Header().Set("Content-Type", "image/svg+xml")
	fmt.Fprintf(w,
		`<svg xmlns="http://www.w3.org/2000/svg" width="110" height="20">
		   <rect width="55" height="20" fill="#555"/>
		   <rect x="55" width="55" height="20" fill="#0EA47B"/>
		   <text x="27" y="14" fill="#fff" font-size="11">CO₂ avoided</text>
		   <text x="82" y="14" fill="#fff" font-size="11">%s</text>
		 </svg>`, value)
}

func badgeJSON(w http.ResponseWriter, r *http.Request) {
	orgID := atoi64(chi.URLParam(r, "org"))
	msg := fmt.Sprintf("%.0f kg", orgTotalKg(r.Context(), orgID))

	resp := map[string]any{
		"schemaVersion": 1,
		"label":         "CO₂ avoided",
		"message":       msg,
		"color":         "success",
	}
	_ = json.NewEncoder(w).Encode(resp)
}
