package finra

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

func TestNewATSFetcher_UsesEnvOverrides(t *testing.T) {
	t.Setenv("FINRA_ATS_API_URL", "https://example.com/weeklySummary")
	t.Setenv("FINRA_ATS_HTTP_TIMEOUT_MS", "12345")

	fetcher := NewATSFetcher(nil)
	if fetcher == nil {
		t.Fatal("expected non-nil fetcher")
	}
	if got := fetcher.URL(); got != "https://example.com/weeklySummary" {
		t.Fatalf("expected env url override, got %q", got)
	}
	client := fetcher.HTTPClient()
	if client == nil {
		t.Fatal("expected http client")
	}
	if got := client.Timeout; got != 12345*time.Millisecond {
		t.Fatalf("expected timeout 12345ms, got %v", got)
	}
}

func TestFetch_UsesBearerTokenAndPOSTJSON(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer token-123" {
			t.Fatalf("expected bearer auth, got %q", got)
		}
		if got := r.Header.Get("Data-API-Version"); got != "1" {
			t.Fatalf("expected Data-API-Version 1, got %q", got)
		}
		var payload WeeklySummaryRequest
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload.Limit != 10 {
			t.Fatalf("expected limit 10, got %d", payload.Limit)
		}
		_ = json.NewEncoder(w).Encode([]map[string]any{
			{"issueSymbolIdentifier": "AAPL", "totalWeeklyTradeCount": float64(12)},
		})
	}))
	defer server.Close()

	t.Setenv("FINRA_ATS_API_URL", server.URL)
	t.Setenv("FINRA_API_BEARER_TOKEN", "token-123")
	fetcher := NewATSFetcher(server.Client())
	rows, err := fetcher.Fetch(context.Background(), WeeklySummaryRequest{
		Limit: 10,
		CompareFilters: []CompareFilter{
			{CompareType: "equal", FieldName: "issueSymbolIdentifier", FieldValue: "AAPL"},
		},
	})
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if len(rows) != 1 {
		t.Fatalf("expected 1 row, got %d", len(rows))
	}
}

func TestFetch_DefaultFieldsAndLimit(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload WeeklySummaryRequest
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload.Limit != 1000 {
			t.Fatalf("expected default limit 1000, got %d", payload.Limit)
		}
		if len(payload.Fields) != len(defaultWeeklySummaryFields) {
			t.Fatalf("expected %d default fields, got %d", len(defaultWeeklySummaryFields), len(payload.Fields))
		}
		_ = json.NewEncoder(w).Encode([]map[string]any{})
	}))
	defer server.Close()

	t.Setenv("FINRA_ATS_API_URL", server.URL)
	t.Setenv("FINRA_API_BEARER_TOKEN", "token-123")
	fetcher := NewATSFetcher(server.Client())
	if _, err := fetcher.Fetch(context.Background(), WeeklySummaryRequest{}); err != nil {
		t.Fatalf("Fetch with defaults: %v", err)
	}
}

func TestFetch_DecodesWrappedDataResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"data": []map[string]any{
				{"issueSymbolIdentifier": "MSFT"},
			},
		})
	}))
	defer server.Close()

	t.Setenv("FINRA_ATS_API_URL", server.URL)
	t.Setenv("FINRA_API_BEARER_TOKEN", "token-123")
	fetcher := NewATSFetcher(server.Client())
	rows, err := fetcher.Fetch(context.Background(), WeeklySummaryRequest{})
	if err != nil {
		t.Fatalf("Fetch wrapped data: %v", err)
	}
	if len(rows) != 1 || rows[0]["issueSymbolIdentifier"] != "MSFT" {
		t.Fatalf("unexpected rows: %#v", rows)
	}
}

func TestBearer_UsesClientCredentialsFlow(t *testing.T) {
	tokenServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		want := "Basic " + base64.StdEncoding.EncodeToString([]byte("client:secret"))
		if got := r.Header.Get("Authorization"); got != want {
			t.Fatalf("expected basic auth %q, got %q", want, got)
		}
		_ = json.NewEncoder(w).Encode(tokenResponse{AccessToken: "fresh-token", TokenType: "Bearer"})
	}))
	defer tokenServer.Close()

	fetcher := &ATSFetcher{
		url:          "https://example.com/data",
		tokenURL:     tokenServer.URL,
		clientID:     "client",
		clientSecret: "secret",
		httpClient:   tokenServer.Client(),
	}
	token, err := fetcher.bearer(context.Background())
	if err != nil {
		t.Fatalf("bearer: %v", err)
	}
	if token != "fresh-token" {
		t.Fatalf("expected fresh-token, got %q", token)
	}
}

func TestNormalizeWeeklySummaryRequest_RejectsSortWithoutPartitionFilters(t *testing.T) {
	_, err := normalizeWeeklySummaryRequest(WeeklySummaryRequest{
		SortFields: []string{"issueSymbolIdentifier"},
		CompareFilters: []CompareFilter{
			{CompareType: "equal", FieldName: "tierIdentifier", FieldValue: "T1"},
		},
	})
	if err == nil {
		t.Fatal("expected sort partition filter validation error")
	}
}

func TestNormalizeWeeklySummaryRequest_AllowsSortWithPartitionFilters(t *testing.T) {
	got, err := normalizeWeeklySummaryRequest(WeeklySummaryRequest{
		SortFields: []string{"issueSymbolIdentifier"},
		CompareFilters: []CompareFilter{
			{CompareType: "equal", FieldName: "tierIdentifier", FieldValue: "T1"},
			{CompareType: "equal", FieldName: "weekStartDate", FieldValue: "2026-03-02"},
		},
	})
	if err != nil {
		t.Fatalf("normalizeWeeklySummaryRequest: %v", err)
	}
	if len(got.Fields) == 0 || got.Limit != 1000 {
		t.Fatalf("expected normalized defaults, got %+v", got)
	}
}

func TestNormalizeWeeklySummaryRequest_RejectsAsync(t *testing.T) {
	_, err := normalizeWeeklySummaryRequest(WeeklySummaryRequest{Async: true})
	if err == nil {
		t.Fatal("expected async unsupported error")
	}
}

func TestNormalizeWeeklySummaryRequest_RejectsUnsupportedField(t *testing.T) {
	_, err := normalizeWeeklySummaryRequest(WeeklySummaryRequest{Fields: []string{"issueSymbolIdentifier", "badField"}})
	if err == nil {
		t.Fatal("expected unsupported field error")
	}
}

func TestNormalizeWeeklySummaryRequest_NormalizesLimitOffsetAndFields(t *testing.T) {
	got, err := normalizeWeeklySummaryRequest(WeeklySummaryRequest{
		Fields: []string{" issueSymbolIdentifier ", "issueSymbolIdentifier", "totalWeeklyTradeCount"},
		Limit:  999999,
		Offset: -5,
	})
	if err != nil {
		t.Fatalf("normalizeWeeklySummaryRequest: %v", err)
	}
	if got.Limit != 5000 {
		t.Fatalf("expected capped limit 5000, got %d", got.Limit)
	}
	if got.Offset != 0 {
		t.Fatalf("expected normalized offset 0, got %d", got.Offset)
	}
	if len(got.Fields) != 2 {
		t.Fatalf("expected deduped fields, got %#v", got.Fields)
	}
}

func TestNormalizeWeeklySummaryRequest_RejectsUnsupportedCompareType(t *testing.T) {
	_, err := normalizeWeeklySummaryRequest(WeeklySummaryRequest{
		CompareFilters: []CompareFilter{{FieldName: "issueSymbolIdentifier", CompareType: "LIKE", FieldValue: "AAPL"}},
	})
	if err == nil {
		t.Fatal("expected unsupported compareType error")
	}
}

func TestDecodeWeeklySummaryResponse_RejectsAsyncShape(t *testing.T) {
	_, err := decodeWeeklySummaryResponse(strings.NewReader(`{"status":"accepted","message":"download pending"}`))
	if err == nil {
		t.Fatal("expected async/download unsupported error")
	}
}

func TestDurationMsOr_InvalidFallsBack(t *testing.T) {
	t.Setenv("FINRA_ATS_HTTP_TIMEOUT_MS", "nope")
	if got := durationMsOr("FINRA_ATS_HTTP_TIMEOUT_MS", 30000); got != 30*time.Second {
		t.Fatalf("expected fallback timeout, got %v", got)
	}
}

func TestGetEnv_Fallback(t *testing.T) {
	_ = os.Unsetenv("FINRA_ATS_API_URL")
	if got := getEnv("FINRA_ATS_API_URL", "fallback"); got != "fallback" {
		t.Fatalf("expected fallback, got %q", got)
	}
}
