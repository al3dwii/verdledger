package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	opt "github.com/verdledger/optimizer/optimizer/v1"
)

func routes(s opt.SchedulerServer) http.Handler {
	r := mux.NewRouter()
	r.HandleFunc("/v1/optimizer/suggest", func(w http.ResponseWriter, r *http.Request) {
		var req opt.SuggestRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}
		res, err := s.Suggest(r.Context(), &req)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		_ = json.NewEncoder(w).Encode(res)
	}).Methods("POST")
	return r
}
