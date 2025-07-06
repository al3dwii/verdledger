package plan

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

func TestGoldenTerraform(t *testing.T) {
	got, _ := ParseTerraform("../../testdata/aws-plan.json")
	golden, _ := os.ReadFile("../../testdata/aws-plan.golden")
	exp := strings.TrimSpace(string(golden))

	if g, _ := json.MarshalIndent(got, "", "  "); strings.TrimSpace(string(g)) != exp {
		t.Fatalf("plan drift:\n%s", g)
	}
}
