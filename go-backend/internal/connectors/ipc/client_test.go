package ipc

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_HTTPFallback(t *testing.T) {
	// No gRPC server — client falls back to HTTP
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/health" && r.Method == http.MethodGet {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"ok":true}`))
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	client := NewClient(Config{
		HTTPBaseURL: server.URL,
		Timeout:     0,
	})
	defer client.Close()

	ctx := context.Background()
	status, body, err := client.Get(ctx, "/health", nil, nil)
	if err != nil {
		t.Fatalf("Get failed: %v", err)
	}
	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}
	if len(body) == 0 {
		t.Fatal("expected non-empty body")
	}
	if bodyStr := string(body); bodyStr != `{"ok":true}` {
		t.Errorf("unexpected body: %q", bodyStr)
	}
}

func TestClient_PostJSON_HTTPFallback(t *testing.T) {
	var receivedBody []byte
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && r.URL.Path == "/api/v1/test" {
			receivedBody = make([]byte, 1024)
			n, _ := r.Body.Read(receivedBody)
			receivedBody = receivedBody[:n]
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"received":true}`))
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	client := NewClient(Config{HTTPBaseURL: server.URL})
	defer client.Close()

	payload := []byte(`{"foo":"bar"}`)
	status, body, err := client.PostJSON(context.Background(), "/api/v1/test", payload)
	if err != nil {
		t.Fatalf("PostJSON failed: %v", err)
	}
	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}
	if len(receivedBody) == 0 {
		t.Fatal("server did not receive body")
	}
	if string(body) != `{"received":true}` {
		t.Errorf("unexpected response body: %q", string(body))
	}
}

func TestDeriveGrpcAddress(t *testing.T) {
	tests := []struct {
		httpURL string
		want    string
	}{
		{"http://127.0.0.1:8092", "127.0.0.1:9092"},
		{"http://127.0.0.1:8081", "127.0.0.1:9081"},
		{"http://127.0.0.1:8091", "127.0.0.1:9091"},
		{"http://localhost:8092", "localhost:9092"},
	}
	for _, tt := range tests {
		got := deriveGrpcAddress(tt.httpURL)
		if got != tt.want {
			t.Errorf("deriveGrpcAddress(%q) = %q, want %q", tt.httpURL, got, tt.want)
		}
	}
}
