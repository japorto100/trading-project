package storage

import (
	"path/filepath"
	"testing"
	"time"
)

func TestSQLiteMetadataStoreCreateGetAndComplete(t *testing.T) {
	t.Parallel()

	store, err := NewSQLiteMetadataStore(filepath.Join(t.TempDir(), "artifacts.db"))
	if err != nil {
		t.Fatalf("new store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close store: %v", err)
		}
	})

	createdAt := time.Unix(1_700_000_000, 0).UTC()
	artifact := Artifact{
		ID:             "art_123",
		ObjectKey:      "analysis/report.pdf",
		Filename:       "report.pdf",
		ContentType:    "application/pdf",
		RetentionClass: "analysis",
		Status:         StatusPendingUpload,
		CreatedAt:      createdAt,
		UpdatedAt:      createdAt,
		ExpiresAt:      createdAt.Add(15 * time.Minute),
	}

	if err := store.Create(artifact); err != nil {
		t.Fatalf("create artifact: %v", err)
	}

	got, err := store.Get("art_123")
	if err != nil {
		t.Fatalf("get artifact: %v", err)
	}
	if got.ObjectKey != artifact.ObjectKey {
		t.Fatalf("object key = %q, want %q", got.ObjectKey, artifact.ObjectKey)
	}

	if err := store.MarkUploaded("art_123", UploadResult{
		SizeBytes:  12,
		SHA256Hex:  "abc123",
		UploadedAt: createdAt.Add(time.Minute),
	}); err != nil {
		t.Fatalf("mark uploaded: %v", err)
	}

	got, err = store.Get("art_123")
	if err != nil {
		t.Fatalf("get uploaded artifact: %v", err)
	}
	if got.Status != StatusReady {
		t.Fatalf("status = %q, want %q", got.Status, StatusReady)
	}
	if got.SHA256Hex != "abc123" {
		t.Fatalf("sha256 = %q, want abc123", got.SHA256Hex)
	}
	if got.SizeBytes != 12 {
		t.Fatalf("size = %d, want 12", got.SizeBytes)
	}
}
