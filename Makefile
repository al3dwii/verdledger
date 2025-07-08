dev:	## start db + api
	docker compose up -d db
	go run ./cmd/server

test:	## run Go tests
	go test ./... -v
