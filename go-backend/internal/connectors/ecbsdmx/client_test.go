package ecbsdmx

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestNormalizeCanonicalDefaultAliases(t *testing.T) {
	got := normalizeCanonical("policy_rate")
	want := seriesPrefix + defaultDataflowFM + "_" + defaultPolicyRateKey
	if got != want {
		t.Fatalf("expected %q, got %q", want, got)
	}
}

func TestParseSeriesSymbolReturnsDimensions(t *testing.T) {
	raw := seriesPrefix + "FM_M.U2.EUR.4F.KR.MRR.FR.LEV"
	flow, dims, canonical, err := parseSeriesSymbol(raw)
	if err != nil {
		t.Fatalf("expected parse to succeed, got error: %v", err)
	}
	if flow != "FM" {
		t.Fatalf("expected flow FM, got %q", flow)
	}
	if canonical != raw {
		t.Fatalf("expected canonical %q, got %q", raw, canonical)
	}
	if dims["D1"] != "M" || dims["D2"] != "U2" || dims["D8"] != "LEV" {
		t.Fatalf("unexpected dimensions: %#v", dims)
	}
}

func TestParseSeriesSymbolRejectsInvalidKey(t *testing.T) {
	_, _, _, err := parseSeriesSymbol(seriesPrefix + "FM_M.U2")
	if err == nil {
		t.Fatal("expected invalid key cardinality error")
	}
}

func TestGetSeriesRejectsUnsupportedAssetType(t *testing.T) {
	client := NewClient(Config{})
	_, err := client.GetSeries(context.Background(), gct.Pair{Base: "POLICY_RATE"}, "spot", 10)
	if err == nil {
		t.Fatal("expected unsupported assetType error")
	}
}
