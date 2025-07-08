package optimizer

import "context"

// Placeholder definitions for proto messages and service interface

type SuggestRequest struct {
	Cloud            string
	CurrentRegion    string
	CandidateRegions []string
	RuntimeHours     uint32
}

type SuggestReply struct {
	BestRegion string
	StartIso   string
	KgSaved    float64
	KgBaseline float64
}

type UnimplementedSchedulerServer struct{}

func (UnimplementedSchedulerServer) Suggest(ctx context.Context, req *SuggestRequest) (*SuggestReply, error) {
	return nil, nil
}

// SchedulerServer defines the server API for Scheduler service.
type SchedulerServer interface {
	Suggest(context.Context, *SuggestRequest) (*SuggestReply, error)
}
