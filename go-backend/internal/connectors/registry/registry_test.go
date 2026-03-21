package registry

import (
	"os"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/groups"
)

func TestNewNormalizesProvidersAndGroups(t *testing.T) {
	enabled := true
	reg := New(Config{
		AssetClasses: map[string]AssetClassConfig{
			"crypto_spot": {Providers: []string{"Binance", "Kraken"}, Strategy: "Latency_First"},
		},
		Groups: map[string]GroupConfig{
			"g2_websocket_streams": {MaxConcurrency: 3, RetryProfile: "market_stream"},
		},
		Providers: map[string]ProviderConfig{
			"Binance": {Group: "g2_websocket_streams", Enabled: &enabled, RetryProfile: "market_stream"},
			"Kraken":  {Group: "ws", Enabled: &enabled},
		},
	})

	descriptor, ok := reg.Descriptor("binance")
	if !ok {
		t.Fatal("expected binance descriptor")
	}
	if descriptor.Group != groups.WS || descriptor.RetryProfile != "market_stream" {
		t.Fatalf("unexpected descriptor: %+v", descriptor)
	}
	assetClass, ok := reg.AssetClass("crypto_spot")
	if !ok {
		t.Fatal("expected crypto_spot asset class")
	}
	if assetClass.Strategy != "latency_first" || len(assetClass.Providers) != 2 {
		t.Fatalf("unexpected asset class: %+v", assetClass)
	}
	policy, ok := reg.GroupPolicy(groups.WS)
	if !ok || policy.MaxConcurrency != 3 || policy.RetryProfile != "market_stream" {
		t.Fatalf("unexpected group policy: %+v", policy)
	}
}

func TestLoadFromFileDecodesRegistry(t *testing.T) {
	tmpDir := t.TempDir()
	cfgPath := tmpDir + "/provider-router.yaml"
	cfg := `
asset_classes:
  macro:
    providers: [fred]
    strategy: authority_first
groups:
  g4_centralbank_timeseries:
    max_concurrency: 1
    retry_profile: authority_read
providers:
  fred:
    group: g4_centralbank_timeseries
    enabled: true
    retry_profile: authority_read
`
	if err := os.WriteFile(cfgPath, []byte(cfg), 0o600); err != nil {
		t.Fatalf("write config: %v", err)
	}

	reg, err := LoadFromFile(cfgPath)
	if err != nil {
		t.Fatalf("load registry: %v", err)
	}
	descriptors := reg.DescriptorsByGroup("timeseries")
	if len(descriptors) != 1 || descriptors[0].Name != "fred" {
		t.Fatalf("unexpected descriptors: %+v", descriptors)
	}
	policy, ok := reg.GroupPolicy("timeseries")
	if !ok || policy.MaxConcurrency != 1 || policy.RetryProfile != "authority_read" {
		t.Fatalf("unexpected policy: %+v", policy)
	}
}
