package carbon_test

import (
	"testing"

	"github.com/verdledger/verdledger/internal/carbon"
	"github.com/verdledger/verdledger/internal/iac"
)

func TestEstimate(t *testing.T) {
	cases := []struct{ prov, region string }{
		{"aws", "us-east-1"},
		{"aws", "us-west-2"},
		{"gcp", "europe-west1"},
		{"azure", "uksouth"},
	}
	for _, c := range cases {
		t.Run(c.prov+"/"+c.region, func(t *testing.T) {
			in := []iac.Resource{{
				Provider: c.prov, Region: c.region,
				VCPU: 2, SKU: "t3.medium",
			}}
			r := carbon.Estimate(in)[0]
			if r.KgAnnual == 0 {
				t.Fatal("got 0 kg")
			}
		})
	}
}
