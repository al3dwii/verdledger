package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/spf13/cobra"
	"github.com/verdledger/verdledger/internal/carbon"
	"github.com/verdledger/verdledger/internal/iac"
)

func cmdScan() *cobra.Command {
	var (
		org     int64
		project int64
		push    bool
		apiURL  string
		comment bool
		ghToken string
		prID    int
	)

	c := &cobra.Command{
		Use:   "scan <plan.json>",
		Short: "Analyse a Terraform plan JSON for carbon impact",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			resources, err := iac.ParsePlan(args[0])
			if err != nil {
				return err
			}

			results := carbon.Estimate(resources)

			// ------- pretty table ----------
			t := table.NewWriter()
			t.SetOutputMirror(os.Stdout)
			t.AppendHeader(table.Row{
				"RESOURCE", "SKU", "REGION", "kWh/yr", "kg CO₂/yr"})
			for _, r := range results {
				t.AppendRow(table.Row{
					r.Address, r.SKU, r.Region,
					fmt.Sprintf("%.0f", r.KWhAnnual),
					fmt.Sprintf("%.1f", r.KgAnnual),
				})
			}
			t.Render()

			if comment && ghToken != "" && prID != 0 {
				if err := postComment(ghToken, prID, t.RenderMarkdown()); err != nil {
					return err
				}
			}

			if push {
				return pushEvents(apiURL, org, project, results)
			}
			return nil
		},
	}

	c.Flags().Int64Var(&org, "org", 0, "Org ID when pushing")
	c.Flags().Int64Var(&project, "project", 0, "Project ID when pushing")
	c.Flags().BoolVar(&push, "push", false, "Send results to VerdLedger API")
	c.Flags().StringVar(&apiURL, "api", "http://localhost:8080", "API base URL")
	c.Flags().BoolVar(&comment, "comment", false, "Comment results on GitHub PR")
	c.Flags().StringVar(&ghToken, "github-token", os.Getenv("GITHUB_TOKEN"), "GitHub token")
	c.Flags().IntVar(&prID, "pr", 0, "Pull-request number for comment")
	return c
}

func pushEvents(api string, org, project int64, results []carbon.Result) error {
	for _, r := range results {
		body, _ := json.Marshal(map[string]any{
			"org_id":     org,
			"project_id": project,
			"cloud":      r.Provider,
			"region":     r.Region,
			"sku":        r.SKU,
			"kwh":        r.KWhAnnual,
			"usd":        0,
			"kg":         r.KgAnnual,
			"note":       "cli scan",
		})
		resp, err := http.Post(api+"/v1/events",
			"application/json", io.NopCloser(
				bytes.NewReader(body)))
		if err != nil {
			return err
		}
		defer resp.Body.Close()
		if resp.StatusCode != 201 {
			return fmt.Errorf("API error %d", resp.StatusCode)
		}
	}
	fmt.Println("✔ pushed", len(results), "events")
	return nil
}
