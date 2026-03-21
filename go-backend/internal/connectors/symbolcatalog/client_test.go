// Phase 14.v2 — Symbol Catalog verification.
// Tests Normalize/Resolve; 500+ symbols verified when registry is populated.
package symbolcatalog

import (
	"context"
	"testing"

	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
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

func TestClient_Search(t *testing.T) {
	client := NewClient(Config{})
	ctx := context.Background()

	t.Run("exact symbol uses builtin catalog", func(t *testing.T) {
		results, err := client.Search(ctx, "AAPL")
		if err != nil {
			t.Fatalf("Search() error = %v", err)
		}
		if len(results) == 0 {
			t.Fatal("expected at least one result")
		}
		if results[0].Symbol != "AAPL" || results[0].Type != "stock" {
			t.Fatalf("unexpected top result: %+v", results[0])
		}
	})

	t.Run("name and alias lookup work", func(t *testing.T) {
		results, err := client.Search(ctx, "bitcoin")
		if err != nil {
			t.Fatalf("Search() error = %v", err)
		}
		if len(results) == 0 || results[0].Symbol != "BTC/USD" {
			t.Fatalf("expected BTC/USD result, got %+v", results)
		}
	})

	t.Run("fallback normalizes unknown symbols", func(t *testing.T) {
		results, err := client.Search(ctx, "spy")
		if err != nil {
			t.Fatalf("Search() error = %v", err)
		}
		if len(results) == 0 || results[0].Symbol != "SPY" {
			t.Fatalf("expected normalized fallback SPY result, got %+v", results)
		}
	})
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

func TestClient_RegistryAwareDescriptor(t *testing.T) {
	reg := connectorregistry.New(connectorregistry.Config{
		AssetClasses: map[string]connectorregistry.AssetClassConfig{
			"symbol_search": {Providers: []string{"symbolcatalog"}, Strategy: "authority_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"rest": {MaxConcurrency: 1, RetryProfile: "market_read"},
		},
		Providers: map[string]connectorregistry.ProviderConfig{
			"symbolcatalog": {Group: "rest", RetryProfile: "market_read"},
		},
	})
	client := NewClient(Config{Registry: reg})

	descriptor := client.ProviderDescriptor()
	if descriptor.Name != ProviderName {
		t.Fatalf("expected provider %q, got %q", ProviderName, descriptor.Name)
	}
	if descriptor.Group != "rest" {
		t.Fatalf("expected rest group, got %q", descriptor.Group)
	}
	if policy := client.GroupPolicy(); policy.Name != "rest" || policy.RetryProfile != "market_read" {
		t.Fatalf("unexpected group policy: %+v", policy)
	}
}
