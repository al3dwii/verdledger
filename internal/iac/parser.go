package iac

import (
    "encoding/json"
    "os"
    "strings"

    tfjson "github.com/hashicorp/terraform-json"
)

// Resource is the distilled info VerdLedger needs.
type Resource struct {
    Address string
    Provider, Region, SKU string
    VCPU, MemoryGB        float64
}

// ParsePlan reads a "terraform show -json" dump and returns resources.
func ParsePlan(path string) ([]Resource, error) {
    raw, err := os.ReadFile(path)
    if err != nil { return nil, err }

    var plan tfjson.Plan
    if err = json.Unmarshal(raw, &plan); err != nil { return nil, err }

    var out []Resource
    for _, rc := range plan.ResourceChanges {
        // Only look at "create" or "update" actions
        if !contains(rc.Change.Actions, "create") &&
            !contains(rc.Change.Actions, "update") {
            continue
        }

        // Example address: aws_instance.web[0]
        provider := strings.Split(rc.Address, "_")[0]

        // Try to pull instance_type and region
        after := rc.Change.After.(map[string]any)
        region, _ := after["availability_zone"].(string)
        sku, _    := after["instance_type"].(string)

        // VERY rough CPU/memory extraction for AWS EC2
        var vcpu, mem float64
        if provider == "aws" && sku != "" {
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

func contains(arr []string, v string) bool {
    for _, a := range arr { if a == v { return true } }
    return false
}

