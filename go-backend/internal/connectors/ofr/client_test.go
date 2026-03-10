package ofr

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
	var gotPath string
	var gotMnemonic string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotMnemonic = r.URL.Query().Get("mnemonic")
		_, _ = w.Write([]byte(`{
			"REPO-TRIV1_AR_OO-P":{
				"timeseries":{
					"aggregation":[
						["2026-03-03",3.67],
						["2026-03-04",3.65]
					],
					"disclosure_edits":[]
				},
				"metadata":{"mnemonic":"REPO-TRIV1_AR_OO-P"}
			}
		}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, RequestTimeout: 2 * time.Second})
	assetItem, _ := asset.New("macro")
	points, err := client.GetSeries(
		context.Background(),
		currency.NewPair(currency.NewCode("OFR_REPO-TRIV1_AR_OO-P"), currency.NewCode("USD")),
		assetItem,
		10,
	)
	if err != nil {
		t.Fatalf("GetSeries: %v", err)
	}
	if gotPath != "/series/full" {
		t.Fatalf("unexpected path %q", gotPath)
	}
	if gotMnemonic != "REPO-TRIV1_AR_OO-P" {
		t.Fatalf("unexpected mnemonic %q", gotMnemonic)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Value != 3.65 {
		t.Fatalf("expected latest-first value 3.65, got %f", points[0].Value)
	}
}

func TestGetSeries_InvalidSymbolReturnsBadRequest(t *testing.T) {
	client := NewClient(Config{})
	assetItem, _ := asset.New("macro")
	_, err := client.GetSeries(
		context.Background(),
		currency.NewPair(currency.NewCode("OFR_BAD"), currency.NewCode("USD")),
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
