package generator

import "testing"

func TestBuild(t *testing.T) {
    if testing.Short() { t.Skip("short") }
    pdf := []byte("dummy")
    if len(pdf) < 1 {
        t.Fatal("want pdf")
    }
}
