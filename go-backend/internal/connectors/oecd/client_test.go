package oecd

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

func TestGetSeries_FetchesAndParses(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{
			"dataSets":[{"series":{"0:0:0:0":{"observations":{"0":[99.1],"1":[101.3]}}}}],
			"structure":{"dimensions":{"observation":[{"id":"TIME_PERIOD","values":[{"id":"2024-Q1"},{"id":"2024-Q2"}]}]}}
		}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, RequestTimeout: 2 * time.Second})
	assetItem, _ := asset.New("macro")
	points, err := client.GetSeries(
		context.Background(),
		currency.NewPair(currency.NewCode("OECD_USA_GDP_IDX_Q"), currency.NewCode("USD")),
		assetItem,
		10,
	)
	if err != nil {
		t.Fatalf("GetSeries: %v", err)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Value != 101.3 {
		t.Fatalf("expected latest-first value 101.3, got %f", points[0].Value)
	}
}

func TestGetSeries_InvalidSymbolReturnsBadRequest(t *testing.T) {
	client := NewClient(Config{})
	assetItem, _ := asset.New("macro")
	_, err := client.GetSeries(
		context.Background(),
		currency.NewPair(currency.NewCode("OECD_USA_GDP"), currency.NewCode("USD")),
		assetItem,
		10,
	)
	if err == nil {
		t.Fatal("expected invalid symbol error")
	}
	var reqErr *gct.RequestError
	if !errors.As(err, &reqErr) {
		t.Fatalf("expected RequestError, got %T", err)
	}
	if reqErr.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", reqErr.StatusCode)
	}
}
