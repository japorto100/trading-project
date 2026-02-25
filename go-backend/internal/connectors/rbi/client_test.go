package rbi

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetSeries_FetchesDBIEFXReservesAndParsesLatestFirst(t *testing.T) {
	var handshakeCalls int
	var dataCalls int
	var capturedBody map[string]any

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case sessionTokenPath:
			handshakeCalls++
			if r.Method != http.MethodPost {
				t.Fatalf("unexpected handshake method %s", r.Method)
			}
			w.Header().Set("Authorization", "test-session-token")
			w.Header().Add("Set-Cookie", "TSTEST=abc123; Path=/")
			_, _ = w.Write([]byte(`{"header":{"status":"success"}}`))
		case fxReservesPath:
			dataCalls++
			if got := r.Header.Get("Authorization"); got != "test-session-token" {
				t.Fatalf("missing forwarded auth header, got %q", got)
			}
			if got := r.Header.Get("channelkey"); got != defaultChannel {
				t.Fatalf("missing channelkey, got %q", got)
			}
			if cookie := r.Header.Get("Cookie"); !strings.Contains(cookie, "TSTEST=abc123") {
				t.Fatalf("missing forwarded cookie, got %q", cookie)
			}
			if err := json.NewDecoder(r.Body).Decode(&capturedBody); err != nil {
				t.Fatalf("decode request body: %v", err)
			}
			// HTML-escaped JSON body mirrors real RBI gateway behavior.
			_, _ = w.Write([]byte(`&#x7b;&quot;header&quot;&#x3a;&#x7b;&quot;status&quot;&#x3a;&quot;success&quot;&#x7d;&#x2c;&quot;body&quot;&#x3a;&#x7b;&quot;resultList&quot;&#x3a;&#x5b;&#x7b;&quot;timeDate&quot;&#x3a;1700000000000,&quot;amount&quot;&#x3a;700.5&#x7d;&#x2c;&#x7b;&quot;timeDate&quot;&#x3a;1700600000000,&quot;amount&quot;&#x3a;710.25&#x7d;&#x5d;&#x7d;&#x7d;`))
		default:
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	points, err := client.GetSeries(context.Background(), gct.Pair{Base: "RBI_DBIE_FXRES_TR_USD_WEEKLY", Quote: "USD"}, "macro", 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if handshakeCalls != 1 || dataCalls != 1 {
		t.Fatalf("expected 1 handshake and 1 data call, got %d/%d", handshakeCalls, dataCalls)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Timestamp < points[1].Timestamp {
		t.Fatalf("expected latest-first order")
	}
	if points[0].Value != 710.25 {
		t.Fatalf("unexpected latest value %f", points[0].Value)
	}
	bodyMap, ok := capturedBody["body"].(map[string]any)
	if !ok {
		t.Fatalf("expected body envelope in request payload, got %#v", capturedBody)
	}
	if bodyMap["reserveCode"] != "TR" || bodyMap["currencyCode"] != "USD" || bodyMap["frequency"] != "Weekly" {
		t.Fatalf("unexpected RBI payload body %#v", bodyMap)
	}
}

func TestGetTicker_UsesCanonicalCurrency(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case sessionTokenPath:
			w.Header().Set("Authorization", "tok")
			w.Header().Add("Set-Cookie", "TSX=1; Path=/")
			_, _ = w.Write([]byte(`{"header":{"status":"success"}}`))
		case fxReservesPath:
			_, _ = w.Write([]byte(`&#x7b;&quot;header&quot;&#x3a;&#x7b;&quot;status&quot;&#x3a;&quot;success&quot;&#x7d;&#x2c;&quot;body&quot;&#x3a;&#x7b;&quot;resultList&quot;&#x3a;&#x5b;&#x7b;&quot;timeDate&quot;&#x3a;1700600000000,&quot;amount&quot;&#x3a;710.25&#x7d;&#x5d;&#x7d;&#x7d;`))
		default:
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "FXRES_TR_USD_WEEKLY", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Currency != "RBI_DBIE_FXRES_TR_USD_WEEKLY" {
		t.Fatalf("unexpected currency %q", ticker.Currency)
	}
}

func TestGetSeries_RejectsInvalidSeries(t *testing.T) {
	client := NewClient(Config{BaseURL: "https://example.invalid"})
	_, err := client.GetSeries(context.Background(), gct.Pair{Base: "RBI_DBIE_BAD!", Quote: "USD"}, "macro", 1)
	if err == nil {
		t.Fatal("expected error")
	}
	if status, ok := gct.StatusCode(err); !ok || status != http.StatusBadRequest {
		t.Fatalf("expected bad request, got %v", err)
	}
}

func TestNormalizeSeriesSpec(t *testing.T) {
	tests := []struct {
		in   string
		want string
		ok   bool
	}{
		{"RBI_DBIE_FXRES_TR_USD_WEEKLY", "RBI_DBIE_FXRES_TR_USD_WEEKLY", true},
		{"FXRES_TR_USD_WEEKLY", "RBI_DBIE_FXRES_TR_USD_WEEKLY", true},
		{"tr_usd_w", "RBI_DBIE_FXRES_TR_USD_WEEKLY", true},
		{"RBI_DBIE_FXRES_TR_USD_MONTHLY", "RBI_DBIE_FXRES_TR_USD_MONTHLY", true},
		{"RBI_DBIE_FXRES_TR_USD_BAD", "", false},
	}
	for _, tc := range tests {
		_, got, ok := normalizeSeriesSpec(tc.in)
		if got != tc.want || ok != tc.ok {
			t.Fatalf("normalizeSeriesSpec(%q) = (%q,%v), want (%q,%v)", tc.in, got, ok, tc.want, tc.ok)
		}
	}
}
