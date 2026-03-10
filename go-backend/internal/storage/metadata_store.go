package storage

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
)

type SQLiteMetadataStore struct {
	db *sql.DB
}

func NewSQLiteMetadataStore(path string) (*SQLiteMetadataStore, error) {
	trimmed := filepath.Clean(path)
	if trimmed == "." || trimmed == "" {
		return nil, fmt.Errorf("metadata db path required")
	}
	if err := os.MkdirAll(filepath.Dir(trimmed), 0o755); err != nil {
		return nil, fmt.Errorf("create metadata db dir: %w", err)
	}
	db, err := sql.Open("sqlite", trimmed)
	if err != nil {
		return nil, fmt.Errorf("open metadata db: %w", err)
	}
	store := &SQLiteMetadataStore{db: db}
	if err := store.migrate(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

func (s *SQLiteMetadataStore) migrate() error {
	if s == nil || s.db == nil {
		return fmt.Errorf("metadata store unavailable")
	}
	_, err := s.db.Exec(`
CREATE TABLE IF NOT EXISTS artifact_metadata (
	id TEXT PRIMARY KEY,
	object_key TEXT NOT NULL,
	filename TEXT NOT NULL,
	content_type TEXT NOT NULL,
	retention_class TEXT NOT NULL,
	status TEXT NOT NULL,
	size_bytes INTEGER NOT NULL DEFAULT 0,
	sha256_hex TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	expires_at TEXT NOT NULL
);
`)
	if err != nil {
		return fmt.Errorf("migrate metadata db: %w", err)
	}
	return nil
}

func (s *SQLiteMetadataStore) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

func (s *SQLiteMetadataStore) Create(artifact Artifact) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("metadata store unavailable")
	}
	_, err := s.db.Exec(`
INSERT INTO artifact_metadata (
	id, object_key, filename, content_type, retention_class, status,
	size_bytes, sha256_hex, created_at, updated_at, expires_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
		artifact.ID,
		artifact.ObjectKey,
		artifact.Filename,
		artifact.ContentType,
		artifact.RetentionClass,
		string(artifact.Status),
		artifact.SizeBytes,
		artifact.SHA256Hex,
		artifact.CreatedAt.UTC().Format(time.RFC3339Nano),
		artifact.UpdatedAt.UTC().Format(time.RFC3339Nano),
		artifact.ExpiresAt.UTC().Format(time.RFC3339Nano),
	)
	if err != nil {
		return fmt.Errorf("insert artifact metadata: %w", err)
	}
	return nil
}

func (s *SQLiteMetadataStore) Get(id string) (Artifact, error) {
	if s == nil || s.db == nil {
		return Artifact{}, fmt.Errorf("metadata store unavailable")
	}
	var row struct {
		ID             string
		ObjectKey      string
		Filename       string
		ContentType    string
		RetentionClass string
		Status         string
		SizeBytes      int64
		SHA256Hex      string
		CreatedAt      string
		UpdatedAt      string
		ExpiresAt      string
	}
	err := s.db.QueryRow(`
SELECT id, object_key, filename, content_type, retention_class, status,
       size_bytes, sha256_hex, created_at, updated_at, expires_at
FROM artifact_metadata
WHERE id = ?
`, id).Scan(
		&row.ID,
		&row.ObjectKey,
		&row.Filename,
		&row.ContentType,
		&row.RetentionClass,
		&row.Status,
		&row.SizeBytes,
		&row.SHA256Hex,
		&row.CreatedAt,
		&row.UpdatedAt,
		&row.ExpiresAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Artifact{}, ErrArtifactNotFound
		}
		return Artifact{}, fmt.Errorf("query artifact metadata: %w", err)
	}
	createdAt, err := time.Parse(time.RFC3339Nano, row.CreatedAt)
	if err != nil {
		return Artifact{}, fmt.Errorf("parse created_at: %w", err)
	}
	updatedAt, err := time.Parse(time.RFC3339Nano, row.UpdatedAt)
	if err != nil {
		return Artifact{}, fmt.Errorf("parse updated_at: %w", err)
	}
	expiresAt, err := time.Parse(time.RFC3339Nano, row.ExpiresAt)
	if err != nil {
		return Artifact{}, fmt.Errorf("parse expires_at: %w", err)
	}
	return Artifact{
		ID:             row.ID,
		ObjectKey:      row.ObjectKey,
		Filename:       row.Filename,
		ContentType:    row.ContentType,
		RetentionClass: row.RetentionClass,
		Status:         ArtifactStatus(row.Status),
		SizeBytes:      row.SizeBytes,
		SHA256Hex:      row.SHA256Hex,
		CreatedAt:      createdAt.UTC(),
		UpdatedAt:      updatedAt.UTC(),
		ExpiresAt:      expiresAt.UTC(),
	}, nil
}

func (s *SQLiteMetadataStore) MarkUploaded(id string, result UploadResult) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("metadata store unavailable")
	}
	res, err := s.db.Exec(`
UPDATE artifact_metadata
SET status = ?, size_bytes = ?, sha256_hex = ?, updated_at = ?
WHERE id = ?
`,
		string(StatusReady),
		result.SizeBytes,
		result.SHA256Hex,
		result.UploadedAt.UTC().Format(time.RFC3339Nano),
		id,
	)
	if err != nil {
		return fmt.Errorf("mark artifact uploaded: %w", err)
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("artifact upload rows affected: %w", err)
	}
	if rows == 0 {
		return ErrArtifactNotFound
	}
	return nil
}
