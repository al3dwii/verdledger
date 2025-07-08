package carbon_test

import (
    "testing"

    "github.com/verdledger/verdledger/internal/carbon"
    "github.com/verdledger/verdledger/internal/iac"
)

func TestEstimate(t *testing.T) {
    in := []iac.Resource{{
        Provider: "aws", Region: "us-west-2",
        VCPU: 2, SKU: "t3.medium",
    }}
    r := carbon.Estimate(in)[0]
    if r.KgAnnual == 0 { t.Fatal("got 0 kg") }
}
