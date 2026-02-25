package indicatorservice

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/requestctx"
)

func TestPostJSON_UsesBaseClientAndPropagatesRequestID(t *testing.T) {
	t.Helper()

	var gotMethod string
	var gotPath string
	var gotContentType string
	var gotAccept string
	var gotRequestID string
	var gotBody string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotContentType = r.Header.Get("Content-Type")
		gotAccept = r.Header.Get("Accept")
		gotRequestID = r.Header.Get("X-Request-ID")
		body, _ := io.ReadAll(r.Body)
		gotBody = string(body)
		w.WriteHeader(http.StatusAccepted)
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL: server.URL,
	})
	ctx := requestctx.WithRequestID(context.Background(), "req-123")

	status, body, err := client.PostJSON(ctx, "signals/composite", []byte(`{"symbol":"BTCUSD"}`))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if status != http.StatusAccepted {
		t.Fatalf("expected status 202, got %d", status)
	}
	if string(body) != `{"ok":true}` {
		t.Fatalf("unexpected response body %q", string(body))
	}
	if gotMethod != http.MethodPost {
		t.Fatalf("expected POST, got %s", gotMethod)
	}
	if gotPath != "/signals/composite" {
		t.Fatalf("expected path /signals/composite, got %s", gotPath)
	}
	if gotContentType != "application/json" {
		t.Fatalf("expected content type application/json, got %q", gotContentType)
	}
	if gotAccept != "application/json" {
		t.Fatalf("expected accept application/json, got %q", gotAccept)
	}
	if gotRequestID != "req-123" {
		t.Fatalf("expected request id req-123, got %q", gotRequestID)
	}
	if gotBody != `{"symbol":"BTCUSD"}` {
		t.Fatalf("unexpected request body %q", gotBody)
	}
}
