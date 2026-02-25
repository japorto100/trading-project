package softsignals

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/requestctx"
)

func TestPostJSON_PropagatesRequestIDAndJSONHeaders(t *testing.T) {
	var gotMethod, gotPath, gotReqID, gotContentType, gotAccept, gotBody string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotReqID = r.Header.Get("X-Request-ID")
		gotContentType = r.Header.Get("Content-Type")
		gotAccept = r.Header.Get("Accept")
		body, _ := io.ReadAll(r.Body)
		gotBody = string(body)
		w.WriteHeader(http.StatusCreated)
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ctx := requestctx.WithRequestID(context.Background(), "req-soft-1")
	status, body, err := client.PostJSON(ctx, "cluster-headlines", []byte(`{"q":"oil"}`))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if status != http.StatusCreated {
		t.Fatalf("expected status 201, got %d", status)
	}
	if string(body) != `{"ok":true}` {
		t.Fatalf("unexpected body %q", string(body))
	}
	if gotMethod != http.MethodPost || gotPath != "/cluster-headlines" {
		t.Fatalf("unexpected request %s %s", gotMethod, gotPath)
	}
	if gotReqID != "req-soft-1" {
		t.Fatalf("expected request id propagated, got %q", gotReqID)
	}
	if gotContentType != "application/json" || gotAccept != "application/json" {
		t.Fatalf("unexpected headers content-type=%q accept=%q", gotContentType, gotAccept)
	}
	if gotBody != `{"q":"oil"}` {
		t.Fatalf("unexpected request body %q", gotBody)
	}
}
