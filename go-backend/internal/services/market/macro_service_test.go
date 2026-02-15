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
