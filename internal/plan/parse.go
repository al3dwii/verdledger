package plan

import (
	"encoding/json"
	"os"
)

type IaCEvent struct {
	Cloud, Region, Sku string
	Kwh, Usd, Kg       float64
}

// ParseTerraform turns terraform-show-json into VerdLedger events
func ParseTerraform(path string) ([]IaCEvent, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var tf struct{ ResourceChanges []any }
	_ = json.Unmarshal(raw, &tf)

	// TODO: real parsing – stub single event for now
	return []IaCEvent{{
		Cloud: "aws", Region: "us-east-1", Sku: "t3.micro",
		Kwh: 0.2, Usd: 0.02, Kg: 0.15,
	}}, nil
}
