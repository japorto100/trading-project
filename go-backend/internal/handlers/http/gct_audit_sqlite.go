package http

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	_ "modernc.org/sqlite"
)

// GCTAuditSQLiteStore persists GCT audit records to SQLite.
// The zero value is safe to use (all methods are nil-safe).
type GCTAuditSQLiteStore struct {
	db *sql.DB
}

// NewGCTAuditSQLiteStore opens (or creates) the SQLite database at path
// and initialises the schema.
func NewGCTAuditSQLiteStore(path string) (*GCTAuditSQLiteStore, error) {
	trimmed := strings.TrimSpace(path)
	if trimmed == "" {
		return nil, fmt.Errorf("gct audit sqlite: empty path")
	}
	if dir := filepath.Dir(trimmed); dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, fmt.Errorf("gct audit sqlite: create dir: %w", err)
		}
	}

	db, err := sql.Open("sqlite", trimmed)
	if err != nil {
		return nil, fmt.Errorf("gct audit sqlite: open db: %w", err)
	}
	store := &GCTAuditSQLiteStore{db: db}
	if err := store.init(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

func (s *GCTAuditSQLiteStore) init() error {
	if s == nil || s.db == nil {
		return fmt.Errorf("gct audit sqlite: nil store")
	}
	const schema = `
CREATE TABLE IF NOT EXISTS gct_audit (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT    NOT NULL,
  request_id  TEXT,
  method      TEXT,
  path        TEXT,
  status      INTEGER,
  duration_ms INTEGER,
  remote_addr TEXT,
  user_id     TEXT,
  user_role   TEXT
);
CREATE INDEX IF NOT EXISTS idx_gct_audit_ts ON gct_audit(ts DESC, id DESC);
`
	if _, err := s.db.Exec(schema); err != nil {
		return fmt.Errorf("gct audit sqlite: init schema: %w", err)
	}
	return nil
}

// Append writes a single audit record to SQLite.
// Keys read from the map: "ts","requestId","method","path","status",
// "durationMs","remoteAddr","userId","userRole".
// Nil-safe: returns nil when the store is not initialised.
func (s *GCTAuditSQLiteStore) Append(record map[string]any) error {
	if s == nil || s.db == nil {
		return nil
	}

	ts, _ := record["ts"].(string)
	requestID, _ := record["requestId"].(string)
	method, _ := record["method"].(string)
	path, _ := record["path"].(string)
	status, _ := record["status"].(int)
	durationMs, _ := record["durationMs"].(int64)
	remoteAddr, _ := record["remoteAddr"].(string)
	userID, _ := record["userId"].(string)
	userRole, _ := record["userRole"].(string)

	if ts == "" {
		return nil
	}

	_, err := s.db.Exec(
		`INSERT INTO gct_audit (ts, request_id, method, path, status, duration_ms, remote_addr, user_id, user_role)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		ts,
		nullIfEmpty(requestID),
		nullIfEmpty(method),
		nullIfEmpty(path),
		status,
		durationMs,
		nullIfEmpty(remoteAddr),
		nullIfEmpty(userID),
		nullIfEmpty(userRole),
	)
	if err != nil {
		return fmt.Errorf("gct audit sqlite: insert: %w", err)
	}
	return nil
}

// List returns the most recent audit records, up to limit (capped at 200).
func (s *GCTAuditSQLiteStore) List(limit int) ([]map[string]any, error) {
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
		`SELECT ts, request_id, method, path, status, duration_ms, remote_addr, user_id, user_role
		 FROM gct_audit ORDER BY ts DESC, id DESC LIMIT ?`,
		limit,
	)
	if err != nil {
		return nil, fmt.Errorf("gct audit sqlite: query: %w", err)
	}
	defer func() { _ = rows.Close() }()

	out := make([]map[string]any, 0, limit)
	for rows.Next() {
		var (
			ts         string
			requestID  sql.NullString
			method     sql.NullString
			path       sql.NullString
			status     sql.NullInt64
			durationMs sql.NullInt64
			remoteAddr sql.NullString
			userID     sql.NullString
			userRole   sql.NullString
		)
		if err := rows.Scan(&ts, &requestID, &method, &path, &status, &durationMs, &remoteAddr, &userID, &userRole); err != nil {
			return nil, fmt.Errorf("gct audit sqlite: scan: %w", err)
		}
		rec := map[string]any{
			"ts":         ts,
			"requestId":  requestID.String,
			"method":     method.String,
			"path":       path.String,
			"status":     status.Int64,
			"durationMs": durationMs.Int64,
			"remoteAddr": remoteAddr.String,
			"userId":     userID.String,
			"userRole":   userRole.String,
		}
		out = append(out, rec)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("gct audit sqlite: rows: %w", err)
	}
	return out, nil
}

// Close releases the underlying database connection.
// Nil-safe.
func (s *GCTAuditSQLiteStore) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}
