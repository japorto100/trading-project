package http

import (
	"path/filepath"
	"testing"
)

func TestGCTAuditSQLiteStore_AppendAndList(t *testing.T) {
	t.Parallel()

	store, err := NewGCTAuditSQLiteStore(filepath.Join(t.TempDir(), "gct_audit.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	defer func() {
		if cerr := store.Close(); cerr != nil {
			t.Fatalf("close store: %v", cerr)
		}
	}()

	rec1 := map[string]any{
		"ts":         "2024-01-01T00:00:01Z",
		"requestId":  "req-001",
		"method":     "GET",
		"path":       "/api/v1/health",
		"status":     200,
		"durationMs": int64(5),
		"remoteAddr": "127.0.0.1",
		"userId":     "",
		"userRole":   "",
	}
	rec2 := map[string]any{
		"ts":         "2024-01-01T00:00:02Z",
		"requestId":  "req-002",
		"method":     "POST",
		"path":       "/api/v1/order",
		"status":     201,
		"durationMs": int64(42),
		"remoteAddr": "10.0.0.1",
		"userId":     "user-42",
		"userRole":   "trader",
	}

	if err := store.Append(rec1); err != nil {
		t.Fatalf("append rec1: %v", err)
	}
	if err := store.Append(rec2); err != nil {
		t.Fatalf("append rec2: %v", err)
	}

	got, err := store.List(10)
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(got))
	}
	// newest-first: rec2 (ts ...02Z) before rec1 (ts ...01Z)
	if got[0]["ts"] != "2024-01-01T00:00:02Z" {
		t.Errorf("expected newest first ts=...02Z, got %v", got[0]["ts"])
	}
	if got[1]["ts"] != "2024-01-01T00:00:01Z" {
		t.Errorf("expected oldest second ts=...01Z, got %v", got[1]["ts"])
	}
	if got[0]["userRole"] != "trader" {
		t.Errorf("expected userRole=trader, got %v", got[0]["userRole"])
	}
	if got[0]["method"] != "POST" {
		t.Errorf("expected method=POST, got %v", got[0]["method"])
	}
}

func TestGCTAuditSQLiteStore_EmptyTsSkipped(t *testing.T) {
	t.Parallel()

	store, err := NewGCTAuditSQLiteStore(filepath.Join(t.TempDir(), "gct_audit.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	defer func() { _ = store.Close() }()

	// Record with empty ts must be silently skipped (no insert)
	if err := store.Append(map[string]any{
		"ts":     "",
		"method": "GET",
		"path":   "/skip",
		"status": 200,
	}); err != nil {
		t.Fatalf("append with empty ts should not error: %v", err)
	}

	got, err := store.List(10)
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(got) != 0 {
		t.Fatalf("expected 0 rows, got %d", len(got))
	}
}

func TestGCTAuditSQLiteStore_ListCappedAt200(t *testing.T) {
	store, err := NewGCTAuditSQLiteStore(filepath.Join(t.TempDir(), "gct_audit.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	defer func() { _ = store.Close() }()

	for i := range 201 {
		ts := "2024-01-01T00:00:00Z"
		if i < 100 {
			ts = "2024-01-01T00:00:01Z"
		}
		rec := map[string]any{
			"ts":     ts,
			"method": "GET",
			"path":   "/api",
			"status": 200,
		}
		if err := store.Append(rec); err != nil {
			t.Fatalf("append %d: %v", i, err)
		}
	}

	got, err := store.List(500)
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(got) > 200 {
		t.Fatalf("expected at most 200 rows, got %d", len(got))
	}
}

func TestGCTAuditSQLiteStore_NilSafe(t *testing.T) {
	t.Parallel()

	var store *GCTAuditSQLiteStore

	// Append on nil store must not panic
	if err := store.Append(map[string]any{"ts": "2024-01-01T00:00:00Z", "method": "GET"}); err != nil {
		t.Fatalf("nil Append returned error: %v", err)
	}

	// List on nil store must not panic
	got, err := store.List(10)
	if err != nil {
		t.Fatalf("nil List returned error: %v", err)
	}
	if got != nil {
		t.Fatalf("nil List returned non-nil slice: %v", got)
	}

	// Close on nil store must not panic
	if err := store.Close(); err != nil {
		t.Fatalf("nil Close returned error: %v", err)
	}
}

func TestGCTAuditSQLiteStore_EmptyPathError(t *testing.T) {
	t.Parallel()

	_, err := NewGCTAuditSQLiteStore("")
	if err == nil {
		t.Fatal("expected error for empty path, got nil")
	}
}
