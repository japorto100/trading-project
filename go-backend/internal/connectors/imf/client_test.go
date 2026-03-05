package imf

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

func TestNormalizeCanonical_PolicyRate(t *testing.T) {
	got := normalizeCanonical("POLICY_RATE")
	want := seriesPrefix + "M_111_FITB"
	if got != want {
		t.Fatalf("normalizeCanonical(POLICY_RATE) = %q, want %q", got, want)
	}
}

func TestNormalizeCanonical_AlreadyPrefixed(t *testing.T) {
	got := normalizeCanonical("IMF_IFS_M_111_FITB")
	if got != "IMF_IFS_M_111_FITB" {
		t.Fatalf("normalizeCanonical(IMF_IFS_M_111_FITB) = %q, want IMF_IFS_M_111_FITB", got)
	}
}

func TestParseSeriesSymbol_ReturnsDimensions(t *testing.T) {
	dims, canonical, err := parseSeriesSymbol("IMF_IFS_M_111_FITB")
	if err != nil {
		t.Fatalf("parseSeriesSymbol: %v", err)
	}
	if dims["FREQ"] != "M" || dims["REF_AREA"] != "111" || dims["INDICATOR"] != "FITB" {
		t.Fatalf("unexpected dimensions: %#v", dims)
	}
	if canonical != "IMF_IFS_M_111_FITB" {
		t.Fatalf("canonical = %q, want IMF_IFS_M_111_FITB", canonical)
	}
}

func TestParseSeriesSymbol_RejectsInvalidCardinality(t *testing.T) {
	_, _, err := parseSeriesSymbol("IMF_IFS_M_111")
	if err == nil {
		t.Fatal("expected error for invalid key cardinality")
	}
}

func TestGetSeries_RejectsUnsupportedAssetType(t *testing.T) {
	client := NewClient(Config{})
	spotItem, _ := asset.New("spot")
	_, err := client.GetSeries(context.Background(), currency.NewPair(currency.NewCode("IMF_IFS_M_111_FITB"), currency.NewCode("USD")), spotItem, 10)
	if err == nil {
		t.Fatal("expected unsupported assetType error")
	}
}

func TestGetSeries_FetchesAndParses(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{
			"dataSets":[{"series":{"0:0:0":{"observations":{"0":[5.25],"1":[5.50]}}}}],
			"structure":{"dimensions":{"observation":[{"id":"TIME_PERIOD","values":[{"id":"2024-01-01"},{"id":"2024-02-01"}]}]}}
		}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, RequestTimeout: 2 * time.Second})
	assetItem, _ := asset.New("macro")
	points, err := client.GetSeries(context.Background(), currency.NewPair(currency.NewCode("IMF_IFS_M_111_FITB"), currency.NewCode("USD")), assetItem, 10)
	if err != nil {
		t.Fatalf("GetSeries: %v", err)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Value != 5.50 {
		t.Fatalf("expected latest-first value 5.50, got %f", points[0].Value)
	}
}

func TestGetTicker_ReturnsLatestValue(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{
			"dataSets":[{"series":{"0:0:0":{"observations":{"0":[4.75]}}}}],
			"structure":{"dimensions":{"observation":[{"id":"TIME_PERIOD","values":[{"id":"2024-03-01"}]}]}}
		}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, RequestTimeout: 2 * time.Second})
	assetItem, _ := asset.New("macro")
	ticker, err := client.GetTicker(context.Background(), currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), assetItem)
	if err != nil {
		t.Fatalf("GetTicker: %v", err)
	}
	if ticker.Last != 4.75 {
		t.Fatalf("expected last 4.75, got %f", ticker.Last)
	}
	if ticker.Currency != "IMF_IFS_M_111_FITB" {
		t.Fatalf("expected currency IMF_IFS_M_111_FITB, got %q", ticker.Currency)
	}
}
