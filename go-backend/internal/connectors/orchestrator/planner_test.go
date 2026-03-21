package orchestrator

import (
	"testing"

	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

func TestPlannerPlan_UsesRouterCandidatesAndGroupBudget(t *testing.T) {
	planner := New(adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance", "kraken"}, Strategy: "latency_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"ws": {MaxConcurrency: 1},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"binance": {Group: "ws"},
			"kraken":  {Group: "ws"},
		},
	}))

	plan := planner.Plan("crypto_spot", []string{"binance", "kraken", "coinbase"})
	if got, want := plan.Candidates, []string{"binance", "kraken"}; len(got) != len(want) || got[0] != want[0] || got[1] != want[1] {
		t.Fatalf("expected candidates %v, got %v", want, got)
	}
	if plan.ConcurrencyLimit != 1 {
		t.Fatalf("expected group budget concurrency 1, got %d", plan.ConcurrencyLimit)
	}
	if plan.Strategy != "latency_first" {
		t.Fatalf("expected strategy latency_first, got %q", plan.Strategy)
	}
}

func TestPlannerPlan_FallsBackWithoutRouter(t *testing.T) {
	planner := New(nil)

	plan := planner.Plan("macro", []string{"fred", "bcb"})
	if got, want := plan.Candidates, []string{"fred", "bcb"}; len(got) != len(want) || got[0] != want[0] || got[1] != want[1] {
		t.Fatalf("expected fallback candidates %v, got %v", want, got)
	}
	if plan.ConcurrencyLimit != 1 {
		t.Fatalf("expected default concurrency 1, got %d", plan.ConcurrencyLimit)
	}
	if plan.Strategy != "" {
		t.Fatalf("expected empty strategy without router, got %q", plan.Strategy)
	}
}
