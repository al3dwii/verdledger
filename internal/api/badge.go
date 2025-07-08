package api

import (
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

func badgeSVG(w http.ResponseWriter, r *http.Request) {
	org := chi.URLParam(r, "org")
	sum, _ := ledger.Q.OrgSummary(r.Context(), atoi64(org))

	color := "#0EA47B"
	label := "CO₂ avoided"
	value := fmt.Sprintf("%.0f kg", sum.TotalKg)

	w.Header().Set("Content-Type", "image/svg+xml")
	fmt.Fprintf(w, `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="20">`+
		`<rect width="55" height="20" fill="#555"/>`+
		`<rect x="55" width="55" height="20" fill="%s"/>`+
		`<text x="27" y="14" fill="#fff" font-size="11">%s</text>`+
		`<text x="82" y="14" fill="#fff" font-size="11">%s</text>`+
		`</svg>`,
		color, label, value)
}

func badgeJSON(w http.ResponseWriter, r *http.Request) {
	org := chi.URLParam(r, "org")
	sum, _ := ledger.Q.OrgSummary(r.Context(), atoi64(org))
	resp := map[string]any{
		"schemaVersion": 1,
		"label":         "CO₂ avoided",
		"message":       fmt.Sprintf("%.0f kg", sum.TotalKg),
		"color":         "success",
	}
	_ = json.NewEncoder(w).Encode(resp)
}
