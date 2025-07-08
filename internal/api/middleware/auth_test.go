package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func TestJWT(t *testing.T) {
	os.Setenv("SUPABASE_JWT_SECRET", "test")
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  "u1",
		"role": "authenticated",
	})
	s, _ := tok.SignedString([]byte("test"))

	var uid, role string
	handler := JWT(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		uid = r.Context().Value(CtxUID).(string)
		role = r.Context().Value(CtxRole).(string)
		w.WriteHeader(200)
	}))

	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+s)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != 200 {
		t.Fatalf("want 200 got %d", rr.Code)
	}
	if uid != "u1" || role != "authenticated" {
		t.Fatalf("bad ctx %s %s", uid, role)
	}
}
