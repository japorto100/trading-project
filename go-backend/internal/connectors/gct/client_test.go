package gct

import (
	"context"
	"encoding/json"
	"testing"
	"time"
)

func TestParseUnixTimestamp_Number(t *testing.T) {
	value, err := parseUnixTimestamp(json.RawMessage("1771113584"))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if value != 1771113584 {
		t.Fatalf("expected 1771113584, got %d", value)
	}
}

func TestParseUnixTimestamp_String(t *testing.T) {
	value, err := parseUnixTimestamp(json.RawMessage(`"1771113584"`))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if value != 1771113584 {
		t.Fatalf("expected 1771113584, got %d", value)
	}
}

func TestParseUnixTimestamp_Empty(t *testing.T) {
	value, err := parseUnixTimestamp(nil)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if value != 0 {
		t.Fatalf("expected 0, got %d", value)
	}
}

func TestParseUnixTimestamp_Invalid(t *testing.T) {
	_, err := parseUnixTimestamp(json.RawMessage(`"abc"`))
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestWithStreamContext_NoDeadlineDoesNotInjectTimeout(t *testing.T) {
	client := NewClient(Config{RequestTimeout: 50 * time.Millisecond})

	streamContext, cancel := client.withStreamContext(context.Background())
	defer cancel()

	if _, hasDeadline := streamContext.Deadline(); hasDeadline {
		t.Fatal("expected stream context without injected deadline")
	}
}

func TestWithStreamContext_PreservesParentDeadline(t *testing.T) {
	client := NewClient(Config{RequestTimeout: 50 * time.Millisecond})
	parentContext, parentCancel := context.WithTimeout(context.Background(), time.Second)
	defer parentCancel()

	streamContext, cancel := client.withStreamContext(parentContext)
	defer cancel()

	if _, hasDeadline := streamContext.Deadline(); !hasDeadline {
		t.Fatal("expected stream context to preserve parent deadline")
	}
}

func TestNewClient_RespectsPreferGRPCFalse(t *testing.T) {
	client := NewClient(Config{
		JsonRPCAddress: "127.0.0.1:9053",
		PreferGRPC:     false,
	})

	if client.cfg.PreferGRPC {
		t.Fatal("expected PreferGRPC to remain false")
	}
}
