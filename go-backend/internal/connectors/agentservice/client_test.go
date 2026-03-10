package agentservice

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/requestctx"
)

func TestClientPost_PropagatesRequestIDAndReturnsStatus(t *testing.T) {
	t.Parallel()

	var gotMethod string
	var gotPath string
	var gotRequestID string
	var gotContentType string
	var gotBody string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotRequestID = r.Header.Get("X-Request-ID")
		gotContentType = r.Header.Get("Content-Type")
		body, _ := io.ReadAll(r.Body)
		gotBody = string(body)
		w.WriteHeader(http.StatusAccepted)
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ctx := requestctx.WithRequestID(context.Background(), "req-agent-post")
	status, body, err := client.Post(ctx, "/api/v1/agents/run", []byte(`{"goal":"summarize"}`))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if status != http.StatusAccepted {
		t.Fatalf("expected status 202, got %d", status)
	}
	if string(body) != `{"ok":true}` {
		t.Fatalf("unexpected body %q", string(body))
	}
	if gotMethod != http.MethodPost || gotPath != "/api/v1/agents/run" {
		t.Fatalf("unexpected request %s %s", gotMethod, gotPath)
	}
	if gotRequestID != "req-agent-post" {
		t.Fatalf("expected propagated request id, got %q", gotRequestID)
	}
	if gotContentType != "application/json" {
		t.Fatalf("expected content type application/json, got %q", gotContentType)
	}
	if gotBody != `{"goal":"summarize"}` {
		t.Fatalf("unexpected request body %q", gotBody)
	}
}

func TestClientGet_PropagatesRequestIDAndReturnsUpstreamStatus(t *testing.T) {
	t.Parallel()

	var gotMethod string
	var gotPath string
	var gotRequestID string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotRequestID = r.Header.Get("X-Request-ID")
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(`{"error":"upstream unavailable"}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ctx := requestctx.WithRequestID(context.Background(), "req-agent-get")
	status, body, err := client.Get(ctx, "/health")
	if err != nil {
		t.Fatalf("expected no transport error, got %v", err)
	}
	if status != http.StatusBadGateway {
		t.Fatalf("expected status 502, got %d", status)
	}
	if string(body) != `{"error":"upstream unavailable"}` {
		t.Fatalf("unexpected body %q", string(body))
	}
	if gotMethod != http.MethodGet || gotPath != "/health" {
		t.Fatalf("unexpected request %s %s", gotMethod, gotPath)
	}
	if gotRequestID != "req-agent-get" {
		t.Fatalf("expected propagated request id, got %q", gotRequestID)
	}
}
