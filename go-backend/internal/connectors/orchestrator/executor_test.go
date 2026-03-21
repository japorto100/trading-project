package orchestrator

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"

	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

func TestExecuteFirst_UsesFastestSuccessfulProviderAndRecordsFailure(t *testing.T) {
	planner := New(adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance", "kraken"}, Strategy: "latency_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"ws": {MaxConcurrency: 2},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"binance": {Group: "ws"},
			"kraken":  {Group: "ws"},
		},
	}))

	plan := planner.Plan("crypto_spot", []string{"binance", "kraken"})
	result, err := ExecuteFirst(context.Background(), planner, plan, func(ctx context.Context, provider string) (string, error) {
		switch provider {
		case "binance":
			time.Sleep(5 * time.Millisecond)
			return "", errors.New("timeout")
		case "kraken":
			time.Sleep(20 * time.Millisecond)
			return "ok", nil
		default:
			return "", errors.New("unexpected provider")
		}
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if result.Provider != "kraken" || result.Value != "ok" {
		t.Fatalf("expected kraken success, got %+v", result)
	}

	snapshot := planner.router.Snapshot()
	states := map[string]adaptive.ProviderState{}
	for _, state := range snapshot {
		states[state.Name] = state
	}
	if states["kraken"].Successes != 1 {
		t.Fatalf("expected kraken success count 1, got %+v", states["kraken"])
	}
	if states["binance"].FailureClasses["timeout"] != 1 {
		t.Fatalf("expected binance timeout count 1, got %+v", states["binance"])
	}
}

func TestExecuteAll_CollectsResultsAndHonorsGroupBudget(t *testing.T) {
	planner := New(adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"news_headlines": {Providers: []string{"gdelt", "rss", "finviz"}, Strategy: "freshness_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"rest": {MaxConcurrency: 1},
			"rss":  {MaxConcurrency: 1},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"gdelt":  {Group: "rest"},
			"rss":    {Group: "rss"},
			"finviz": {Group: "rest"},
		},
	}))

	plan := planner.Plan("news_headlines", []string{"gdelt", "rss", "finviz"})
	var active atomic.Int64
	var maxActive atomic.Int64
	results := ExecuteAll(context.Background(), planner, plan, func(_ context.Context, provider string) (string, error) {
		current := active.Add(1)
		for {
			observed := maxActive.Load()
			if current <= observed || maxActive.CompareAndSwap(observed, current) {
				break
			}
		}
		time.Sleep(10 * time.Millisecond)
		active.Add(-1)
		if provider == "finviz" {
			return "", errors.New("temporary upstream error")
		}
		return provider, nil
	})
	if len(results) != 3 {
		t.Fatalf("expected 3 results, got %d", len(results))
	}
	if got := maxActive.Load(); got > 1 {
		t.Fatalf("expected group budget to limit concurrency to 1, got %d", got)
	}

	snapshot := planner.router.Snapshot()
	states := map[string]adaptive.ProviderState{}
	for _, state := range snapshot {
		states[state.Name] = state
	}
	if states["gdelt"].Successes != 1 || states["rss"].Successes != 1 {
		t.Fatalf("expected gdelt/rss successes, got gdelt=%+v rss=%+v", states["gdelt"], states["rss"])
	}
	if states["finviz"].Failures != 1 {
		t.Fatalf("expected finviz failure, got %+v", states["finviz"])
	}
}
