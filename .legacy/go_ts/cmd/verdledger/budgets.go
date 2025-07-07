package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"os"

	"github.com/spf13/cobra"
	"github.com/verdledger/verdledger/go/client"
)

var budgetsCmd = &cobra.Command{
	Use:   "check-budget <budgets.json>",
	Short: "Fail (exit 3) if next month’s forecast exceeds CO₂/€ limits",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		raw, err := os.ReadFile(args[0])
		if err != nil {
			return err
		}
		var spec client.BudgetFile
		if err := json.Unmarshal(raw, &spec); err != nil {
			return err
		}
		c := newClient()
		res, err := c.PostV1Budgets(context.Background(), spec)
		if err != nil {
			return err
		}

		if res.JSON200.Exceeds {
			fmt.Fprintln(cmd.ErrOrStderr(), "💥 budget exceeded")
			return fs.ErrPermission
		}
		fmt.Fprintln(cmd.OutOrStdout(), "✅ within budget")
		return nil
	},
}
