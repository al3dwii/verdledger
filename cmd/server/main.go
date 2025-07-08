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
       dsn := os.Getenv("DATABASE_URL")
       if dsn == "" {
               dsn = "postgres://postgres:postgres@localhost:54322/postgres"
       }
       if err := ledger.Connect(context.Background(), dsn); err != nil {
               log.Fatal(err)
       }
	log.Println("⇨ API on :8080")
	log.Fatal(http.ListenAndServe(":8080", api.Router()))
}
