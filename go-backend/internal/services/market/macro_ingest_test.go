package market

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type fakeMacroIngestHistory struct {
	calls []struct {
		exchange string
		pair     gct.Pair
		asset    string
		limit    int
	}
}

func (f *fakeMacroIngestHistory) History(_ context.Context, exchange string, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error) {
	f.calls = append(f.calls, struct {
		exchange string
		pair     gct.Pair
		asset    string
		limit    int
	}{
		exchange: exchange,
		pair:     pair,
		asset:    assetType,
		limit:    limit,
	})
	return []gct.SeriesPoint{{Timestamp: 1, Value: 1.2}}, nil
}

func TestMacroIngestRunOnce_WritesSnapshots(t *testing.T) {
	history := &fakeMacroIngestHistory{}
	outputDir := t.TempDir()
	service := NewMacroIngestService(history, outputDir, 0)

	targets := []MacroIngestTarget{
		{Exchange: "FED", Symbol: "POLICY_RATE", Asset: "macro", Limit: 20},
		{Exchange: "ECB", Symbol: "EUR/USD", Asset: "forex", Limit: 20},
		{Exchange: "BOJ", Symbol: "POLICY_RATE", Asset: "macro", Limit: 20},
		{Exchange: "SNB", Symbol: "POLICY_RATE", Asset: "macro", Limit: 20},
	}
	if err := service.RunOnce(context.Background(), targets); err != nil {
		t.Fatalf("run once: %v", err)
	}

	expectedFiles := []string{
		"fed_fedfunds.json",
		"ecb_eur_usd.json",
		"boj_irstci01jpm156n.json",
		"snb_ir3tib01chm156n.json",
	}
	for _, file := range expectedFiles {
		if _, err := os.Stat(filepath.Join(outputDir, file)); err != nil {
			t.Fatalf("expected snapshot file %s: %v", file, err)
		}
	}
	if len(history.calls) != 4 {
		t.Fatalf("expected 4 macro calls, got %d", len(history.calls))
	}
	if history.calls[0].pair.Base != DefaultFedPolicySeries {
		t.Fatalf("expected fed series %s, got %s", DefaultFedPolicySeries, history.calls[0].pair.Base)
	}
	if history.calls[2].pair.Base != DefaultBojPolicySeries {
		t.Fatalf("expected boj series %s, got %s", DefaultBojPolicySeries, history.calls[2].pair.Base)
	}
	if history.calls[3].pair.Base != DefaultSnbPolicySeries {
		t.Fatalf("expected snb series %s, got %s", DefaultSnbPolicySeries, history.calls[3].pair.Base)
	}
}
