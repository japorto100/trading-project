package http

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestJWTRevocationAuditStore_ListNewestFirstAndCapacity(t *testing.T) {
	store := NewJWTRevocationAuditStore(2)
	store.Append(JWTRevocationAuditRecord{JTI: "a", RecordedAt: time.Unix(1, 0).UTC()})
	store.Append(JWTRevocationAuditRecord{JTI: "b", RecordedAt: time.Unix(2, 0).UTC()})
	store.Append(JWTRevocationAuditRecord{JTI: "c", RecordedAt: time.Unix(3, 0).UTC()})

	got := store.List(10)
	if len(got) != 2 {
		t.Fatalf("expected 2 records, got %d", len(got))
	}
	if got[0].JTI != "c" || got[1].JTI != "b" {
		t.Fatalf("expected newest-first [c,b], got [%s,%s]", got[0].JTI, got[1].JTI)
	}
}

func TestJWTJTIRevocationHandlerWithAudit_AppendsAuditRecord(t *testing.T) {
	store := NewJWTRevocationAuditStore(10)
	handler := JWTJTIRevocationHandlerWithAudit(func(string, time.Time) {}, store.Append)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/revocations/jti", strings.NewReader(`{"jti":"jti-audit","exp":1893456000}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-123")
	req.Header.Set("X-Auth-User", "admin-user")
	req.Header.Set("X-User-Role", "admin")
	req.Header.Set("X-Forwarded-For", "203.0.113.10, 10.0.0.1")
	req.RemoteAddr = "127.0.0.1:12345"
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusAccepted {
		t.Fatalf("expected status 202, got %d", res.Code)
	}
	records := store.List(10)
	if len(records) != 1 {
		t.Fatalf("expected 1 audit record, got %d", len(records))
	}
	if records[0].JTI != "jti-audit" {
		t.Fatalf("unexpected jti %q", records[0].JTI)
	}
	if records[0].RequestID != "req-123" {
		t.Fatalf("unexpected request id %q", records[0].RequestID)
	}
	if records[0].ActorUser != "admin-user" || records[0].ActorRole != "admin" {
		t.Fatalf("unexpected actor fields: %+v", records[0])
	}
	if records[0].SourceIP != "203.0.113.10" {
		t.Fatalf("unexpected source IP %q", records[0].SourceIP)
	}
}

func TestJWTJTIRevocationAuditHandler_ReturnsRecordsAndLimit(t *testing.T) {
	store := NewJWTRevocationAuditStore(10)
	store.Append(JWTRevocationAuditRecord{
		JTI:        "a",
		RecordedAt: time.Date(2026, 2, 22, 12, 0, 0, 0, time.UTC),
		ActorRole:  "admin",
	})
	store.Append(JWTRevocationAuditRecord{
		JTI:        "b",
		RecordedAt: time.Date(2026, 2, 22, 12, 1, 0, 0, time.UTC),
		RequestID:  "req-b",
	})

	handler := JWTJTIRevocationAuditHandler(store.List)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/revocations/audit?limit=1", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	body := res.Body.String()
	if !strings.Contains(body, `"count":1`) {
		t.Fatalf("expected count=1 body, got %s", body)
	}
	if !strings.Contains(body, `"jti":"b"`) {
		t.Fatalf("expected newest record jti b, got %s", body)
	}
}

func TestJWTJTIRevocationAuditHandler_Validation(t *testing.T) {
	t.Run("method not allowed", func(t *testing.T) {
		handler := JWTJTIRevocationAuditHandler(func(int) []JWTRevocationAuditRecord { return nil })
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/revocations/audit", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected status 405, got %d", res.Code)
		}
	})

	t.Run("missing lister", func(t *testing.T) {
		handler := JWTJTIRevocationAuditHandler(nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/revocations/audit", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected status 503, got %d", res.Code)
		}
	})
}
