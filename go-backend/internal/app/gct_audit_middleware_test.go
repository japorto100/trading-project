package app

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestWithGCTAudit_WritesHashChainJSONL(t *testing.T) {
	path := filepath.Join(t.TempDir(), "gct-audit.jsonl")
	handler := withGCTAudit(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusCreated)
	}), gctAuditConfig{
		enabled: true,
		path:    path,
	})

	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/gct/health?token=secret", nil)
	req1.Header.Set("X-Request-ID", "req-1")
	req1.Header.Set("X-User-Role", "trader")
	req1.RemoteAddr = "127.0.0.1:12345"
	res1 := httptest.NewRecorder()
	handler.ServeHTTP(res1, req1)

	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/gct/health", nil)
	req2.Header.Set("X-Request-ID", "req-2")
	req2.RemoteAddr = "127.0.0.1:22222"
	res2 := httptest.NewRecorder()
	handler.ServeHTTP(res2, req2)

	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read audit file: %v", err)
	}
	lines := splitNonEmptyAuditLines(string(raw))
	if len(lines) != 2 {
		t.Fatalf("expected 2 audit lines, got %d", len(lines))
	}

	var first map[string]any
	var second map[string]any
	if err := json.Unmarshal([]byte(lines[0]), &first); err != nil {
		t.Fatalf("decode first line: %v", err)
	}
	if err := json.Unmarshal([]byte(lines[1]), &second); err != nil {
		t.Fatalf("decode second line: %v", err)
	}

	if _, ok := first["entryHash"].(string); !ok {
		t.Fatalf("expected first entryHash")
	}
	firstHash, _ := first["entryHash"].(string)
	secondPrev, _ := second["prevHash"].(string)
	if secondPrev != firstHash {
		t.Fatalf("expected chained prevHash %q, got %q", firstHash, secondPrev)
	}

	query, _ := first["query"].(map[string]any)
	if query["token"] != "[redacted]" {
		t.Fatalf("expected token query param to be redacted, got %#v", query["token"])
	}
}

func splitNonEmptyAuditLines(s string) []string {
	lines := strings.Split(s, "\n")
	out := make([]string, 0, len(lines))
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		out = append(out, trimmed)
	}
	return out
}
