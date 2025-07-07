package client

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
)

type ClientWithResponses struct {
	BaseURL   string
	Client    *http.Client
	reqEditor RequestEditorFn
}

func NewClientWithResponses(baseURL string, opts ...func(*ClientWithResponses)) (*ClientWithResponses, error) {
	c := &ClientWithResponses{BaseURL: baseURL, Client: http.DefaultClient}
	for _, opt := range opts {
		opt(c)
	}
	return c, nil
}

type RequestEditorFn func(ctx context.Context, req *http.Request) error

func WithRequestEditorFn(fn RequestEditorFn) func(*ClientWithResponses) {
	return func(c *ClientWithResponses) {
		c.reqEditor = fn
	}
}
func (c *ClientWithResponses) prepareRequest(ctx context.Context, method, url string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, c.BaseURL+url, body)
	if err != nil {
		return nil, err
	}
	if c.reqEditor != nil {
		if err := c.reqEditor(ctx, req); err != nil {
			return nil, err
		}
	}
	return req, nil
}

func (c *ClientWithResponses) PostV1EventsWithBody(ctx context.Context, contentType string, body []byte) (*http.Response, error) {
	req, err := c.prepareRequest(ctx, http.MethodPost, "/v1/events", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", contentType)
	return c.Client.Do(req)
}

type BudgetFile struct {
	Budgets []BudgetSpec `json:"budgets"`
}

type BudgetSpec struct {
	Cloud           string  `json:"cloud"`
	Region          string  `json:"region"`
	Sku             string  `json:"sku"`
	MonthlyLimitKg  float64 `json:"monthly_limit_kg"`
	MonthlyLimitUsd float64 `json:"monthly_limit_usd"`
}

type BudgetCheck struct {
	Exceeds bool `json:"exceeds"`
}

func (c *ClientWithResponses) PostV1Budgets(ctx context.Context, body BudgetFile) (*PostV1BudgetsResponse, error) {
	buf, _ := json.Marshal(body)
	req, err := c.prepareRequest(ctx, http.MethodPost, "/v1/budgets", bytes.NewReader(buf))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var out PostV1BudgetsResponse
	if resp.StatusCode == http.StatusOK {
		json.NewDecoder(resp.Body).Decode(&out.JSON200)
	}
	out.HTTPResponse = resp
	return &out, nil
}

type PostV1BudgetsResponse struct {
	JSON200      BudgetCheck
	HTTPResponse *http.Response
}
