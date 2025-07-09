package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
	"github.com/verdledger/verdledger/internal/ledger"
)

func StripeWebhook(w http.ResponseWriter, r *http.Request) {
	const MaxBody = 1 << 20
	raw, _ := io.ReadAll(http.MaxBytesReader(w, r.Body, MaxBody))
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	ev, err := webhook.ConstructEvent(raw,
		r.Header.Get("Stripe-Signature"), endpointSecret)
	if err != nil {
		http.Error(w, "invalid sig", 400); return
	}

	ctx := context.Background()
	switch ev.Type {

	case "checkout.session.completed":
		var s stripe.CheckoutSession
		_ = json.Unmarshal(ev.Data.Raw, &s)
		orgID, _ := strconv.ParseInt(s.Metadata["org_id"], 10, 64)
		ledger.Q.UpsertSubscription(ctx, ledger.UpsertSubscriptionParams{
			OrgID:               orgID,
			StripeCustomerID:    s.Customer.ID,
			StripeSubscriptionID: s.Subscription.ID,
			Status:              "active",
			CurrentPeriodEnd:    time.Unix(s.ExpiresAt, 0),
		})

	case "invoice.payment_failed":
		var inv stripe.Invoice
		_ = json.Unmarshal(ev.Data.Raw, &inv)
		ledger.Q.MarkSubscriptionPastDue(ctx, inv.Subscription.ID)
	}

	w.WriteHeader(http.StatusOK)
}
