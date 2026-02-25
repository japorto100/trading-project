package bok

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetSeries_ParsesECOSPayloadLatestFirst(t *testing.T) {
	var gotPath string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		_, _ = w.Write([]byte(`{"StatisticSearch":{"list_total_count":2,"row":[{"TIME":"202401","DATA_VALUE":"3.5"},{"TIME":"202402","DATA_VALUE":"3.5"}]}}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, APIKey: "sample"})
	points, err := client.GetSeries(context.Background(), gct.Pair{Base: "BOK_ECOS_722Y001_M_0101000", Quote: "USD"}, "macro", 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Value != 3.5 {
		t.Fatalf("unexpected latest value %f", points[0].Value)
	}
	if gotPath == "" {
		t.Fatal("expected request path captured")
	}
}

func TestGetSeries_MapsECOSInfo100ToUnauthorized(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"RESULT":{"CODE":"INFO-100","MESSAGE":"Invalid activation key."}}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, APIKey: "invalid"})
	_, err := client.GetSeries(context.Background(), gct.Pair{Base: "BOK_ECOS_722Y001_M_0101000", Quote: "USD"}, "macro", 1)
	if err == nil {
		t.Fatal("expected error")
	}
	if status, ok := gct.StatusCode(err); !ok || status != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized request error, got %v", err)
	}
}

func TestGetTicker_UsesPrefixedCurrency(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"StatisticSearch":{"list_total_count":1,"row":[{"TIME":"202401","DATA_VALUE":"3.5"}]}}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, APIKey: "sample"})
	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "722Y001_M_0101000", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Currency != "BOK_ECOS_722Y001_M_0101000" {
		t.Fatalf("unexpected currency %q", ticker.Currency)
	}
}

func TestParseSeriesSpec(t *testing.T) {
	tests := []struct {
		in   string
		ok   bool
		want string
	}{
		{"BOK_ECOS_722Y001_M_0101000", true, "BOK_ECOS_722Y001_M_0101000"},
		{"722Y001_M_0101000", true, "BOK_ECOS_722Y001_M_0101000"},
		{"bad", false, ""},
	}
	for _, tc := range tests {
		spec, ok := parseSeriesSpec(tc.in)
		if ok != tc.ok {
			t.Fatalf("parseSeriesSpec(%q) ok=%v want %v", tc.in, ok, tc.ok)
		}
		if ok {
			if got := buildSeriesID(spec); got != tc.want {
				t.Fatalf("buildSeriesID(%q) = %q, want %q", tc.in, got, tc.want)
			}
		}
	}
}
