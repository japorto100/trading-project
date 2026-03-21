package orchestrator

import (
	"strings"

	baseconnectors "tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type Plan struct {
	AssetClass       string
	Strategy         string
	Candidates       []string
	ConcurrencyLimit int64
}

type Planner struct {
	router *adaptive.Router
}

func New(router *adaptive.Router) *Planner {
	return &Planner{router: router}
}

func (p *Planner) SetRouter(router *adaptive.Router) {
	p.router = router
}

func (p *Planner) Plan(assetClass string, fallback []string) Plan {
	candidates := cloneStrings(fallback)
	strategy := ""
	if p.router != nil {
		if resolved := p.router.Candidates(assetClass, fallback); len(resolved) > 0 {
			candidates = resolved
		}
		strategy = normalizeKey(p.router.Strategy(assetClass))
	}
	return Plan{
		AssetClass:       normalizeKey(assetClass),
		Strategy:         strategy,
		Candidates:       candidates,
		ConcurrencyLimit: p.concurrencyLimit(assetClass, strategy, candidates),
	}
}

func (p *Planner) RecordSuccess(provider string) {
	if p == nil || p.router == nil {
		return
	}
	p.router.RecordSuccess(provider)
}

func (p *Planner) RecordFailure(provider string, err error) {
	if p == nil || p.router == nil {
		return
	}
	p.router.RecordFailureWithClass(provider, err, baseconnectors.ClassifyError(err, nil))
}

func (p *Planner) concurrencyLimit(assetClass, strategy string, candidates []string) int64 {
	if len(candidates) <= 1 {
		return 1
	}
	limit := strategyConcurrencyLimit(strategy, len(candidates))
	if p == nil || p.router == nil {
		return int64(limit)
	}
	for _, provider := range candidates {
		descriptor, ok := p.router.Descriptor(provider)
		if !ok || descriptor.Group == "" {
			continue
		}
		policy, ok := p.router.GroupPolicy(descriptor.Group)
		if !ok || policy.MaxConcurrency <= 0 {
			continue
		}
		if policy.MaxConcurrency < limit {
			limit = policy.MaxConcurrency
		}
	}
	if limit < 1 {
		limit = 1
	}
	_ = assetClass
	return int64(limit)
}

func strategyConcurrencyLimit(strategy string, candidateCount int) int {
	switch normalizeKey(strategy) {
	case "latency_first":
		return min(3, candidateCount)
	case "freshness_first":
		return min(2, candidateCount)
	default:
		return 1
	}
}

func normalizeKey(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func cloneStrings(values []string) []string {
	if len(values) == 0 {
		return nil
	}
	out := make([]string, len(values))
	copy(out, values)
	return out
}
