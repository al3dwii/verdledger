package advisor

import "context"

// Proto placeholder definitions

type Resource struct {
	Cloud  string
	Region string
	SKU    string
}

type Alt struct {
	AltSku     string
	UsdCurrent float64
	UsdAlt     float64
	KgCurrent  float64
	KgAlt      float64
	UsdPerKg   float64
}

type AdviseRequest struct{ Resources []Resource }

type AdviseReply struct{ Alts []Alt }

type UnimplementedAdvisorServer struct{}

func (UnimplementedAdvisorServer) Advise(ctx context.Context, req *AdviseRequest) (*AdviseReply, error) {
	return nil, nil
}

// AdvisorServer defines the server API for Advisor service.
type AdvisorServer interface {
	Advise(context.Context, *AdviseRequest) (*AdviseReply, error)
}
