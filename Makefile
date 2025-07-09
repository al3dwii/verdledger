dev:	## start db + api
	docker compose up -d db
	go run ./cmd/server

test:	## run Go tests
	go test ./... -v

cli:	## build static CLI binary
	go build -o bin/verdledger ./cmd/cli

scan: cli	## example scan run
	./bin/verdledger scan testdata/plan.json

DB_URL := postgres://postgres:postgres@localhost:54322/postgres

.PHONY: db-up db-down migrate seed

db-up:
	docker compose up -d db

db-down:
	docker compose down

migrate:
	psql $(DB_URL) -f migrations/0001_init.sql
	psql $(DB_URL) -f migrations/20250627000100_digest_view.sql
	@echo "migrations applied"

seed:
	psql $(DB_URL) -f packages/supabase-db/seed/003_seed_sku.sql
	psql $(DB_URL) -c "\copy public.sku_catalogue FROM 'packages/supabase-db/seed/sku_min.csv' CSV HEADER"
	@echo "seed data loaded"
