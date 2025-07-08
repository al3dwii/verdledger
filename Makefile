dev:	## start db + api
	docker compose up -d db
	go run ./cmd/server

test:	## run Go tests
	go test ./... -v

cli:	## build static CLI binary
	go build -o bin/verdledger ./cmd/cli

scan: cli	## example scan run
	./bin/verdledger scan testdata/plan.json
