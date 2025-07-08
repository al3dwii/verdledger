package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	opt "github.com/verdledger/optimizer/optimizer/v1"
)

type server struct {
	opt.UnimplementedSchedulerServer
}

const wattsPerVcpu = 15.0

func (s *server) Suggest(ctx context.Context, req *opt.SuggestRequest) (*opt.SuggestReply, error) {
	best := req.CurrentRegion
	bestCI := 999.0
	for _, region := range append([]string{req.CurrentRegion}, req.CandidateRegions...) {
		ci, err := fetchCI(region)
		if err != nil {
			continue
		}
		if ci < bestCI {
			bestCI = ci
			best = region
		}
	}
	kgBaseline := float64(req.RuntimeHours) * wattsPerVcpu * 1e-3 * bestCI
	kgSaved := 0.0
	if best != req.CurrentRegion {
		curCI, _ := fetchCI(req.CurrentRegion)
		kgCurrent := float64(req.RuntimeHours) * wattsPerVcpu * 1e-3 * curCI
		kgSaved = kgCurrent - kgBaseline
	}
	return &opt.SuggestReply{
		BestRegion: best,
		StartIso:   time.Now().UTC().Format(time.RFC3339),
		KgSaved:    kgSaved,
		KgBaseline: kgBaseline,
	}, nil
}

func fetchCI(zone string) (float64, error) {
	url := fmt.Sprintf("https://api.electricitymap.org/v3/carbon-intensity/latest?zone=%s", zone)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("auth-token", getenv("ELECTRICITYMAPS_TOKEN"))
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer res.Body.Close()
	var body struct {
		CarbonIntensity float64 `json:"carbonIntensity"`
	}
	_ = json.NewDecoder(res.Body).Decode(&body)
	return body.CarbonIntensity, nil
}

func getenv(k string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return ""
}

func main() {}
