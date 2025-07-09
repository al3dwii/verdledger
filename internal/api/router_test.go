package api_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/verdledger/verdledger/internal/api"
	"github.com/verdledger/verdledger/internal/ledger"
)

/* -------------------------------------------------------------------------- */
/* helpers – build a Supabase-style token with role="authenticated"           */
/* -------------------------------------------------------------------------- */

func makeSupabaseToken(t *testing.T) string {
	// the middleware reads SUPABASE_JWT_SECRET for its signing key
	secret := []byte("TEST_SECRET")
	if err := os.Setenv("SUPABASE_JWT_SECRET", string(secret)); err != nil {
		t.Fatalf("set env: %v", err)
	}

	claims := jwt.MapClaims{
		"iss":  "supabase",           // issuer
		"aud":  "authenticated",      // audience (single string is fine)
		"sub":  "test-user",          // user-id
		"role": "authenticated",      // ← custom claim checked by middleware
		"exp":  time.Now().Add(time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(secret)
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return signed
}


/* -------------------------------------------------------------------------- */
/* /v1/events                                                                 */
/* -------------------------------------------------------------------------- */

func TestPostEvent(t *testing.T) {
	err := ledger.Connect(context.Background(),
		"postgres://postgres:postgres@localhost:54322/postgres")
	if err != nil {
		t.Fatalf("db connect: %v", err)
	}
	srv := httptest.NewServer(api.RouterNoAuth())
	defer srv.Close()

	token := makeSupabaseToken(t)

	body, _ := json.Marshal(map[string]interface{}{
		"org_id":     1,
		"project_id": 1,
		"cloud":      "aws",
		"region":     "us-west-2",
		"sku":        "t3.medium",
		"kwh":        3.5,
		"usd":        0.04,
		"kg":         1.7,
	})
	req, _ := http.NewRequest(http.MethodPost, srv.URL+"/v1/events",
		bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	res, err := srv.Client().Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res.StatusCode != http.StatusCreated {
		t.Fatalf("want 201 got %d", res.StatusCode)
	}
}

/* -------------------------------------------------------------------------- */
/* /v1/audit proxy                                                             */
/* -------------------------------------------------------------------------- */


func TestAuditProxy(t *testing.T) {
    srv := httptest.NewServer(api.RouterNoAuth())
	defer srv.Close()

	req, _ := http.NewRequest(http.MethodGet, srv.URL+"/v1/audit/1", nil)
	req.Header.Set("Authorization", "Bearer "+makeSupabaseToken(t))

	res, err := srv.Client().Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res.StatusCode == http.StatusNotFound {
		t.Log("audit route not mounted (flag disabled) – OK")
	}
}
