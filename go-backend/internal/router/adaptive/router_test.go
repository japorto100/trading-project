package adaptive

import (
	"errors"
	"os"
	"strings"
	"testing"
	"time"

	baseconnectors "tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/groups"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
)

func TestRouter_CandidatesPrioritizeHealthyProvider(t *testing.T) {
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance", "kraken"}},
		},
	})

	router.RecordFailure("binance", errors.New("timeout"))
	router.RecordFailure("binance", errors.New("timeout"))

	candidates := router.Candidates("crypto_spot", []string{"binance", "kraken"})
	if len(candidates) != 2 {
		t.Fatalf("expected 2 candidates, got %d", len(candidates))
	}
	if candidates[0] != "kraken" {
		t.Fatalf("expected kraken first after binance failures, got %q", candidates[0])
	}
}

func TestRouter_RecordSuccessResetsCircuit(t *testing.T) {
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance"}},
		},
	})

	router.RecordFailure("binance", errors.New("timeout"))
	router.RecordFailure("binance", errors.New("timeout"))

	snap := router.Snapshot()
	if len(snap) != 1 || !snap[0].CircuitOpen {
		t.Fatalf("expected open circuit after consecutive failures, got %+v", snap)
	}

	router.RecordSuccess("binance")
	snap = router.Snapshot()
	if len(snap) != 1 {
		t.Fatalf("expected one provider in snapshot")
	}
	if snap[0].CircuitOpen {
		t.Fatal("expected circuit closed after success")
	}
	if !snap[0].Healthy {
		t.Fatal("expected provider healthy after success")
	}
}

func TestRouter_CircuitCooldownReopensCandidateOrder(t *testing.T) {
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance", "kraken"}},
		},
	})
	router.cooldown = 10 * time.Millisecond

	router.RecordFailure("binance", errors.New("timeout"))
	router.RecordFailure("binance", errors.New("timeout"))
	time.Sleep(15 * time.Millisecond)
	router.RecordSuccess("binance")

	candidates := router.Candidates("crypto_spot", []string{"binance", "kraken"})
	if len(candidates) == 0 {
		t.Fatal("expected candidates")
	}
}

func TestRouter_ProviderMetadataAppliedToSnapshot(t *testing.T) {
	enabled := true
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"macro": {Providers: []string{"fred"}},
		},
		Providers: map[string]ProviderConfig{
			"fred": {
				Group:        "G4_CentralBank_TimeSeries",
				Kind:         "timeseries",
				AuthMode:     "api_key",
				Enabled:      &enabled,
				RetryProfile: "authority_read",
				Fallbacks:    []string{"worldbank", "oecd"},
				Bridge:       "direct_http",
				Capabilities: baseconnectors.Capabilities{
					OHLCV:    true,
					Backfill: true,
				},
			},
		},
	})

	snap := router.Snapshot()
	if len(snap) != 1 {
		t.Fatalf("expected one provider, got %d", len(snap))
	}
	if got := snap[0].Group; got != "timeseries" {
		t.Fatalf("expected canonical group, got %q", got)
	}
	if got := snap[0].Kind; got != "timeseries" {
		t.Fatalf("expected kind timeseries, got %q", got)
	}
	if got := snap[0].AuthMode; got != "api_key" {
		t.Fatalf("expected auth mode api_key, got %q", got)
	}
	if !snap[0].Enabled {
		t.Fatal("expected provider enabled")
	}
	if got := snap[0].RetryProfile; got != "authority_read" {
		t.Fatalf("expected retry profile authority_read, got %q", got)
	}
	if len(snap[0].Fallbacks) != 2 || snap[0].Fallbacks[0] != "worldbank" {
		t.Fatalf("unexpected fallbacks: %+v", snap[0].Fallbacks)
	}
	if !snap[0].Capabilities.OHLCV || !snap[0].Capabilities.Backfill {
		t.Fatalf("expected capabilities metadata in snapshot, got %+v", snap[0].Capabilities)
	}
}

func TestLoadFromFile_DecodesProvidersMetadata(t *testing.T) {
	tmpDir := t.TempDir()
	cfgPath := tmpDir + "/provider-router.yaml"
	cfg := `
asset_classes:
  macro:
    providers: [fred]
    strategy: authority_first
providers:
  fred:
    group: g4_centralbank_timeseries
    kind: timeseries
    notes: FRED-compatible macro time series
    auth_mode: api_key
    enabled: true
    rate_limit_per_second: 2
    rate_limit_burst: 2
    retry_profile: authority_read
    fallbacks: [worldbank]
    bridge: direct_http
    capabilities:
      ohlcv: true
      backfill: true
`
	if err := os.WriteFile(cfgPath, []byte(strings.TrimSpace(cfg)), 0o600); err != nil {
		t.Fatalf("write config: %v", err)
	}

	router, err := LoadFromFile(cfgPath)
	if err != nil {
		t.Fatalf("load router config: %v", err)
	}
	snap := router.Snapshot()
	if len(snap) != 1 {
		t.Fatalf("expected one provider, got %d", len(snap))
	}
	if snap[0].Group != "timeseries" || snap[0].Kind != "timeseries" {
		t.Fatalf("unexpected provider metadata in snapshot: %+v", snap[0])
	}
	if snap[0].AuthMode != "api_key" || !snap[0].Enabled || snap[0].RetryProfile != "authority_read" {
		t.Fatalf("unexpected provider runtime metadata in snapshot: %+v", snap[0])
	}
	if snap[0].RateLimitPerSecond != 2 || snap[0].RateLimitBurst != 2 {
		t.Fatalf("unexpected rate limit metadata in snapshot: %+v", snap[0])
	}
	if len(snap[0].Fallbacks) != 1 || snap[0].Fallbacks[0] != "worldbank" {
		t.Fatalf("unexpected fallback metadata in snapshot: %+v", snap[0])
	}
	if !snap[0].Capabilities.OHLCV || !snap[0].Capabilities.Backfill {
		t.Fatalf("unexpected provider capabilities in snapshot: %+v", snap[0].Capabilities)
	}
}

func TestRouter_DescriptorAndDescriptorsByGroup(t *testing.T) {
	enabled := true
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"macro": {Providers: []string{"fred", "worldbank"}},
		},
		Providers: map[string]ProviderConfig{
			"fred": {
				Group:        "g4_centralbank_timeseries",
				Kind:         "timeseries",
				AuthMode:     "api_key",
				Enabled:      &enabled,
				RetryProfile: "authority_read",
				Fallbacks:    []string{"worldbank"},
			},
			"worldbank": {
				Group:   "sdmx",
				Kind:    "timeseries",
				Enabled: &enabled,
			},
		},
	})

	descriptor, ok := router.Descriptor("fred")
	if !ok {
		t.Fatal("expected descriptor for fred")
	}
	if descriptor.Group != "timeseries" || descriptor.AuthMode != "api_key" {
		t.Fatalf("unexpected descriptor: %+v", descriptor)
	}

	descriptors := router.DescriptorsByGroup("timeseries")
	if len(descriptors) != 1 || descriptors[0].Name != "fred" {
		t.Fatalf("unexpected descriptors by group: %+v", descriptors)
	}
}

func TestRouter_RecordFailureClassTracksClassCounts(t *testing.T) {
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance"}},
		},
	})

	router.RecordFailure("binance", errors.New("timeout contacting upstream"))
	router.RecordFailureWithClass("binance", errors.New("429 rate limit"), baseconnectors.ErrorClassQuota)

	snap := router.Snapshot()
	if len(snap) != 1 {
		t.Fatalf("expected one provider, got %d", len(snap))
	}
	if got := snap[0].LastErrorClass; got != baseconnectors.ErrorClassQuota {
		t.Fatalf("expected last error class quota, got %q", got)
	}
	if got := snap[0].FailureClasses[string(baseconnectors.ErrorClassTimeout)]; got != 1 {
		t.Fatalf("expected timeout failure count 1, got %d", got)
	}
	if got := snap[0].FailureClasses[string(baseconnectors.ErrorClassQuota)]; got != 1 {
		t.Fatalf("expected quota failure count 1, got %d", got)
	}

	snap[0].FailureClasses[string(baseconnectors.ErrorClassQuota)] = 99
	again := router.Snapshot()
	if got := again[0].FailureClasses[string(baseconnectors.ErrorClassQuota)]; got != 1 {
		t.Fatalf("expected snapshot to copy failureClasses map, got %d", got)
	}
}

func TestRouter_CandidatesSkipDisabledProviders(t *testing.T) {
	enabled := false
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"macro": {Providers: []string{"fred", "worldbank"}},
		},
		Providers: map[string]ProviderConfig{
			"fred": {
				Group:   "timeseries",
				Enabled: &enabled,
			},
			"worldbank": {
				Group: "sdmx",
			},
		},
	})

	candidates := router.Candidates("macro", []string{"fred", "worldbank"})
	if len(candidates) != 1 || candidates[0] != "worldbank" {
		t.Fatalf("expected only enabled worldbank candidate, got %+v", candidates)
	}
}

func TestRouter_CandidatesDoNotUnionAllowlistIntoConfiguredClass(t *testing.T) {
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance", "kraken"}},
		},
	})

	candidates := router.Candidates("crypto_spot", []string{"binance", "kraken", "coinbase"})
	if len(candidates) != 2 {
		t.Fatalf("expected configured class providers only, got %+v", candidates)
	}
	if candidates[0] != "binance" || candidates[1] != "kraken" {
		t.Fatalf("expected configured provider order preserved, got %+v", candidates)
	}
}

func TestRouter_CandidatesPreserveConfiguredAuthorityOrderOnEqualScore(t *testing.T) {
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"macro": {Providers: []string{"fred", "bcb"}, Strategy: "authority_first"},
		},
	})

	candidates := router.Candidates("macro", []string{"fred", "bcb"})
	if len(candidates) != 2 {
		t.Fatalf("expected two candidates, got %+v", candidates)
	}
	if candidates[0] != "fred" || candidates[1] != "bcb" {
		t.Fatalf("expected configured authority order fred,bcb, got %+v", candidates)
	}
}

func TestRouter_StrategyReturnsNormalizedClassStrategy(t *testing.T) {
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"crypto_spot": {
				Providers: []string{"binance"},
				Strategy:  "Latency_First",
			},
		},
	})

	if got := router.Strategy("crypto_spot"); got != "latency_first" {
		t.Fatalf("expected normalized strategy latency_first, got %q", got)
	}
}

func TestRouter_GroupPolicyReturnsNormalizedPolicy(t *testing.T) {
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance"}, Strategy: "latency_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"g2_websocket_streams": {MaxConcurrency: 3, RetryProfile: "market_stream"},
		},
		Providers: map[string]ProviderConfig{
			"binance": {Group: "g2_websocket_streams"},
		},
	})

	policy, ok := router.GroupPolicy("ws")
	if !ok {
		t.Fatal("expected ws policy")
	}
	if policy.Name != groups.WS || policy.MaxConcurrency != 3 || policy.RetryProfile != "market_stream" {
		t.Fatalf("unexpected policy: %+v", policy)
	}
}
