package http

import (
	"sync"
	"time"
)

type JWTRevocationAuditRecord struct {
	JTI        string
	ExpiresAt  time.Time
	RecordedAt time.Time
	RequestID  string
	ActorUser  string
	ActorRole  string
	SourceIP   string
}

type JWTRevocationAuditStore struct {
	mu       sync.RWMutex
	capacity int
	records  []JWTRevocationAuditRecord
}

func NewJWTRevocationAuditStore(capacity int) *JWTRevocationAuditStore {
	if capacity < 1 {
		capacity = 1
	}
	return &JWTRevocationAuditStore{
		capacity: capacity,
		records:  make([]JWTRevocationAuditRecord, 0, capacity),
	}
}

func (s *JWTRevocationAuditStore) Append(record JWTRevocationAuditRecord) {
	if s == nil {
		return
	}
	if record.RecordedAt.IsZero() {
		record.RecordedAt = time.Now().UTC()
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.records) >= s.capacity {
		copy(s.records, s.records[1:])
		s.records[len(s.records)-1] = record
		return
	}
	s.records = append(s.records, record)
}

func (s *JWTRevocationAuditStore) List(limit int) []JWTRevocationAuditRecord {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 || limit > len(s.records) {
		limit = len(s.records)
	}
	if limit == 0 {
		return []JWTRevocationAuditRecord{}
	}

	start := len(s.records) - limit
	out := make([]JWTRevocationAuditRecord, 0, limit)
	for i := len(s.records) - 1; i >= start; i-- {
		out = append(out, s.records[i])
	}
	return out
}
