package main

import (
	"os"

	"github.com/spf13/cobra"
)

var root = &cobra.Command{
	Use:   "verdledger",
	Short: "VerdLedger CLI – carbon-aware IaC tools",
}

func main() {
	root.AddCommand(cmdScan())
	root.AddCommand(cmdOptimize())
	root.AddCommand(cmdReport())
	root.AddCommand(cmdAdvise())
	if err := root.Execute(); err != nil {
		os.Exit(1)
	}
}
