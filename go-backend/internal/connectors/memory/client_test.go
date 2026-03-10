package memory

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/requestctx"
)

func TestClientPostKGQuery_PropagatesRequestIDAndNormalizesRows(t *testing.T) {
	t.Parallel()

	var gotMethod string
	var gotPath string
	var gotRequestID string
	var gotContentType string
	var gotQuery string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotRequestID = r.Header.Get("X-Request-ID")
		gotContentType = r.Header.Get("Content-Type")
		defer func() { _ = r.Body.Close() }()

		var payload KGQueryRequest
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		gotQuery = payload.Query

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(KGQueryResponse{
			OK:       true,
			Rows:     nil,
			RowCount: 0,
		})
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ctx := requestctx.WithRequestID(context.Background(), "req-memory-1")

	resp, err := client.PostKGQuery(ctx, KGQueryRequest{
		Query:      "MATCH (n) RETURN n LIMIT 1",
		Parameters: map[string]any{"limit": 1},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if !resp.OK {
		t.Fatal("expected ok=true")
	}
	if len(resp.Rows) != 0 {
		t.Fatalf("expected normalized empty rows, got %d", len(resp.Rows))
	}
	if resp.Rows == nil {
		t.Fatal("expected non-nil rows slice")
	}
	if gotMethod != http.MethodPost {
		t.Fatalf("expected POST, got %s", gotMethod)
	}
	if gotPath != "/api/v1/memory/kg/query" {
		t.Fatalf("expected path /api/v1/memory/kg/query, got %s", gotPath)
	}
	if gotRequestID != "req-memory-1" {
		t.Fatalf("expected request id req-memory-1, got %q", gotRequestID)
	}
	if gotContentType != "application/json" {
		t.Fatalf("expected content-type application/json, got %q", gotContentType)
	}
	if gotQuery != "MATCH (n) RETURN n LIMIT 1" {
		t.Fatalf("unexpected query payload %q", gotQuery)
	}
}

func TestClientGetHealth_MapsUpstreamStatus(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/health" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	_, err := client.GetHealth(context.Background())
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if got := err.Error(); got != "memory client upstream GET status 503 for /health" {
		t.Fatalf("unexpected error: %s", got)
	}
}
