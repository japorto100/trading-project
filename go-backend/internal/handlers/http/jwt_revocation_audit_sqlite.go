package http

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

type JWTRevocationAuditSQLiteStore struct {
	db *sql.DB
}

func NewJWTRevocationAuditSQLiteStore(path string) (*JWTRevocationAuditSQLiteStore, error) {
	trimmed := strings.TrimSpace(path)
	if trimmed == "" {
		return nil, fmt.Errorf("jwt revocation audit sqlite: empty path")
	}
	if dir := filepath.Dir(trimmed); dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, fmt.Errorf("jwt revocation audit sqlite: create dir: %w", err)
		}
	}

	db, err := sql.Open("sqlite", trimmed)
	if err != nil {
		return nil, fmt.Errorf("jwt revocation audit sqlite: open db: %w", err)
	}
	store := &JWTRevocationAuditSQLiteStore{db: db}
	if err := store.init(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

func (s *JWTRevocationAuditSQLiteStore) init() error {
	if s == nil || s.db == nil {
		return fmt.Errorf("jwt revocation audit sqlite: nil store")
	}
	const schema = `
CREATE TABLE IF NOT EXISTS jwt_revocation_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jti TEXT NOT NULL,
  expires_at TEXT,
  recorded_at TEXT NOT NULL,
  request_id TEXT,
  actor_user TEXT,
  actor_role TEXT,
  source_ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_jwt_revocation_audit_recorded_at ON jwt_revocation_audit(recorded_at DESC, id DESC);
`
	if _, err := s.db.Exec(schema); err != nil {
		return fmt.Errorf("jwt revocation audit sqlite: init schema: %w", err)
	}
	return nil
}

func (s *JWTRevocationAuditSQLiteStore) Append(record JWTRevocationAuditRecord) error {
	if s == nil || s.db == nil {
		return nil
	}
	if record.RecordedAt.IsZero() {
		record.RecordedAt = time.Now().UTC()
	}
	var expiresAt any
	if !record.ExpiresAt.IsZero() {
		expiresAt = record.ExpiresAt.UTC().Format(time.RFC3339Nano)
	}
	_, err := s.db.Exec(
		`INSERT INTO jwt_revocation_audit (jti, expires_at, recorded_at, request_id, actor_user, actor_role, source_ip) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		record.JTI,
		expiresAt,
		record.RecordedAt.UTC().Format(time.RFC3339Nano),
		nullIfEmpty(record.RequestID),
		nullIfEmpty(record.ActorUser),
		nullIfEmpty(record.ActorRole),
		nullIfEmpty(record.SourceIP),
	)
	if err != nil {
		return fmt.Errorf("jwt revocation audit sqlite: insert: %w", err)
	}
	return nil
}

func (s *JWTRevocationAuditSQLiteStore) List(limit int) ([]JWTRevocationAuditRecord, error) {
	if s == nil || s.db == nil {
		return nil, nil
	}
	if limit <= 0 {
		limit = 50
	}
	if limit > 200 {
		limit = 200
	}

	rows, err := s.db.Query(
		`SELECT jti, expires_at, recorded_at, request_id, actor_user, actor_role, source_ip FROM jwt_revocation_audit ORDER BY recorded_at DESC, id DESC LIMIT ?`,
		limit,
	)
	if err != nil {
		return nil, fmt.Errorf("jwt revocation audit sqlite: query: %w", err)
	}
	defer func() { _ = rows.Close() }()

	out := make([]JWTRevocationAuditRecord, 0, limit)
	for rows.Next() {
		var (
			rec        JWTRevocationAuditRecord
			expiresAt  sql.NullString
			recordedAt string
			requestID  sql.NullString
			actorUser  sql.NullString
			actorRole  sql.NullString
			sourceIP   sql.NullString
		)
		if err := rows.Scan(&rec.JTI, &expiresAt, &recordedAt, &requestID, &actorUser, &actorRole, &sourceIP); err != nil {
			return nil, fmt.Errorf("jwt revocation audit sqlite: scan: %w", err)
		}
		if parsed, err := time.Parse(time.RFC3339Nano, recordedAt); err == nil {
			rec.RecordedAt = parsed.UTC()
		}
		if expiresAt.Valid {
			if parsed, err := time.Parse(time.RFC3339Nano, expiresAt.String); err == nil {
				rec.ExpiresAt = parsed.UTC()
			}
		}
		rec.RequestID = requestID.String
		rec.ActorUser = actorUser.String
		rec.ActorRole = actorRole.String
		rec.SourceIP = sourceIP.String
		out = append(out, rec)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("jwt revocation audit sqlite: rows: %w", err)
	}
	return out, nil
}

func (s *JWTRevocationAuditSQLiteStore) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

func nullIfEmpty(value string) any {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}
