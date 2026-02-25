package adaptive

import (
	"errors"
	"os"
	"strings"
	"testing"
	"time"

	baseconnectors "tradeviewfusion/go-backend/internal/connectors/base"
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
	router := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"macro": {Providers: []string{"fred"}},
		},
		Providers: map[string]ProviderConfig{
			"fred": {
				Group: "G4_CentralBank_TimeSeries",
				Kind:  "timeseries",
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
	if got := snap[0].Group; got != "g4_centralbank_timeseries" {
		t.Fatalf("expected normalized group, got %q", got)
	}
	if got := snap[0].Kind; got != "timeseries" {
		t.Fatalf("expected kind timeseries, got %q", got)
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
	if snap[0].Group != "g4_centralbank_timeseries" || snap[0].Kind != "timeseries" {
		t.Fatalf("unexpected provider metadata in snapshot: %+v", snap[0])
	}
	if !snap[0].Capabilities.OHLCV || !snap[0].Capabilities.Backfill {
		t.Fatalf("unexpected provider capabilities in snapshot: %+v", snap[0].Capabilities)
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
