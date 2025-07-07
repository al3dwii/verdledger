package main

import (
	"context"
	"io"
	"os"

	"github.com/spf13/cobra"
)

var diffCmd = &cobra.Command{
	Use:   "diff <plan.json>",
	Short: "Show Δ kWh / kg / USD for a Terraform or Pulumi plan",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		plan, err := os.ReadFile(args[0])
		if err != nil {
			return err
		}
		c := newClient()
		resp, err := c.PostV1EventsWithBody(context.Background(), "application/json", plan)
		if err != nil {
			return err
		}
		defer resp.Body.Close()
		out, _ := io.ReadAll(resp.Body)
		_, _ = cmd.OutOrStdout().Write(out)
		return nil
	},
}
