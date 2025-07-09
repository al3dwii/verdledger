package iac

import (
	"encoding/json"
	"os"
	"strings"

	tfjson "github.com/hashicorp/terraform-json"
)

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

// Resource is the distilled info VerdLedger needs.
type Resource struct {
	Address                 string
	Provider, Region, SKU   string
	VCPU, MemoryGB          float64
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

// ParsePlan reads a `terraform show -json` dump and returns resources.
func ParsePlan(path string) ([]Resource, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var plan tfjson.Plan
	if err = json.Unmarshal(raw, &plan); err != nil {
		return nil, err
	}

	var out []Resource

	for _, rc := range plan.ResourceChanges {
		// Only look at create or update actions.
		if !hasAction(rc.Change.Actions, "create") &&
			!hasAction(rc.Change.Actions, "update") {
			continue
		}

		// e.g. "aws_instance.web[0]"  →  provider = "aws"
		provider := strings.Split(rc.Address, "_")[0]

		// Pull a few attributes from the post-change state.
		after, _ := rc.Change.After.(map[string]any)

		az, _   := after["availability_zone"].(string) // "us-east-1a"
		region  := strings.TrimRightFunc(az, func(r rune) bool { return r >= 'a' && r <= 'z' })
		sku, _  := after["instance_type"].(string)      // "t3.micro"

		/* crude CPU / memory lookup for common AWS SKUs */
		var vcpu, mem float64
		if provider == "aws" {
			switch {
			case strings.HasPrefix(sku, "t3a."):
				vcpu, mem = 2, 4
			case strings.HasPrefix(sku, "t3."):
				vcpu, mem = 2, 4
			}
		}

		out = append(out, Resource{
			Address:  rc.Address,
			Provider: provider,
			Region:   region,
			SKU:      sku,
			VCPU:     vcpu,
			MemoryGB: mem,
		})
	}

	return out, nil
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

// hasAction returns true if the wanted verb appears in the tfjson.Actions slice.
func hasAction(acts tfjson.Actions, verb string) bool {
	for _, a := range acts {
		if string(a) == verb {
			return true
		}
	}
	return false
}
