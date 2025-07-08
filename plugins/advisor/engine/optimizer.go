package engine

import (
	"github.com/shopspring/decimal"
	"github.com/verdledger/advisor/loader"
)

// Resource represents a running instance with cost and carbon factors.
type Resource struct {
	Cloud  string
	Region string
	SKU    string
	Price  decimal.Decimal
	Factor decimal.Decimal
}

type Alt struct {
	AltSKU     string
	USDCurrent decimal.Decimal
	USDAlt     decimal.Decimal
	KgCurrent  decimal.Decimal
	KgAlt      decimal.Decimal
	USDPerKg   decimal.Decimal
}

type key struct{ Cloud, Region, SKU string }

// similarFamily returns candidate SKUs in same family. Placeholder stub.
func similarFamily(sku string) []string { return []string{sku} }

// BestValue picks alternative with lowest $ per kg.
func BestValue(cur Resource, prices map[key]loader.Price, factors map[key]float64) Alt {
	best := Alt{USDPerKg: decimal.NewFromFloat(1e9)}
	for _, sku := range similarFamily(cur.SKU) {
		price := prices[key{cur.Cloud, cur.Region, sku}].USDHour
		factor := decimal.NewFromFloat(factors[key{cur.Cloud, cur.Region, sku}])
		usdKg := price.Div(factor)
		if usdKg.LessThan(best.USDPerKg) {
			best = Alt{
				AltSKU: sku, USDAlt: price, KgAlt: factor,
				USDPerKg:   usdKg,
				USDCurrent: cur.Price, KgCurrent: cur.Factor,
			}
		}
	}
	return best
}
