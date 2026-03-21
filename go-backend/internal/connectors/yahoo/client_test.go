package yahoo

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
)

func TestClientGetQuoteSuccess(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v7/finance/quote" {
			t.Fatalf("expected /v7/finance/quote path, got %s", r.URL.Path)
		}
		if got := r.URL.Query().Get("symbols"); got != "SPY" {
			t.Fatalf("expected symbols=SPY, got %q", got)
		}
		_, _ = w.Write([]byte(`{"quoteResponse":{"result":[{"symbol":"SPY","regularMarketPrice":500.12,"regularMarketChange":1.2,"regularMarketChangePercent":0.24,"regularMarketDayHigh":501,"regularMarketDayLow":498,"regularMarketOpen":499,"regularMarketVolume":1000,"regularMarketTime":1700000000}]}}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, RequestTimeout: 2 * time.Second})
	quote, err := client.GetQuote(context.Background(), "SPY")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if quote.Symbol != "SPY" || quote.Price != 500.12 || quote.Timestamp != 1700000000 {
		t.Fatalf("unexpected quote: %+v", quote)
	}
}

func TestClientGetQuoteMapsIndexAndFXSymbols(t *testing.T) {
	tests := []struct {
		symbol string
		want   string
	}{
		{symbol: "SPX", want: "^GSPC"},
		{symbol: "EUR/USD", want: "EURUSD=X"},
		{symbol: "BTC/USD", want: "BTC-USD"},
	}
	for _, tt := range tests {
		t.Run(tt.symbol, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if got := r.URL.Query().Get("symbols"); got != tt.want {
					t.Fatalf("expected symbols=%q, got %q", tt.want, got)
				}
				_, _ = w.Write([]byte(`{"quoteResponse":{"result":[{"symbol":"` + tt.want + `","regularMarketPrice":1,"regularMarketDayHigh":1,"regularMarketDayLow":1,"regularMarketOpen":1,"regularMarketTime":1700000000}]}}`))
			}))
			defer server.Close()

			client := NewClient(Config{BaseURL: server.URL, RequestTimeout: 2 * time.Second})
			if _, err := client.GetQuote(context.Background(), tt.symbol); err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

func TestClientGetQuoteRejectsUpstreamStatus(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "upstream fail", http.StatusServiceUnavailable)
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, RequestTimeout: 2 * time.Second})
	if _, err := client.GetQuote(context.Background(), "SPY"); err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestClientGetOHLCVSuccess(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v8/finance/chart/BTC-USD" {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		if got := r.URL.Query().Get("interval"); got != "60m" {
			t.Fatalf("expected interval 60m, got %q", got)
		}
		if got := r.URL.Query().Get("range"); got == "" {
			t.Fatal("expected range query to be set")
		}
		_, _ = w.Write([]byte(`{"chart":{"result":[{"timestamp":[1700000000,1700003600],"indicators":{"quote":[{"open":[100,110],"high":[105,115],"low":[95,108],"close":[102,112],"volume":[10,12]}]}}]}}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, RequestTimeout: 2 * time.Second})
	rows, err := client.GetOHLCV(context.Background(), OHLCVRequest{
		Symbol:    "BTC/USD",
		Timeframe: "1H",
		Limit:     100,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(rows) != 2 || rows[0].Close != 102 || rows[1].Close != 112 {
		t.Fatalf("unexpected rows: %+v", rows)
	}
}

func TestClient_RegistryAwareDescriptor(t *testing.T) {
	reg := connectorregistry.New(connectorregistry.Config{
		AssetClasses: map[string]connectorregistry.AssetClassConfig{
			"quote_fallback": {Providers: []string{"yahoo"}, Strategy: "authority_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"rest": {MaxConcurrency: 2, RetryProfile: "market_read"},
		},
		Providers: map[string]connectorregistry.ProviderConfig{
			"yahoo": {Group: "rest", RetryProfile: "market_read"},
		},
	})

	client := NewClient(Config{BaseURL: "https://example.test", RequestTimeout: time.Second, Registry: reg})
	descriptor := client.ProviderDescriptor()
	if descriptor.Name != ProviderName {
		t.Fatalf("expected provider %q, got %q", ProviderName, descriptor.Name)
	}
	if descriptor.Group != "rest" {
		t.Fatalf("expected rest group, got %q", descriptor.Group)
	}
	if policy := client.GroupPolicy(); policy.Name != "rest" || policy.RetryProfile != "market_read" {
		t.Fatalf("unexpected group policy: %+v", policy)
	}
}
