package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/verdledger/cli/internal/ledger"
	"github.com/verdledger/cli/internal/plan"
)

func main() {
	var (
		file   = flag.String("plan", "", "terraform-plan json path")
		apiURL = flag.String("url", "https://api.verdledger.com", "Ledger API")
		apiKey = flag.String("key", os.Getenv("VERDLEDGER_API_KEY"), "API key")
		org    = flag.Int("org", 1, "Org ID")
	)
	flag.Parse()

	if *file == "" {
		fmt.Println("-plan required")
		os.Exit(1)
	}

	evts, err := plan.ParseTerraform(*file)
	if err != nil {
		panic(err)
	}

	c := ledger.Client{Endpoint: *apiURL, ApiKey: *apiKey}
	for _, e := range evts {
		if err := c.PushEvent(*org, e.Kg, e.Usd); err != nil {
			panic(err)
		}
	}
	fmt.Printf("✅ pushed %d event(s)\n", len(evts))
}
