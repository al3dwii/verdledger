package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/spf13/cobra"
)

func cmdOptimize() *cobra.Command {
	var (
		runtime uint
		apply   bool
		apiURL  string
		token   string
	)
	c := &cobra.Command{
		Use:   "optimize",
		Short: "Suggest greener region for workload",
		RunE: func(_ *cobra.Command, args []string) error {
			cur := os.Getenv("AWS_REGION")
			cand := []string{"us-east-1", "us-west-2", "eu-west-1"}
			body, _ := json.Marshal(map[string]any{
				"cloud":             "aws",
				"current_region":    cur,
				"candidate_regions": cand,
				"runtime_hours":     runtime,
			})
			req, _ := http.NewRequest("POST", apiURL+"/v1/optimizer/suggest", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			if token != "" {
				req.Header.Set("Authorization", "Bearer "+token)
			}
			res, err := http.DefaultClient.Do(req)
			if err != nil {
				return err
			}
			defer res.Body.Close()
			var out struct {
				BestRegion string  `json:"best_region"`
				StartIso   string  `json:"start_iso"`
				KgSaved    float64 `json:"kg_saved"`
			}
			if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
				return err
			}
			fmt.Printf("Best region %s saves %.1f kg CO2\n", out.BestRegion, out.KgSaved)
			if apply {
				fmt.Printf("aws ec2 stop-instances --instance-ids i-123 && aws ec2 start-instances --region %s ...\n", out.BestRegion)
			}
			return nil
		},
	}
	c.Flags().UintVar(&runtime, "runtime", 1, "Runtime hours")
	c.Flags().BoolVar(&apply, "apply", false, "Show move command")
	c.Flags().StringVar(&apiURL, "api", "http://localhost:8080", "API base URL")
	c.Flags().StringVar(&token, "token", os.Getenv("VERDLEDGER_TOKEN"), "Bearer token")
	return c
}
