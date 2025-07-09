# ──────────────────────────────────────────────────────────────
# VerdLedger — Dev helpers
# ──────────────────────────────────────────────────────────────

# ------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------
DB_URL ?= postgres://postgres:postgres@localhost:54322/postgres?sslmode=disable

MIGRATE := migrate -path db/migrations -database $(DB_URL) -verbose

# ------------------------------------------------------------------
# Quick targets
# ------------------------------------------------------------------
dev: db-up ## start db + live API
	go run ./cmd/server
	VDL_PUBLIC_MODE=true \


test: ## run Go tests
	go test ./... -v

cli: ## build static CLI binary
	go build -o bin/verdledger ./cmd/cli

scan: cli ## example scan run
	./bin/verdledger scan testdata/plan.json

# ------------------------------------------------------------------
# Database helpers
# ------------------------------------------------------------------
.PHONY: db-up db-down db-reset migrate-up migrate-down seed

db-up:      ## start Postgres only
	docker compose up -d db

db-down:    ## stop & remove containers
	docker compose down

db-reset:
	docker compose down -v
	docker compose up -d db
	# Drop everything in case a partial schema survived
	$(MIGRATE) drop -f          # <- irreversible, deletes all objects
	$(MIGRATE) up               # fresh apply

migrate-up: ## apply newest migrations
	$(MIGRATE) up

migrate-down: ## roll back last migration
	$(MIGRATE) down 1

seed: ## load SKU seed data
	psql $(DB_URL) -c "\copy public.sku_catalogue FROM 'packages/supabase-db/seed/sku_min.csv' CSV HEADER"
	@echo "✓ seed data loaded"
