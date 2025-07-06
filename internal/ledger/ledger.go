package ledger

// Thin wrapper around the REST API ------------------------------------------
type Client struct{ Endpoint, ApiKey string }

func (c Client) PushEvent(org int, kg, usd float64) error {
	// call POST /v1/events (leave as TODO – easy HTTP POST)
	return nil
}
