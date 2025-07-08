package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/spf13/cobra"
	"github.com/verdledger/verdledger/internal/iac"
)

func cmdAdvise() *cobra.Command {
	var org, project int64
	var push bool
	var apiURL, token string
	c := &cobra.Command{
		Use:   "advise <plan.json>",
		Short: "Cost & carbon alternatives",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			res, err := iac.ParsePlan(args[0])
			if err != nil {
				return err
			}

			body, _ := json.Marshal(map[string]any{"resources": toReq(res)})
			req, _ := http.NewRequest("POST", apiURL+"/v1/advisor/advise", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			if token != "" {
				req.Header.Set("Authorization", "Bearer "+token)
			}
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				return err
			}
			defer resp.Body.Close()
			var out struct {
				Alts []struct {
					AltSku   string  `json:"alt_sku"`
					UsdPerKg float64 `json:"usd_per_kg"`
				}
			}
			_ = json.NewDecoder(resp.Body).Decode(&out)
			t := table.NewWriter()
			t.SetOutputMirror(os.Stdout)
			t.AppendHeader(table.Row{"ALT SKU", "$ per kg"})
			for _, a := range out.Alts {
				t.AppendRow(table.Row{a.AltSku, fmt.Sprintf("%.2f", a.UsdPerKg)})
			}
			t.Render()
			if push {
				fmt.Println("push not implemented")
			}
			return nil
		},
	}
	c.Flags().Int64Var(&org, "org", 0, "Org ID")
	c.Flags().Int64Var(&project, "project", 0, "Project ID")
	c.Flags().BoolVar(&push, "push", false, "Push results")
	c.Flags().StringVar(&apiURL, "api", "http://localhost:8080", "API")
	c.Flags().StringVar(&token, "token", os.Getenv("VERDLEDGER_TOKEN"), "Token")
	return c
}

func toReq(rs []iac.Resource) []map[string]string {
	var out []map[string]string
	for _, r := range rs {
		out = append(out, map[string]string{"cloud": r.Provider, "region": r.Region, "sku": r.SKU})
	}
	return out
}
