package iac_test

import (
    "testing"

    "github.com/verdledger/verdledger/internal/iac"
)

func TestParsePlan(t *testing.T) {
    rs, err := iac.ParsePlan("../../testdata/plan.json")
    if err != nil { t.Fatal(err) }
    if len(rs) != 1 { t.Fatalf("want 1 got %d", len(rs)) }
    if rs[0].SKU != "t3.medium" { t.Fatalf("bad SKU") }
}
