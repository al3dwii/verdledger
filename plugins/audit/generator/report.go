package generator

import (
    "bytes"
    "context"
    "fmt"
    "os"
    "os/exec"
    "text/template"
    "time"

    "github.com/invopop/xbrl"
    "github.com/verdledger/verdledger/internal/ledger"
)

type TimeRange struct {
    Start time.Time
    End   time.Time
}

func Build(ctx context.Context, reqID int64, orgID int64, period TimeRange) (pdf, xbrlBytes []byte, err error) {
    sum, _ := ledger.Q.OrgSummaryPeriod(ctx, ledger.OrgSummaryPeriodParams{OrgID: orgID, Start: period.Start, End: period.End})

    // -------- PDF --------
    tplRaw, _ := templates.ReadFile("templates/report.tex")
    tpl, _ := template.New("pdf").Parse(string(tplRaw))
    var tex bytes.Buffer
    _ = tpl.Execute(&tex, map[string]any{
        "Org":   orgID,
        "Start": period.Start,
        "End":   period.End,
        "Kg":    sum.TotalKg,
        "KWh":   sum.TotalKwh,
    })
    pdf, err = latexToPDF(tex.Bytes())
    if err != nil {
        return
    }

    // -------- XBRL --------
    doc := xbrl.NewDocument("VerdLedger")
    ctxEntity := xbrl.NewEntity(fmt.Sprintf("org-%d", orgID))
    ctxPeriod := xbrl.NewPeriod(period.Start, period.End)
    ctxID := doc.AddContext(ctxEntity, ctxPeriod)

    doc.AddFact("vl:TotalCO2Avoided", sum.TotalKg, xbrl.ContextRef(ctxID))
    doc.AddFact("vl:TotalEnergyKWh", sum.TotalKwh, xbrl.ContextRef(ctxID))
    var xb bytes.Buffer
    _ = xbrl.Marshal(&xb, doc)
    xbrlBytes = xb.Bytes()
    return
}

func latexToPDF(tex []byte) ([]byte, error) {
    cmd := exec.Command("pdflatex", "-interaction=nonstopmode", "-halt-on-error")
    cmd.Stdin = bytes.NewReader(tex)
    out, err := cmd.CombinedOutput()
    if err != nil {
        return nil, fmt.Errorf("latex error: %s", string(out))
    }
    return os.ReadFile("report.pdf")
}
