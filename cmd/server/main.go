package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/verdledger/verdledger/internal/api"
	"github.com/verdledger/verdledger/internal/ledger"
)

func main() {
	if err := ledger.Connect(context.Background(), os.Getenv("DATABASE_URL")); err != nil {
		log.Fatal(err)
	}
	log.Println("⇨ API on :8080")
	log.Fatal(http.ListenAndServe(":8080", api.Router()))
}
