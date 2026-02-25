package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
	marketServices "tradeviewfusion/go-backend/internal/services/market"
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

func TestMacroHistoryHandler_MapsBojPolicyAlias(t *testing.T) {
	service := &fakeMacroHistoryService{
		points: []gct.SeriesPoint{{Timestamp: 1771200000, Value: 0.1}},
	}
	handler := MacroHistoryHandler(service)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=POLICY_RATE&exchange=boj&assetType=macro&limit=5", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if service.lastExchange != "BOJ" {
		t.Fatalf("expected exchange BOJ, got %s", service.lastExchange)
	}
	if service.lastPair.Base != marketServices.DefaultBojPolicySeries {
		t.Fatalf("expected alias %s, got %s", marketServices.DefaultBojPolicySeries, service.lastPair.Base)
	}
}

func TestMacroHistoryHandler_MapsBcbPolicyAlias(t *testing.T) {
	service := &fakeMacroHistoryService{
		points: []gct.SeriesPoint{{Timestamp: 1771200000, Value: 13.25}},
	}
	handler := MacroHistoryHandler(service)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=POLICY_RATE&exchange=bcb&assetType=macro&limit=5", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if service.lastExchange != "BCB" {
		t.Fatalf("expected exchange BCB, got %s", service.lastExchange)
	}
	if service.lastPair.Base != marketServices.DefaultBcbPolicySeries {
		t.Fatalf("expected alias %s, got %s", marketServices.DefaultBcbPolicySeries, service.lastPair.Base)
	}
}

func TestMacroHistoryHandler_MapsBanxicoSeriesPrefix(t *testing.T) {
	service := &fakeMacroHistoryService{
		points: []gct.SeriesPoint{{Timestamp: 1771200000, Value: 20.25}},
	}
	handler := MacroHistoryHandler(service)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=SF43718&exchange=banxico&assetType=macro&limit=5", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if service.lastExchange != "BANXICO" {
		t.Fatalf("expected exchange BANXICO, got %s", service.lastExchange)
	}
	if service.lastPair.Base != "BANXICO_SF43718" {
		t.Fatalf("expected Banxico prefix alias, got %s", service.lastPair.Base)
	}
}

func TestMacroHistoryHandler_MapsBokPolicyAlias(t *testing.T) {
	service := &fakeMacroHistoryService{
		points: []gct.SeriesPoint{{Timestamp: 1771200000, Value: 3.5}},
	}
	handler := MacroHistoryHandler(service)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=POLICY_RATE&exchange=bok&assetType=macro&limit=5", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if service.lastExchange != "BOK" {
		t.Fatalf("expected exchange BOK, got %s", service.lastExchange)
	}
	if service.lastPair.Base != marketServices.DefaultBokPolicySeries {
		t.Fatalf("expected alias %s, got %s", marketServices.DefaultBokPolicySeries, service.lastPair.Base)
	}
}

func TestMacroHistoryHandler_MapsBcraPolicyAlias(t *testing.T) {
	service := &fakeMacroHistoryService{
		points: []gct.SeriesPoint{{Timestamp: 1771200000, Value: 29.0}},
	}
	handler := MacroHistoryHandler(service)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=POLICY_RATE&exchange=bcra&assetType=macro&limit=5", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if service.lastExchange != "BCRA" {
		t.Fatalf("expected exchange BCRA, got %s", service.lastExchange)
	}
	if service.lastPair.Base != marketServices.DefaultBcraPolicySeries {
		t.Fatalf("expected alias %s, got %s", marketServices.DefaultBcraPolicySeries, service.lastPair.Base)
	}
}

func TestMacroHistoryHandler_MapsTcmbSeriesPrefix(t *testing.T) {
	service := &fakeMacroHistoryService{
		points: []gct.SeriesPoint{{Timestamp: 1771200000, Value: 211784.46}},
	}
	handler := MacroHistoryHandler(service)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=TP.AB.TOPLAM&exchange=tcmb&assetType=macro&limit=5", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if service.lastExchange != "TCMB" {
		t.Fatalf("expected exchange TCMB, got %s", service.lastExchange)
	}
	if service.lastPair.Base != "TCMB_EVDS_TP_AB_TOPLAM" {
		t.Fatalf("expected alias TCMB_EVDS_TP_AB_TOPLAM, got %s", service.lastPair.Base)
	}
}

func TestMacroHistoryHandler_MapsRbiSeriesPrefix(t *testing.T) {
	service := &fakeMacroHistoryService{
		points: []gct.SeriesPoint{{Timestamp: 1771200000, Value: 7.1025e11}},
	}
	handler := MacroHistoryHandler(service)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/macro/history?symbol=FXRES_TR_USD_W&exchange=rbi&assetType=macro&limit=5", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if service.lastExchange != "RBI" {
		t.Fatalf("expected exchange RBI, got %s", service.lastExchange)
	}
	if service.lastPair.Base != "RBI_DBIE_FXRES_TR_USD_WEEKLY" {
		t.Fatalf("expected alias RBI_DBIE_FXRES_TR_USD_WEEKLY, got %s", service.lastPair.Base)
	}
}
