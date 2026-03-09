package gct

import (
	"errors"
	"testing"

	gctrpc "github.com/thrasher-corp/gocryptotrader/gctrpc"
	"google.golang.org/grpc/codes"
)

func TestFromGRPCExchanges_ParsesCommaSeparatedNames(t *testing.T) {
	got := fromGRPCExchanges(&gctrpc.GetExchangesResponse{
		Exchanges: "Binance,Kraken,Coinbase",
	})

	if len(got) != 3 {
		t.Fatalf("expected 3 exchanges, got %d", len(got))
	}
	if got[0].Name != "Binance" || got[1].Name != "Kraken" || got[2].Name != "Coinbase" {
		t.Fatalf("unexpected exchanges: %#v", got)
	}
}

func TestFromGRPCAccountInfo_MapsBalances(t *testing.T) {
	got := fromGRPCAccountInfo(&gctrpc.GetAccountBalancesResponse{
		Exchange: "Binance",
		Accounts: []*gctrpc.Account{
			{
				Id: "spot",
				Currencies: []*gctrpc.AccountCurrencyInfo{
					{
						Currency:          "BTC",
						TotalValue:        1.25,
						Hold:              0.25,
						Free:              1.0,
						FreeWithoutBorrow: 1.0,
					},
				},
			},
		},
	})

	if got.Exchange != "Binance" {
		t.Fatalf("expected exchange Binance, got %q", got.Exchange)
	}
	if len(got.Accounts) != 1 {
		t.Fatalf("expected 1 account, got %d", len(got.Accounts))
	}
	if got.Accounts[0].ID != "spot" {
		t.Fatalf("expected account id spot, got %q", got.Accounts[0].ID)
	}
	if len(got.Accounts[0].Currencies) != 1 {
		t.Fatalf("expected 1 currency, got %d", len(got.Accounts[0].Currencies))
	}

	balance := got.Accounts[0].Currencies[0]
	if balance.Currency != "BTC" || balance.Total != 1.25 || balance.Hold != 0.25 || balance.Available != 1.0 || balance.FreeWithoutBorrow != 1.0 {
		t.Fatalf("unexpected balance mapping: %#v", balance)
	}
}

func TestShouldFallbackFromGRPC(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want bool
	}{
		{name: "unimplemented", err: &RPCError{Code: codes.Unimplemented}, want: true},
		{name: "unavailable", err: &RPCError{Code: codes.Unavailable}, want: true},
		{name: "deadline exceeded", err: &RPCError{Code: codes.DeadlineExceeded}, want: true},
		{name: "invalid argument", err: &RPCError{Code: codes.InvalidArgument}, want: false},
		{name: "plain error", err: errors.New("boom"), want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := shouldFallbackFromGRPC(tt.err); got != tt.want {
				t.Fatalf("expected %v, got %v", tt.want, got)
			}
		})
	}
}
