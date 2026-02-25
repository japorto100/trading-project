package tcmb

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetSeries_ParsesEVDS3PayloadLatestFirst(t *testing.T) {
	var captured map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != defaultSeriesPath {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		if r.Method != http.MethodPost {
			t.Fatalf("unexpected method %s", r.Method)
		}
		if err := json.NewDecoder(r.Body).Decode(&captured); err != nil {
			t.Fatalf("decode request body: %v", err)
		}
		_, _ = w.Write([]byte(`{"totalCount":2,"items":[{"Tarih":"31-03-2023","TP_AB_TOPLAM":"122,422.00","UNIXTIME":{"$numberLong":"1680210000"}},{"Tarih":"07-04-2023","TP_AB_TOPLAM":"121,102.00","UNIXTIME":{"$numberLong":"1680814800"}}]}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	points, err := client.GetSeries(context.Background(), gct.Pair{Base: "TCMB_EVDS_TP_AB_TOPLAM", Quote: "USD"}, "macro", 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Timestamp < points[1].Timestamp {
		t.Fatalf("expected latest-first order")
	}
	if points[0].Value != 121102 {
		t.Fatalf("unexpected latest value %f", points[0].Value)
	}
	if captured["series"] != "TP.AB.TOPLAM" {
		t.Fatalf("unexpected series payload %v", captured["series"])
	}
}

func TestGetTicker_UsesCanonicalCurrency(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"totalCount":1,"items":[{"Tarih":"13-02-2026","TP_AB_TOPLAM":"211,784.46","UNIXTIME":{"$numberLong":"1739444400"}}]}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "TP_AB_TOPLAM", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Currency != "TCMB_EVDS_TP_AB_TOPLAM" {
		t.Fatalf("unexpected currency %q", ticker.Currency)
	}
}

func TestGetSeries_RejectsInvalidSeriesCode(t *testing.T) {
	client := NewClient(Config{BaseURL: "https://example.invalid"})
	_, err := client.GetSeries(context.Background(), gct.Pair{Base: "TCMB_EVDS_BAD!CODE", Quote: "USD"}, "macro", 1)
	if err == nil {
		t.Fatal("expected error")
	}
	if status, ok := gct.StatusCode(err); !ok || status != http.StatusBadRequest {
		t.Fatalf("expected bad request request-error, got %v", err)
	}
}

func TestNormalizeSeriesCode(t *testing.T) {
	tests := []struct {
		in            string
		wantAPI       string
		wantCanonical string
		ok            bool
	}{
		{"TCMB_EVDS_TP_AB_TOPLAM", "TP.AB.TOPLAM", "TCMB_EVDS_TP_AB_TOPLAM", true},
		{"TP.AB.TOPLAM", "TP.AB.TOPLAM", "TCMB_EVDS_TP_AB_TOPLAM", true},
		{"tp_ab_toplam", "TP.AB.TOPLAM", "TCMB_EVDS_TP_AB_TOPLAM", true},
		{"bad!code", "", "", false},
	}
	for _, tc := range tests {
		gotAPI, gotCanonical, ok := normalizeSeriesCode(tc.in)
		if ok != tc.ok || gotAPI != tc.wantAPI || gotCanonical != tc.wantCanonical {
			t.Fatalf("normalizeSeriesCode(%q)=(%q,%q,%v), want (%q,%q,%v)", tc.in, gotAPI, gotCanonical, ok, tc.wantAPI, tc.wantCanonical, tc.ok)
		}
	}
}
