package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/spf13/cobra"
	"github.com/verdledger/verdledger/go/client"
)

var (
	baseURL = "https://api.verdledger.cloud"
	apiKey  string
	rootCmd = &cobra.Command{
		Use:   "verdledger",
		Short: "VerdLedger CLI – commit-time carbon governance",
	}
)

func main() {
	rootCmd.PersistentFlags().StringVar(&apiKey, "token", "", "API token (env VERDLEDGER_TOKEN)")
	rootCmd.AddCommand(diffCmd, budgetsCmd)

	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}

func newClient() *client.ClientWithResponses {
	if k := os.Getenv("VERDLEDGER_TOKEN"); apiKey == "" {
		apiKey = k
	}
	c, err := client.NewClientWithResponses(baseURL,
		client.WithRequestEditorFn(func(ctx context.Context, req *http.Request) error {
			req.Header.Set("Authorization", "Bearer "+apiKey)
			return nil
		}))
	if err != nil {
		log.Fatal(err)
	}
	return c
}
