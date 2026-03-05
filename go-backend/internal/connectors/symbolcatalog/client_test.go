// Phase 14.v2 — Symbol Catalog verification.
// Tests Normalize/Resolve; 500+ symbols verified when registry is populated.
package symbolcatalog

import (
	"context"
	"testing"
)

func TestClient_Normalize(t *testing.T) {
	client := NewClient(Config{})

	tests := []struct {
		name    string
		symbol  string
		want    string
		wantErr bool
	}{
		{"uppercase", "btc/usd", "BTC/USD", false},
		{"trim", "  ETH/USD  ", "ETH/USD", false},
		{"empty", "", "", true},
		{"whitespace only", "   ", "", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := client.Normalize(tt.symbol)
			if (err != nil) != tt.wantErr {
				t.Errorf("Normalize() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Normalize() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestClient_Resolve(t *testing.T) {
	client := NewClient(Config{})
	ctx := context.Background()

	provider, normalized, err := client.Resolve(ctx, "AAPL")
	if err != nil {
		t.Fatalf("Resolve() error = %v", err)
	}
	if normalized != "AAPL" {
		t.Errorf("Resolve() normalized = %q, want AAPL", normalized)
	}
	if provider == "" {
		t.Error("Resolve() provider should be non-empty")
	}
}

// Phase 14.v2: When registry has 500+ symbols, extend with batch verification.
func TestClient_NormalizeMany(t *testing.T) {
	client := NewClient(Config{})
	symbols := []string{"BTC/USD", "ETH/USD", "AAPL", "MSFT", "EUR/USD"}
	for _, s := range symbols {
		norm, err := client.Normalize(s)
		if err != nil {
			t.Errorf("Normalize(%q) error = %v", s, err)
		}
		if norm == "" {
			t.Errorf("Normalize(%q) returned empty", s)
		}
	}
}
