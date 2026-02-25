package banxico

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetSeries_ParsesBanxicoPayloadAndLimitsLatestFirst(t *testing.T) {
	var gotPath string
	var gotToken string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotToken = r.Header.Get("Bmx-Token")
		_, _ = w.Write([]byte(`{"bmx":{"series":[{"idSerie":"SF43718","datos":[{"fecha":"01/02/2026","dato":"20.10"},{"fecha":"02/02/2026","dato":"20.25"},{"fecha":"03/02/2026","dato":"N/E"}]}]}}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, APIToken: "secret-token"})
	points, err := client.GetSeries(context.Background(), gct.Pair{Base: "BANXICO_SF43718", Quote: "USD"}, "macro", 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if gotPath != "/service/v1/series/SF43718/datos" {
		t.Fatalf("unexpected path %q", gotPath)
	}
	if gotToken != "secret-token" {
		t.Fatalf("expected Bmx-Token header, got %q", gotToken)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Value != 20.25 {
		t.Fatalf("expected latest-first value 20.25, got %f", points[0].Value)
	}
}

func TestGetTicker_UsesBanxicoSeriesPrefix(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"bmx":{"series":[{"idSerie":"SF43718","datos":[{"fecha":"02/02/2026","dato":"20.25"}]}]}}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL, APIToken: "token"})
	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "SF43718", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 20.25 {
		t.Fatalf("expected last 20.25, got %f", ticker.Last)
	}
	if ticker.Currency != "BANXICO_SF43718" {
		t.Fatalf("expected prefixed currency, got %q", ticker.Currency)
	}
}

func TestNormalizeSeriesID(t *testing.T) {
	tests := []struct {
		in   string
		want string
		ok   bool
	}{
		{"SF43718", "SF43718", true},
		{"BANXICO_SF43718", "SF43718", true},
		{"sf61745", "SF61745", true},
		{"BAD_ID", "", false},
	}
	for _, tc := range tests {
		got, ok := normalizeSeriesID(tc.in)
		if got != tc.want || ok != tc.ok {
			t.Fatalf("normalizeSeriesID(%q) = (%q,%v), want (%q,%v)", tc.in, got, ok, tc.want, tc.ok)
		}
	}
}

func TestGetSeries_RequiresToken(t *testing.T) {
	client := NewClient(Config{BaseURL: "http://example.test"})
	_, err := client.GetSeries(context.Background(), gct.Pair{Base: "SF43718", Quote: "USD"}, "macro", 1)
	if err == nil {
		t.Fatal("expected error without token")
	}
	if status, ok := gct.StatusCode(err); !ok || status != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized request error, got %v", err)
	}
}
