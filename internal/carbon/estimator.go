package carbon

import (
    "time"

    "github.com/verdledger/verdledger/internal/iac"
)

// Static factors for sprint-2 POC
var regionFactor = map[string]float64{
    "us-west-2": 0.409,
    "eu-west-1": 0.220,
}

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
        kg := kwh * regionFactor[r.Region]

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

