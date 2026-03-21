package ingestservice

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/requestctx"
)

func TestClient_PostJSON_UsesRegistryAwareIPCHeaders(t *testing.T) {
	var gotProvider string
	var gotGroup string
	var gotRetry string
	var gotBridge string
	var gotRequestID string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotProvider = r.Header.Get("X-TVF-Connector-Provider")
		gotGroup = r.Header.Get("X-TVF-Connector-Group")
		gotRetry = r.Header.Get("X-TVF-Retry-Profile")
		gotBridge = r.Header.Get("X-TVF-Bridge-Mode")
		gotRequestID = r.Header.Get("X-Request-ID")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	reg := connectorregistry.New(connectorregistry.Config{
		AssetClasses: map[string]connectorregistry.AssetClassConfig{
			"placeholder": {Providers: []string{"ingestservice"}, Strategy: "authority_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"pythonipc": {MaxConcurrency: 1, RetryProfile: "internal_rpc"},
		},
		Providers: map[string]connectorregistry.ProviderConfig{
			"ingestservice": {Group: "pythonipc", Bridge: "grpc_http_fallback", RetryProfile: "internal_rpc"},
		},
	})
	client := NewClient(Config{BaseURL: server.URL, Registry: reg})

	ctx := requestctx.WithRequestID(context.Background(), "req-ingest-1")
	status, body, err := client.PostJSON(ctx, "/api/v1/ingest/jobs", []byte(`{"job":"seed"}`))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if status != http.StatusOK || string(body) != `{"ok":true}` {
		t.Fatalf("unexpected response: status=%d body=%s", status, string(body))
	}
	if gotProvider != "ingestservice" || gotGroup != "pythonipc" || gotRetry != "internal_rpc" || gotBridge != "grpc_http_fallback" {
		t.Fatalf("unexpected connector headers: provider=%q group=%q retry=%q bridge=%q", gotProvider, gotGroup, gotRetry, gotBridge)
	}
	if gotRequestID != "req-ingest-1" {
		t.Fatalf("expected request id req-ingest-1, got %q", gotRequestID)
	}
}

func TestClient_Get_UsesRequestQuery(t *testing.T) {
	var gotPath string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.String()
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	status, body, err := client.Get(context.Background(), "/api/v1/ingest/jobs", url.Values{"status": {"pending"}})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if status != http.StatusOK || string(body) != `{"ok":true}` {
		t.Fatalf("unexpected response: status=%d body=%s", status, string(body))
	}
	if gotPath != "/api/v1/ingest/jobs?status=pending" {
		t.Fatalf("expected query path, got %q", gotPath)
	}
}
