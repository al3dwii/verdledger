package carbon

import (
	"time"

	"github.com/verdledger/verdledger/internal/iac"
)

const wattsPerVCpu = 15

type Result struct {
	iac.Resource
	KWhAnnual float64
	KgAnnual  float64
}

// Estimate converts CPU → kWh → kg CO₂ (1 yr 24×7).
func Estimate(rs []iac.Resource) []Result {
	var out []Result
	hoursYear := 24 * 365

	for _, r := range rs {
		watts := r.VCPU * wattsPerVCpu
		kwh := (watts * float64(hoursYear)) / 1000
		regionMap := FactorLookup[r.Provider]
		kgPerKwh := regionMap[r.Region]
		kwhFactor := kgPerKwh
		kg := kwh * kwhFactor

		out = append(out, Result{
			Resource:  r,
			KWhAnnual: kwh,
			KgAnnual:  kg,
		})
	}
	return out
}

// Timestamp helper for events
func NowUTC() time.Time { return time.Now().UTC() }
