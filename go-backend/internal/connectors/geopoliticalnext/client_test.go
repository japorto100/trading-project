package geopoliticalnext

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/requestctx"
)

func TestDo_ForwardsHeadersAndRequestID(t *testing.T) {
	var gotMethod, gotPath, gotReqID, gotRole, gotBody string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotReqID = r.Header.Get("X-Request-ID")
		gotRole = r.Header.Get("X-User-Role")
		body, _ := io.ReadAll(r.Body)
		gotBody = string(body)
		w.WriteHeader(http.StatusAccepted)
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ctx := requestctx.WithRequestID(context.Background(), "req-geo-1")
	status, body, err := client.Do(ctx, http.MethodPost, "api/geopolitical/seed", []byte(`{"id":"x"}`), map[string]string{
		"X-User-Role": "analyst",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if status != http.StatusAccepted || string(body) != `{"ok":true}` {
		t.Fatalf("unexpected response status=%d body=%q", status, string(body))
	}
	if gotMethod != http.MethodPost || gotPath != "/api/geopolitical/seed" {
		t.Fatalf("unexpected request %s %s", gotMethod, gotPath)
	}
	if gotReqID != "req-geo-1" {
		t.Fatalf("expected request id, got %q", gotReqID)
	}
	if gotRole != "analyst" {
		t.Fatalf("expected X-User-Role analyst, got %q", gotRole)
	}
	if gotBody != `{"id":"x"}` {
		t.Fatalf("unexpected request body %q", gotBody)
	}
}
