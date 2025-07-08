package api

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	stripe "github.com/stripe/stripe-go/v76"
	"github.com/verdledger/verdledger/internal/api/middleware"
	"github.com/verdledger/verdledger/internal/ledger"
)

// Router builds the API handle tree.
func Router() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.JWT)

	r.Get("/api/me", getMe)
	r.Get("/v1/skus", listSKUs)
	r.Post("/v1/events", postEvent)
	r.Get("/v1/summary", getSummary)
	r.Post("/webhook/stripe", stripeWebhook)

       r.With(middleware.RequireFlag("realtime_grid_optimizer")).Post("/v1/optimizer/suggest", optimizerSuggest)

       r.With(middleware.RequireFlag("audit_pdf_exporter")).Mount("/v1/audit/", auditProxy())


       r.Mount("/", badgeRouter())

       return r
}

// -------- /v1/skus ------------------------------------------

func listSKUs(w http.ResponseWriter, r *http.Request) {
	rows, err := ledger.DB.Query(r.Context(), `
        SELECT cloud, region, sku, watts, usd_hour
        FROM   public.sku_catalogue
        LIMIT  200
    `)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

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

// -------- /v1/events ----------------------------------------

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
	ev, err := ledger.Q.InsertEvent(r.Context(),
		ledger.InsertEventParams{
			OrgID:     body.OrgID,
			ProjectID: body.ProjectID,
			Cloud:     body.Cloud,
			Region:    body.Region,
			Sku:       body.SKU,
			Kwh:       body.KWh,
			Usd:       body.USD,
			Kg:        body.KG,
			Note:      body.Note,
		})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(201)
	_ = json.NewEncoder(w).Encode(ev)
}

// -------- /v1/summary ---------------------------------------

func getSummary(w http.ResponseWriter, r *http.Request) {
	orgStr := r.URL.Query().Get("org")
	if orgStr == "" {
		http.Error(w, "missing org", 400)
		return
	}
	orgID, _ := strconv.ParseInt(orgStr, 10, 64)

	projectStr := r.URL.Query().Get("project")
	var sum ledger.ProjectSummaryRow
	var err error
	if projectStr == "" {
		sum, err = ledger.Q.OrgSummary(r.Context(), orgID)
	} else {
		pid, _ := strconv.ParseInt(projectStr, 10, 64)
		sum, err = ledger.Q.ProjectSummary(r.Context(),
			ledger.ProjectSummaryParams{OrgID: orgID, ProjectID: pid})
	}
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	_ = json.NewEncoder(w).Encode(sum)
}

// -------- /webhook/stripe -----------------------------------
func stripeWebhook(w http.ResponseWriter, r *http.Request) {
	payload, _ := io.ReadAll(r.Body)
	sigHeader := r.Header.Get("Stripe-Signature")
	event, err := stripe.ConstructEvent(payload, sigHeader, os.Getenv("STRIPE_WEBHOOK_SECRET"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "checkout.session.completed":
		var s stripe.CheckoutSession
		_ = json.Unmarshal(event.Data.Raw, &s)
		orgID, _ := strconv.ParseInt(s.Metadata["org_id"], 10, 64)
		ledger.Q.UpsertSubscription(r.Context(), ledger.UpsertSubscriptionParams{
			OrgID:                orgID,
			StripeCustomerID:     s.Customer.ID,
			StripeSubscriptionID: s.Subscription.ID,
			Status:               "active",
			CurrentPeriodEnd:     time.Unix(s.ExpiresAt, 0),
		})
	case "invoice.payment_failed":
		// mark as past_due …
	}
	w.WriteHeader(http.StatusOK)
}

// -------- /api/me -------------------------------------------
func getMe(w http.ResponseWriter, r *http.Request) {
	uid, _ := r.Context().Value(middleware.CtxUID).(string)
	rows, err := ledger.DB.Query(r.Context(), `
        select o.id, o.name, coalesce(s.status,'') as plan, cu.role
        from public.org o
        join public.org_user cu on cu.org_id = o.id
        left join billing.org_subscription s on s.org_id = o.id
        where cu.user_id = $1
        `, uid)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	type Org struct {
		ID   int64  `json:"id"`
		Name string `json:"name"`
		Plan string `json:"plan"`
		Role string `json:"role"`
	}
	var out struct {
		UserID string `json:"user_id"`
		Orgs   []Org  `json:"orgs"`
	}
	out.UserID = uid
	for rows.Next() {
		var o Org
		_ = rows.Scan(&o.ID, &o.Name, &o.Plan, &o.Role)
		out.Orgs = append(out.Orgs, o)
	}
	_ = json.NewEncoder(w).Encode(out)
}

// -------- /v1/optimizer/suggest -------------------------------
func optimizerSuggest(w http.ResponseWriter, r *http.Request) {
        // proxy request to optimizer plugin (stub)
        http.Error(w, "optimizer unavailable", http.StatusServiceUnavailable)
}

// -------- /v1/audit/* proxy -------------------------------
func auditProxy() http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
               // very small proxy to audit service at http://audit:8080
               url := "http://audit:8080" + r.URL.Path
               req, _ := http.NewRequest(r.Method, url, r.Body)
               req.Header = r.Header
               resp, err := http.DefaultClient.Do(req)
               if err != nil {
                       http.Error(w, err.Error(), 502)
                       return
               }
               defer resp.Body.Close()
               for k, vv := range resp.Header {
                       for _, v := range vv {
                               w.Header().Add(k, v)
                       }
               }
               w.WriteHeader(resp.StatusCode)
               io.Copy(w, resp.Body)
       })
}
