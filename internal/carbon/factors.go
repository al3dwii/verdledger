package carbon

import (
	_ "embed"
	"encoding/csv"
	"strconv"
	"strings"
)

//go:embed data/carbon_factors_2025.csv
var csvBytes []byte

// FactorLookup[provider][region] = kg / kWh
var FactorLookup = map[string]map[string]float64{}

func init() {
	r := csv.NewReader(strings.NewReader(string(csvBytes)))
	_, _ = r.Read() // header
	for {
		rec, err := r.Read()
		if err != nil {
			break
		}
		prov, reg, kg := rec[0], rec[1], rec[2]
		val, _ := strconv.ParseFloat(kg, 64)
		if _, ok := FactorLookup[prov]; !ok {
			FactorLookup[prov] = map[string]float64{}
		}
		FactorLookup[prov][reg] = val
	}
}
