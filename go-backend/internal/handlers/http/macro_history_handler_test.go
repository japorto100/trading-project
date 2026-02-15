package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type fakeMacroHistoryService struct {
	points       []gct.SeriesPoint
	err          error
	lastExchange string
	lastPair     gct.Pair
	lastAsset    string
	lastLimit    int
}

func (f *fakeMacroHistoryService) History(_ context.Context, exchange string, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error) {
	f.lastExchange = exchange
	f.lastPair = pair
	f.lastAsset = assetType
	f.lastLimit = limit
	if f.err != nil {
		return nil, f.err
	}
	return f.points, nil
}

func TestMacroHistoryHandler_ReturnsFredSeries(t *testing.T) {
	service := &fakeMacroHistoryService{
		points: []gct.SeriesPoint{{Timestamp: 1771200000, Value: 3.2}},
	}
	handler := MacroHistoryHandler(service)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=CPIAUCSL&exchange=fred&assetType=macro&limit=10", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if service.lastExchange != "FRED" {
		t.Fatalf("expected FRED exchange, got %s", service.lastExchange)
	}
	if service.lastPair.Base != "CPIAUCSL" {
		t.Fatalf("expected CPIAUCSL base, got %s", service.lastPair.Base)
	}

	var body struct {
		Success bool `json:"success"`
		Data    struct {
			Symbol string `json:"symbol"`
		} `json:"data"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success {
		t.Fatal("expected success true")
	}
	if body.Data.Symbol != "CPIAUCSL" {
		t.Fatalf("expected symbol CPIAUCSL, got %s", body.Data.Symbol)
	}
}

func TestMacroHistoryHandler_RejectsInvalidAssetType(t *testing.T) {
	handler := MacroHistoryHandler(&fakeMacroHistoryService{})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=CPIAUCSL&exchange=fred&assetType=spot", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", res.Code)
	}
}
