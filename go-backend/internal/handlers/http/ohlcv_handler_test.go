package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/yahoo"
)

type fakeOHLCVClient struct {
	rows    []yahoo.Candle
	err     error
	lastReq yahoo.OHLCVRequest
}

func (f *fakeOHLCVClient) GetOHLCV(_ context.Context, req yahoo.OHLCVRequest) ([]yahoo.Candle, error) {
	f.lastReq = req
	return f.rows, f.err
}

func TestOHLCVHandler_ValidatesAndReturnsContract(t *testing.T) {
	client := &fakeOHLCVClient{
		rows: []yahoo.Candle{
			{Time: 1700000600, Open: 11, High: 13, Low: 10, Close: 12, Volume: 124},
			{Time: 1700000000, Open: 10, High: 12, Low: 9, Close: 11, Volume: 123},
			{Time: 1700000000, Open: 10, High: 12, Low: 9, Close: 11.5, Volume: 999},
		},
	}
	handler := OHLCVHandler(client)

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/ohlcv?symbol=BTC/USD&timeframe=1h&limit=2&start=100&end=200",
		nil,
	)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body struct {
		Success   bool           `json:"success"`
		Symbol    string         `json:"symbol"`
		Timeframe string         `json:"timeframe"`
		Provider  string         `json:"provider"`
		Limit     int            `json:"limit"`
		Start     *int64         `json:"start"`
		End       *int64         `json:"end"`
		Count     int            `json:"count"`
		Data      []yahoo.Candle `json:"data"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}

	if !body.Success {
		t.Fatal("expected success=true")
	}
	if body.Symbol != "BTC/USD" {
		t.Fatalf("expected symbol BTC/USD, got %s", body.Symbol)
	}
	if body.Provider != "yahoo" {
		t.Fatalf("expected provider yahoo, got %s", body.Provider)
	}
	if body.Timeframe != "1H" {
		t.Fatalf("expected normalized timeframe 1H, got %s", body.Timeframe)
	}
	if body.Count != 2 {
		t.Fatalf("expected deduped count 2, got %d", body.Count)
	}
	if body.Start == nil || *body.Start != 100 {
		t.Fatalf("expected start=100, got %+v", body.Start)
	}
	if body.End == nil || *body.End != 200 {
		t.Fatalf("expected end=200, got %+v", body.End)
	}

	if len(body.Data) != 2 || body.Data[0].Time != 1700000000 || body.Data[1].Time != 1700000600 {
		t.Fatalf("expected sorted unique candles, got %+v", body.Data)
	}

	if client.lastReq.Symbol != "BTC/USD" || client.lastReq.Timeframe != "1H" || client.lastReq.Limit != 2 {
		t.Fatalf("unexpected request forwarded: %+v", client.lastReq)
	}
	if client.lastReq.Start == nil || *client.lastReq.Start != 100 {
		t.Fatalf("expected forwarded start=100, got %+v", client.lastReq.Start)
	}
	if client.lastReq.End == nil || *client.lastReq.End != 200 {
		t.Fatalf("expected forwarded end=200, got %+v", client.lastReq.End)
	}
}

func TestOHLCVHandler_RejectsInvalidParams(t *testing.T) {
	testCases := []struct {
		name   string
		url    string
		status int
	}{
		{name: "missing symbol", url: "/api/v1/ohlcv", status: http.StatusBadRequest},
		{name: "invalid limit", url: "/api/v1/ohlcv?symbol=AAPL&limit=0", status: http.StatusBadRequest},
		{name: "invalid start", url: "/api/v1/ohlcv?symbol=AAPL&start=abc", status: http.StatusBadRequest},
		{name: "invalid end", url: "/api/v1/ohlcv?symbol=AAPL&end=abc", status: http.StatusBadRequest},
		{name: "invalid range", url: "/api/v1/ohlcv?symbol=AAPL&start=10&end=10", status: http.StatusBadRequest},
	}

	handler := OHLCVHandler(&fakeOHLCVClient{})
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tc.url, nil)
			res := httptest.NewRecorder()
			handler.ServeHTTP(res, req)
			if res.Code != tc.status {
				t.Fatalf("expected status %d, got %d", tc.status, res.Code)
			}
		})
	}
}

func TestOHLCVHandler_UpstreamError(t *testing.T) {
	handler := OHLCVHandler(&fakeOHLCVClient{err: errors.New("boom")})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/ohlcv?symbol=AAPL", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusBadGateway {
		t.Fatalf("expected status 502, got %d", res.Code)
	}
}

func TestOHLCVHandler_UnavailableClient(t *testing.T) {
	handler := OHLCVHandler(nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/ohlcv?symbol=AAPL", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected status 503, got %d", res.Code)
	}
}
