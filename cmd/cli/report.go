package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
    "time"

    "github.com/spf13/cobra"
)

func cmdReport() *cobra.Command {
    var startStr, endStr, apiURL, token string
    c := &cobra.Command{
        Use:   "report",
        Short: "Generate compliance report",
        RunE: func(_ *cobra.Command, args []string) error {
            start, _ := time.Parse("2006-01-02", startStr)
            end, _ := time.Parse("2006-01-02", endStr)
            // schedule
            body := fmt.Sprintf(`{"start":"%s","end":"%s"}`, start.Format("2006-01-02"), end.Format("2006-01-02"))
            req, _ := http.NewRequest("POST", apiURL+"/v1/audit", bytes.NewBufferString(body))
            req.Header.Set("Content-Type", "application/json")
            if token != "" { req.Header.Set("Authorization", "Bearer "+token) }
            res, err := http.DefaultClient.Do(req)
            if err != nil { return err }
            defer res.Body.Close()
            var out struct{ID int64 `json:"id"`}
            _ = json.NewDecoder(res.Body).Decode(&out)
            fmt.Printf("Scheduled audit #%d… polling \u231B\n", out.ID)
            // poll
            for {
                url := fmt.Sprintf("%s/v1/audit/%d", apiURL, out.ID)
                req,_ := http.NewRequest("GET", url, nil)
                if token != "" { req.Header.Set("Authorization", "Bearer "+token) }
                rs, err := http.DefaultClient.Do(req)
                if err != nil { return err }
                var s struct{Status string `json:"status"`}
                _ = json.NewDecoder(rs.Body).Decode(&s); rs.Body.Close()
                if s.Status == "done" { break }
                if s.Status == "error" { return fmt.Errorf("audit failed") }
                time.Sleep(10*time.Second)
            }
            // download
            down := func(t string) []byte {
                url := fmt.Sprintf("%s/v1/audit/%d/download/%s", apiURL, out.ID, t)
                req,_ := http.NewRequest("GET", url, nil)
                if token != "" { req.Header.Set("Authorization", "Bearer "+token) }
                resp, err := http.DefaultClient.Do(req)
                if err != nil { return nil }
                defer resp.Body.Close()
                b, _ := io.ReadAll(resp.Body)
                return b
            }
            pdf := down("pdf")
            xbrl := down("xbrl")
            os.WriteFile(fmt.Sprintf("audit-%d.pdf", out.ID), pdf, 0644)
            os.WriteFile(fmt.Sprintf("audit-%d.xbrl", out.ID), xbrl, 0644)
            fmt.Println("\u2714  files saved")
            return nil
        },
    }
    c.Flags().StringVar(&startStr,"start","","YYYY-MM-DD (inclusive)")
    c.Flags().StringVar(&endStr,"end","","YYYY-MM-DD (inclusive)")
    c.Flags().StringVar(&apiURL,"api","http://localhost:8080","API base URL")
    c.Flags().StringVar(&token,"token",os.Getenv("VERDLEDGER_TOKEN"),"Bearer token")
    return c
}
