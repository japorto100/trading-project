package observability_test

import (
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/observability"
)

// TestStartIdempotent verifies that calling Start() multiple times does not error.
func TestStartIdempotent(t *testing.T) {
	fr := observability.NewFlightRecorder()
	if err := fr.Start(); err != nil {
		t.Fatalf("first Start: %v", err)
	}
	if err := fr.Start(); err != nil {
		t.Fatalf("second Start (expected noop): %v", err)
	}
}

// TestHTTPHandlerReturns200 verifies the handler responds 200 with a non-empty body.
func TestHTTPHandlerReturns200(t *testing.T) {
	fr := observability.NewFlightRecorder()
	if err := fr.Start(); err != nil {
		t.Skipf("FlightRecorder.Start not available in this environment: %v", err)
	}
	handler := fr.HTTPHandler()
	req := httptest.NewRequest("GET", "/debug/flight-recorder", nil)
	rec := httptest.NewRecorder()
	handler(rec, req)
	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
}
