package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	stripe "github.com/stripe/stripe-go/v76"
	webhook "github.com/stripe/stripe-go/v76/webhook"
	"github.com/verdledger/verdledger/internal/api/middleware"
	"github.com/verdledger/verdledger/internal/ledger"
)

/* -------------------------------------------------------------------------- */
/*  Router                                                                     */
/* -------------------------------------------------------------------------- */



func Router() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.JWT)

	r.Get("/api/me", getMe)
	r.Get("/v1/skus", listSKUs)
	r.Post("/v1/events", postEvent)
	r.Get("/v1/summary", getSummary)
	r.Post("/webhook/stripe", stripeWebhook)

	r.With(middleware.RequireFlag("realtime_grid_optimizer")).
		Post("/v1/optimizer/suggest", optimizerSuggest)
	r.With(middleware.RequireFlag("finops_greenops_advisor")).
		Post("/v1/advisor/advise", advisorAdvise)
	r.With(middleware.RequireFlag("audit_pdf_exporter")).
		Mount("/v1/audit/", auditProxy())

	r.Mount("/", badgeRouter())
	return r
}



// RouterNoAuth is for unit-tests: same routes, no JWT middleware.
func RouterNoAuth() http.Handler {
	r := chi.NewRouter()

	// identical handler tree, but omit r.Use(middleware.JWT)
	r.Get("/api/me", getMe)
	r.Get("/v1/skus", listSKUs)
	r.Post("/v1/events", postEvent)
	r.Get("/v1/summary", getSummary)
	r.Post("/webhook/stripe", stripeWebhook)

	r.With(middleware.RequireFlag("realtime_grid_optimizer")).
		Post("/v1/optimizer/suggest", optimizerSuggest)
	r.With(middleware.RequireFlag("finops_greenops_advisor")).
		Post("/v1/advisor/advise", advisorAdvise)
	r.With(middleware.RequireFlag("audit_pdf_exporter")).
		Mount("/v1/audit/", auditProxy())

	r.Mount("/", badgeRouter())
	return r
}


/* -------------------------------------------------------------------------- */
/*  /v1/skus                                                                   */
/* -------------------------------------------------------------------------- */

func listSKUs(w http.ResponseWriter, r *http.Request) {
	rows, err := ledger.DB.Query(r.Context(), `
		SELECT cloud, region, sku, watts, usd_hour
		FROM   public.sku_catalogue
		LIMIT  200`)
	if err != nil { http.Error(w, err.Error(), 500); return }
	defer rows.Close()

	type SKU struct {
		Provider string  `json:"provider"`
		Region   string  `json:"region"`
		SKU      string  `json:"sku"`
		Watts    float64 `json:"watts"`
		USDHour  float64 `json:"usd_hour"`
	}
	var out []SKU
	for rows.Next() {
		var s SKU
		_ = rows.Scan(&s.Provider, &s.Region, &s.SKU, &s.Watts, &s.USDHour)
		out = append(out, s)
	}
	_ = json.NewEncoder(w).Encode(out)
}

/* -------------------------------------------------------------------------- */
/*  /v1/events                                                                 */
/* -------------------------------------------------------------------------- */

func postEvent(w http.ResponseWriter, r *http.Request) {
	var body struct {
		OrgID     int64   `json:"org_id"`
		ProjectID int64   `json:"project_id"`
		Cloud     string  `json:"cloud"`
		Region    string  `json:"region"`
		SKU       string  `json:"sku"`
		KWh       float64 `json:"kwh"`
		USD       float64 `json:"usd"`
		KG        float64 `json:"kg"`
		Note      string  `json:"note"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	ev, err := ledger.Q.InsertEvent(r.Context(), ledger.InsertEventParams{
		OrgID:     sql.NullInt64{Int64: body.OrgID,     Valid: body.OrgID != 0},
		ProjectID: sql.NullInt64{Int64: body.ProjectID, Valid: body.ProjectID != 0},
		Cloud:     sql.NullString{String: body.Cloud,   Valid: body.Cloud  != ""},
		Region:    sql.NullString{String: body.Region,  Valid: body.Region != ""},
		Sku:       sql.NullString{String: body.SKU,     Valid: body.SKU    != ""},
		Kwh:       sql.NullString{String: fmt.Sprintf("%f", body.KWh), Valid: body.KWh != 0},
		Usd:       sql.NullString{String: fmt.Sprintf("%f", body.USD), Valid: body.USD != 0},
		Kg:        sql.NullString{String: fmt.Sprintf("%f", body.KG),  Valid: body.KG  != 0},
		Note:      sql.NullString{String: body.Note,    Valid: body.Note   != ""},
	})
	if err != nil { http.Error(w, err.Error(), 500); return }

	w.WriteHeader(201)
	_ = json.NewEncoder(w).Encode(ev)
}

/* -------------------------------------------------------------------------- */
/*  /v1/summary                                                                */
/* -------------------------------------------------------------------------- */

func getSummary(w http.ResponseWriter, r *http.Request) {
	orgID, err := strconv.ParseInt(r.URL.Query().Get("org"), 10, 64)
	if err != nil { http.Error(w, "missing org", 400); return }

	if p := r.URL.Query().Get("project"); p != "" {

				// --- inside getSummary (project branch) ---
		pid, _ := strconv.ParseInt(p, 10, 64)

		row, err := ledger.Q.ProjectSummary(r.Context(), ledger.ProjectSummaryParams{
			POrg:     orgID,
			PProject: pid,
		})
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		_ = json.NewEncoder(w).Encode(row)
		return
	}

	row, err := ledger.Q.OrgSummary(r.Context(), orgID)
	if err != nil { http.Error(w, err.Error(), 500); return }
	_ = json.NewEncoder(w).Encode(row)
}

/* -------------------------------------------------------------------------- */
/*  Stripe webhook                                                             */
/* -------------------------------------------------------------------------- */

func stripeWebhook(w http.ResponseWriter, r *http.Request) {
	body, _ := io.ReadAll(r.Body)
	ev, err := webhook.ConstructEvent(body,
		r.Header.Get("Stripe-Signature"),
		os.Getenv("STRIPE_WEBHOOK_SECRET"))
	if err != nil { http.Error(w, err.Error(), 400); return }

	switch ev.Type {

	case "checkout.session.completed":
		var s stripe.CheckoutSession
		_ = json.Unmarshal(ev.Data.Raw, &s)
		orgID, _ := strconv.ParseInt(s.Metadata["org_id"], 10, 64)

		_ = ledger.Q.UpsertSubscription(r.Context(), ledger.UpsertSubscriptionParams{
			OrgID:                orgID,
			StripeCustomerID:     sql.NullString{String: s.Customer.ID,     Valid: true},
			StripeSubscriptionID: sql.NullString{String: s.Subscription.ID, Valid: true},
			Status:               sql.NullString{String: "active",          Valid: true},
			CurrentPeriodEnd:     sql.NullTime  {Time: time.Unix(s.ExpiresAt, 0), Valid: true},
		})

	case "invoice.payment_failed":
		var inv stripe.Invoice
		_ = json.Unmarshal(ev.Data.Raw, &inv)
		_ = ledger.Q.MarkSubscriptionPastDue(r.Context(),
			sql.NullString{String: inv.Subscription.ID, Valid: true})
	}
	w.WriteHeader(200)
}

/* -------------------------------------------------------------------------- */
/*  /api/me                                                                    */
/* -------------------------------------------------------------------------- */

func getMe(w http.ResponseWriter, r *http.Request) {
	uid, _ := r.Context().Value(middleware.CtxUID).(string)

	rows, err := ledger.DB.Query(r.Context(), `
		SELECT o.id, o.name, COALESCE(s.status,''), cu.role
		FROM   public.org o
		JOIN   public.org_user cu ON cu.org_id = o.id
		LEFT   JOIN billing.org_subscription s ON s.org_id = o.id
		WHERE  cu.user_id = $1`, uid)
	if err != nil { http.Error(w, err.Error(), 500); return }
	defer rows.Close()

	type Org struct {
		ID   int64  `json:"id"`
		Name string `json:"name"`
		Plan string `json:"plan"`
		Role string `json:"role"`
	}
	var resp struct {
		UserID string `json:"user_id"`
		Orgs   []Org  `json:"orgs"`
	}
	resp.UserID = uid
	for rows.Next() {
		var o Org
		_ = rows.Scan(&o.ID, &o.Name, &o.Plan, &o.Role)
		resp.Orgs = append(resp.Orgs, o)
	}
	_ = json.NewEncoder(w).Encode(resp)
}

/* -------------------------------------------------------------------------- */
/*  Plugin stubs / proxies                                                     */
/* -------------------------------------------------------------------------- */

func optimizerSuggest(w http.ResponseWriter, _ *http.Request) {
	http.Error(w, "optimizer unavailable", 503)
}
func advisorAdvise(w http.ResponseWriter, _ *http.Request) {
	http.Error(w, "advisor unavailable", 503)
}

func auditProxy() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dst := "http://audit:8080" + r.URL.Path
		req, _ := http.NewRequest(r.Method, dst, r.Body)
		req.Header = r.Header

		resp, err := http.DefaultClient.Do(req)
		if err != nil { http.Error(w, err.Error(), 502); return }
		defer resp.Body.Close()

		for k, vv := range resp.Header {
			for _, v := range vv { w.Header().Add(k, v) }
		}
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	})
}
