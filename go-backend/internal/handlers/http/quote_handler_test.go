package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type fakeQuoteClient struct {
	ticker       gct.Ticker
	err          error
	lastExchange string
	lastAsset    string
	lastPair     gct.Pair
}

func (f *fakeQuoteClient) GetTicker(_ context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error) {
	f.lastExchange = exchange
	f.lastPair = pair
	f.lastAsset = assetType

	if f.err != nil {
		return gct.Ticker{}, f.err
	}
	return f.ticker, nil
}

func TestQuoteHandler_RejectsInvalidSymbol(t *testing.T) {
	handler := QuoteHandler(&fakeQuoteClient{})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/quote?symbol=INVALID", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", response.Code)
	}
}

func TestQuoteHandler_RejectsUnsupportedExchange(t *testing.T) {
	handler := QuoteHandler(&fakeQuoteClient{})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/quote?symbol=BTC/USDT&exchange=unknown", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", response.Code)
	}
}

func TestQuoteHandler_MapsTimeoutTo504(t *testing.T) {
	handler := QuoteHandler(&fakeQuoteClient{
		err: &gct.RequestError{
			Path:    "/v1/getticker",
			Timeout: true,
		},
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/quote?symbol=BTC/USDT", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusGatewayTimeout {
		t.Fatalf("expected status 504, got %d", response.Code)
	}
}

func TestQuoteHandler_MapsUnauthorizedTo502(t *testing.T) {
	handler := QuoteHandler(&fakeQuoteClient{
		err: &gct.RequestError{
			Path:       "/v1/getticker",
			StatusCode: http.StatusUnauthorized,
		},
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/quote?symbol=BTC/USDT", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusBadGateway {
		t.Fatalf("expected status 502, got %d", response.Code)
	}
}

func TestQuoteHandler_MapsUpstreamBadRequestTo400(t *testing.T) {
	handler := QuoteHandler(&fakeQuoteClient{
		err: &gct.RequestError{
			Path:       "/ecb/daily-rates",
			StatusCode: http.StatusBadRequest,
		},
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/quote?symbol=EUR/XXX&exchange=ecb&assetType=forex", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", response.Code)
	}
}

func TestQuoteHandler_ReturnsStableContract(t *testing.T) {
	client := &fakeQuoteClient{
		ticker: gct.Ticker{
			LastUpdated: 1700000000,
			Last:        42000.5,
			Bid:         42000.0,
			Ask:         42001.0,
			High:        43000,
			Low:         41000,
			Volume:      123.45,
		},
	}
	handler := QuoteHandler(client)
	request := httptest.NewRequest(http.MethodGet, "/api/v1/quote?symbol=BTC/USDT&exchange=binance&assetType=spot", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", response.Code)
	}

	var body struct {
		Success bool   `json:"success"`
		Error   string `json:"error"`
		Data    struct {
			Symbol    string  `json:"symbol"`
			Exchange  string  `json:"exchange"`
			AssetType string  `json:"assetType"`
			Last      float64 `json:"last"`
			Bid       float64 `json:"bid"`
			Ask       float64 `json:"ask"`
			High      float64 `json:"high"`
			Low       float64 `json:"low"`
			Volume    float64 `json:"volume"`
			Timestamp int64   `json:"timestamp"`
			Source    string  `json:"source"`
		} `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success {
		t.Fatalf("expected success=true, got false with error: %s", body.Error)
	}
	if body.Data.Symbol != "BTC/USDT" {
		t.Fatalf("expected symbol BTC/USDT, got %s", body.Data.Symbol)
	}
	if body.Data.Source != "gct" {
		t.Fatalf("expected source gct, got %s", body.Data.Source)
	}
	if client.lastExchange != "Binance" {
		t.Fatalf("expected forwarded exchange Binance, got %s", client.lastExchange)
	}
	if client.lastAsset != "spot" {
		t.Fatalf("expected forwarded asset spot, got %s", client.lastAsset)
	}
	if client.lastPair.Base != "BTC" || client.lastPair.Quote != "USDT" {
		t.Fatalf("expected forwarded pair BTC/USDT, got %s/%s", client.lastPair.Base, client.lastPair.Quote)
	}
}

func TestQuoteHandler_ReturnsStableContractForECBForex(t *testing.T) {
	client := &fakeQuoteClient{
		ticker: gct.Ticker{
			LastUpdated: 1700001111,
			Last:        1.0912,
			Bid:         1.0911,
			Ask:         1.0913,
			High:        1.0912,
			Low:         1.0912,
			Volume:      0,
		},
	}
	handler := QuoteHandler(client)
	request := httptest.NewRequest(http.MethodGet, "/api/v1/quote?symbol=EUR/USD&exchange=ecb&assetType=forex", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", response.Code)
	}

	var body struct {
		Success bool   `json:"success"`
		Error   string `json:"error"`
		Data    struct {
			Symbol    string `json:"symbol"`
			Exchange  string `json:"exchange"`
			AssetType string `json:"assetType"`
			Source    string `json:"source"`
		} `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success {
		t.Fatalf("expected success=true, got false with error: %s", body.Error)
	}
	if body.Data.Symbol != "EUR/USD" {
		t.Fatalf("expected symbol EUR/USD, got %s", body.Data.Symbol)
	}
	if body.Data.Exchange != "ecb" {
		t.Fatalf("expected exchange ecb, got %s", body.Data.Exchange)
	}
	if body.Data.AssetType != "forex" {
		t.Fatalf("expected assetType forex, got %s", body.Data.AssetType)
	}
	if body.Data.Source != "ecb" {
		t.Fatalf("expected source ecb, got %s", body.Data.Source)
	}
	if client.lastExchange != "ECB" {
		t.Fatalf("expected forwarded exchange ECB, got %s", client.lastExchange)
	}
	if client.lastAsset != "forex" {
		t.Fatalf("expected forwarded asset forex, got %s", client.lastAsset)
	}
	if client.lastPair.Base != "EUR" || client.lastPair.Quote != "USD" {
		t.Fatalf("expected forwarded pair EUR/USD, got %s/%s", client.lastPair.Base, client.lastPair.Quote)
	}
}

func TestQuoteHandler_RejectsUnsupportedAssetTypeForExchange(t *testing.T) {
	handler := QuoteHandler(&fakeQuoteClient{})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/quote?symbol=EUR/USD&exchange=ecb&assetType=spot", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", response.Code)
	}
}

func TestBuildQuoteErrorMessageFallback(t *testing.T) {
	message := buildQuoteErrorMessage(errors.New("random failure"))
	if message == "" {
		t.Fatal("expected non-empty error message")
	}
}
