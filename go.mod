module github.com/verdledger/verdledger

go 1.23.0

require (
	github.com/go-chi/chi/v5 v5.2.2
	github.com/golang-jwt/jwt/v5 v5.4.2
	github.com/google/uuid v1.6.0
	github.com/hashicorp/terraform-json v1.5.0
	github.com/jackc/pgx/v5 v5.7.5
	github.com/jedib0t/go-pretty/v6 v6.4.4
	github.com/spf13/cobra v1.7.0
	github.com/sqlc-dev/pqtype v0.3.0
	github.com/stripe/stripe-go/v76 v76.0.0
	golang.org/x/oauth2 v0.30.0
)

require (
	github.com/apparentlymart/go-textseg/v15 v15.0.0 // indirect
	github.com/hashicorp/go-version v1.7.0 // indirect
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/mattn/go-runewidth v0.0.13 // indirect
	github.com/rivo/uniseg v0.2.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/zclconf/go-cty v1.16.3 // indirect
	golang.org/x/crypto v0.37.0 // indirect
	golang.org/x/sync v0.13.0 // indirect
	golang.org/x/sys v0.32.0 // indirect
	golang.org/x/text v0.24.0 // indirect
)

replace github.com/golang-jwt/jwt/v5 => /tmp/jwt

replace github.com/hashicorp/terraform-json => /tmp/terraform-json
