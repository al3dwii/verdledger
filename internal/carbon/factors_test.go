package carbon_test

import (
	"testing"

	"github.com/verdledger/verdledger/internal/carbon"
)

func TestFactorLoad(t *testing.T) {
	if carbon.FactorLookup["aws"]["us-west-2"] == 0 {
		t.Fatal("factor not loaded")
	}
}
