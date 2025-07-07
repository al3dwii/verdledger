package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/verdledger/verdledger/internal/ledger"
)

func Router() http.Handler {
	r := chi.NewRouter()
	r.Get("/v1/skus", listSKUs)
	return r
}

func listSKUs(w http.ResponseWriter, r *http.Request) {
	rows, err := ledger.DB.Query(r.Context(), `
	  SELECT
	    cloud        AS provider,
	    region,
	    sku,
	    watts,
	    usd_hour
	  FROM sku_catalogue
	`)
	if err != nil {
		http.Error(w, "db error", 500)
		return
	}
	defer rows.Close()

	type SKU struct {
		Provider string  `json:"provider"`
		Region   string  `json:"region"`
		SKU      string  `json:"sku"`
		Watts    float64 `json:"watts"`
		USDHour  float64 `json:"usd_hour"`
	}

	var out []SKU
	for rows.Next() {
		var s SKU
		_ = rows.Scan(&s.Provider, &s.Region, &s.SKU, &s.Watts, &s.USDHour)
		out = append(out, s)
	}
	_ = json.NewEncoder(w).Encode(out)
}
