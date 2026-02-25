package market

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type fakeMacroHistoryClient struct {
	points    []gct.SeriesPoint
	err       error
	lastPair  gct.Pair
	lastAsset string
}

func (f *fakeMacroHistoryClient) GetSeries(_ context.Context, pair gct.Pair, asset string, _ int) ([]gct.SeriesPoint, error) {
	f.lastPair = pair
	f.lastAsset = asset
	return f.points, f.err
}

type fakeForexHistoryClient struct {
	points []gct.SeriesPoint
	err    error
}

func (f *fakeForexHistoryClient) GetSeries(_ context.Context, _ gct.Pair, _ int) ([]gct.SeriesPoint, error) {
	return f.points, f.err
}

func TestMacroService_History_Fred(t *testing.T) {
	service := NewMacroService(
		&fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 3.2}}},
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "FRED", gct.Pair{Base: "CPIAUCSL", Quote: "USD"}, "macro", 30)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
}

func TestMacroService_History_ECB(t *testing.T) {
	service := NewMacroService(
		&fakeMacroHistoryClient{},
		&fakeForexHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 1.1}}},
	)

	points, err := service.History(context.Background(), "ECB", gct.Pair{Base: "EUR", Quote: "USD"}, "forex", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
}

func TestMacroService_History_BojPolicyAlias(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 0.1}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BOJ", gct.Pair{Base: "POLICY_RATE", Quote: "USD"}, "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base != DefaultBojPolicySeries {
		t.Fatalf("expected BOJ policy alias %s, got %s", DefaultBojPolicySeries, macro.lastPair.Base)
	}
}

func TestMacroService_History_BcbPolicyAlias(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 13.25}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BCB", gct.Pair{Base: "POLICY_RATE", Quote: "USD"}, "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base != DefaultBcbPolicySeries {
		t.Fatalf("expected BCB policy alias %s, got %s", DefaultBcbPolicySeries, macro.lastPair.Base)
	}
}

func TestMacroService_History_BanxicoSeriesPrefix(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 20.25}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BANXICO", gct.Pair{Base: "SF43718", Quote: "USD"}, "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base != "BANXICO_SF43718" {
		t.Fatalf("expected Banxico series prefix, got %s", macro.lastPair.Base)
	}
}

func TestMacroService_History_BokPolicyAlias(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 3.5}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BOK", gct.Pair{Base: "POLICY_RATE", Quote: "USD"}, "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base != DefaultBokPolicySeries {
		t.Fatalf("expected BOK policy alias %s, got %s", DefaultBokPolicySeries, macro.lastPair.Base)
	}
}

func TestMacroService_History_BcraPolicyAlias(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 29.0}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BCRA", gct.Pair{Base: "POLICY_RATE", Quote: "USD"}, "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base != DefaultBcraPolicySeries {
		t.Fatalf("expected BCRA policy alias %s, got %s", DefaultBcraPolicySeries, macro.lastPair.Base)
	}
}

func TestMacroService_History_TcmbSeriesPrefix(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 211784.46}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "TCMB", gct.Pair{Base: "TP_AB_TOPLAM", Quote: "USD"}, "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base != "TCMB_EVDS_TP_AB_TOPLAM" {
		t.Fatalf("expected TCMB series prefix, got %s", macro.lastPair.Base)
	}
}

func TestMacroService_History_RbiSeriesPrefix(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 7.1025e11}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "RBI", gct.Pair{Base: "FXRES_TR_USD_W", Quote: "USD"}, "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base != "RBI_DBIE_FXRES_TR_USD_WEEKLY" {
		t.Fatalf("expected RBI series prefix, got %s", macro.lastPair.Base)
	}
}
