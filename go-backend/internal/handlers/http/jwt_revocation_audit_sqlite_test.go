package http

import (
	"path/filepath"
	"testing"
	"time"
)

func TestJWTRevocationAuditSQLiteStore_AppendAndListNewestFirst(t *testing.T) {
	t.Parallel()

	store, err := NewJWTRevocationAuditSQLiteStore(filepath.Join(t.TempDir(), "revocations.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	defer func() {
		if cerr := store.Close(); cerr != nil {
			t.Fatalf("close store: %v", cerr)
		}
	}()

	if err := store.Append(JWTRevocationAuditRecord{JTI: "a", RecordedAt: time.Unix(1, 0).UTC()}); err != nil {
		t.Fatalf("append a: %v", err)
	}
	if err := store.Append(JWTRevocationAuditRecord{JTI: "b", RecordedAt: time.Unix(2, 0).UTC(), ActorRole: "admin"}); err != nil {
		t.Fatalf("append b: %v", err)
	}

	got, err := store.List(10)
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(got))
	}
	if got[0].JTI != "b" || got[1].JTI != "a" {
		t.Fatalf("expected newest-first [b,a], got [%s,%s]", got[0].JTI, got[1].JTI)
	}
	if got[0].ActorRole != "admin" {
		t.Fatalf("expected actor role admin, got %q", got[0].ActorRole)
	}
}
