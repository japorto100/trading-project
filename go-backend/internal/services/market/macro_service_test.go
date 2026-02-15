package market

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type fakeMacroHistoryClient struct {
	points []gct.SeriesPoint
	err    error
}

func (f *fakeMacroHistoryClient) GetSeries(_ context.Context, _ gct.Pair, _ string, _ int) ([]gct.SeriesPoint, error) {
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
