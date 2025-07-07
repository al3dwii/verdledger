package main

import "testing"

func TestRootHelp(t *testing.T) {
	rootCmd.SetArgs([]string{"--help"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("help failed: %v", err)
	}
}
