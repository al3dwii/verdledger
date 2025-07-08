package api_test

import (
    "bytes"
    "context"
    "encoding/json"
    "net/http/httptest"
    "testing"

    "github.com/verdledger/verdledger/internal/api"
    "github.com/verdledger/verdledger/internal/ledger"
)

func TestPostEvent(t *testing.T) {
    _ = ledger.Connect(context.Background(), "postgres://postgres:postgres@localhost:54322/postgres")
    srv := httptest.NewServer(api.Router())
    defer srv.Close()

    body, _ := json.Marshal(map[string]any{
        "org_id":     1,
        "project_id": 1,
        "cloud":      "aws",
        "region":     "us-west-2",
        "sku":        "t3.medium",
        "kwh":        3.5,
        "usd":        0.04,
        "kg":         1.7,
    })
    res, err := srv.Client().Post(srv.URL+"/v1/events", "application/json", bytes.NewReader(body))
    if err != nil { t.Fatal(err) }
    if res.StatusCode != 201 { t.Fatalf("want 201 got %d", res.StatusCode) }
}
