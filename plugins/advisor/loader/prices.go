package loader

import (
	"encoding/csv"
	"os"
	"strings"

	"github.com/shopspring/decimal"
)

type Price struct {
	Cloud   string
	Region  string
	SKU     string
	USDHour decimal.Decimal
}

type key struct{ Cloud, Region, SKU string }

// LoadPrices reads an Infracost CSV snapshot into a lookup map.
func LoadPrices(path string) map[key]Price {
	f, err := os.Open(path)
	if err != nil {
		return nil
	}
	defer f.Close()
	r := csv.NewReader(f)
	r.FieldsPerRecord = -1
	_, _ = r.Read() // header
	out := map[key]Price{}
	for {
		rec, err := r.Read()
		if err != nil {
			break
		}
		p := Price{Cloud: rec[0], Region: rec[1], SKU: rec[2]}
		p.USDHour, _ = decimal.NewFromString(strings.TrimSpace(rec[3]))
		out[key{p.Cloud, p.Region, p.SKU}] = p
	}
	return out
}
