package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/verdledger/verdledger/internal/api"
	"github.com/verdledger/verdledger/internal/ledger"
)

func main() {
	/* ------------------------------------------------------------------ */
	/*  Connect to Postgres                                                */
	/* ------------------------------------------------------------------ */

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:54322/postgres"
	}

	if err := ledger.Connect(context.Background(), dsn); err != nil {
		log.Fatalf("db connect: %v", err)
	}

	/* ------------------------------------------------------------------ */
	/*  Choose router (auth vs no-auth)                                    */
	/* ------------------------------------------------------------------ */

	var h http.Handler
	if os.Getenv("NO_AUTH") == "1" {
		log.Println("🔓  NO_AUTH=1 – JWT middleware disabled")
		h = api.RouterNoAuth()
	} else {
		h = api.Router()
	}

	/* ------------------------------------------------------------------ */
	/*  Start HTTP server with graceful shutdown                           */
	/* ------------------------------------------------------------------ */

	srv := &http.Server{
		Addr:    ":8080",
		Handler: h,
	}

	go func() {
		log.Println("⇨ API on :8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("http listen: %v", err)
		}
	}()

	// Wait for CTRL-C / SIGTERM
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Println("⏻  shutting down …")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = srv.Shutdown(ctx)
	if ledger.DB != nil {
		ledger.DB.Close()
	}
	log.Println("✓ graceful exit")
}
