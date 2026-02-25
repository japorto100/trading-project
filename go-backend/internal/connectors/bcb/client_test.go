package bcb

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetSeries_ParsesAndNormalizesLatestFirst(t *testing.T) {
	var gotPath string
	var gotFormato string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotFormato = r.URL.Query().Get("formato")
		_, _ = w.Write([]byte(`[{"data":"01/02/2026","valor":"10,00"},{"data":"02/02/2026","valor":"11,25"}]`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	points, err := client.GetSeries(context.Background(), gct.Pair{Base: "BCB_SGS_432", Quote: "USD"}, "macro", 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if gotPath != "/dados/serie/bcdata.sgs.432/dados/ultimos/2" {
		t.Fatalf("unexpected path %q", gotPath)
	}
	if gotFormato != "json" {
		t.Fatalf("expected formato=json, got %q", gotFormato)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Value != 11.25 {
		t.Fatalf("expected latest-first value 11.25, got %f", points[0].Value)
	}
}

func TestGetTicker_UsesNumericSeriesAlias(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`[{"data":"02/02/2026","valor":"13.75"}]`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "432", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 13.75 {
		t.Fatalf("expected last 13.75, got %f", ticker.Last)
	}
	if ticker.Currency != "BCB_SGS_432" {
		t.Fatalf("expected prefixed BCB currency, got %q", ticker.Currency)
	}
}

func TestNormalizeSeriesID(t *testing.T) {
	tests := []struct {
		in   string
		want string
		ok   bool
	}{
		{"432", "432", true},
		{"BCB_SGS_432", "432", true},
		{"sgs_11", "11", true},
		{"BCDATA.SGS.189", "189", true},
		{"SELIC", "", false},
	}
	for _, tc := range tests {
		got, ok := normalizeSeriesID(tc.in)
		if got != tc.want || ok != tc.ok {
			t.Fatalf("normalizeSeriesID(%q) = (%q,%v), want (%q,%v)", tc.in, got, ok, tc.want, tc.ok)
		}
	}
}
