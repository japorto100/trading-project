package base

import (
	"context"
	"net/http"
	"testing"
	"time"
)

func TestComputeOracleDisagreement(t *testing.T) {
	oracle := &OracleQuote{
		Symbol:    "BTC/USD",
		Price:     101,
		Timestamp: time.Now().UTC(),
		Source:    "chainlink",
		Verified:  true,
	}
	got := ComputeOracleDisagreement("BTC/USD", "finnhub", 100, oracle)
	if got == nil {
		t.Fatal("expected disagreement")
	}
	if got.BpsGap <= 0 {
		t.Fatalf("expected positive bps gap, got %f", got.BpsGap)
	}
}

func TestRequestErrorError(t *testing.T) {
	err := (&RequestError{
		Provider:   "finnhub",
		StatusCode: 429,
		Message:    "rate limited",
	}).Error()
	if err == "" {
		t.Fatal("expected non-empty error string")
	}
}

func TestCapabilitiesHelpers(t *testing.T) {
	caps := Capabilities{Quote: true}
	if !caps.SupportsRealtime() {
		t.Fatal("expected realtime support")
	}
	if caps.SupportsAnalyticsSeed() {
		t.Fatal("did not expect analytics seed support")
	}
}

func TestClassifyHTTPStatusAndErrors(t *testing.T) {
	if got := ClassifyHTTPStatus(http.StatusTooManyRequests); got != ErrorClassQuota {
		t.Fatalf("expected quota class, got %q", got)
	}
	if got := ClassifyError(context.DeadlineExceeded, nil); got != ErrorClassTimeout {
		t.Fatalf("expected timeout class, got %q", got)
	}
	if got := ClassifyError(&RequestError{StatusCode: 401, Message: "bad auth"}, nil); got != ErrorClassAuth {
		t.Fatalf("expected auth class, got %q", got)
	}
	if got := ClassifyError(&RequestError{Message: "decode failed: unexpected field x"}, nil); got != ErrorClassSchemaDrift {
		t.Fatalf("expected schema drift class, got %q", got)
	}
	if !IsRetryableClass(ErrorClassUpstream5xx) {
		t.Fatal("expected 5xx to be retryable")
	}
	if IsRetryableClass(ErrorClassAuth) {
		t.Fatal("did not expect auth to be retryable")
	}
}
