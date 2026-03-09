package marketparams

import "testing"

func TestResolveTarget_DefaultCryptoPair(t *testing.T) {
	resolved, err := ResolveTarget("BTC/USDT", "binance", "spot", DefaultExchangeConfigs, ResolveOptions{})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resolved.Exchange != "binance" || resolved.UpstreamExchange != "Binance" {
		t.Fatalf("unexpected exchange mapping: %+v", resolved)
	}
	if resolved.Symbol != "BTC/USDT" {
		t.Fatalf("expected BTC/USDT symbol, got %q", resolved.Symbol)
	}
	if resolved.Target.Symbol() != "BTC/USDT" {
		t.Fatalf("expected target BTC/USDT, got %q", resolved.Target.Symbol())
	}
}

func TestResolveTarget_InstrumentOrPair(t *testing.T) {
	resolved, err := ResolveTarget("AAPL", "finnhub", "equity", DefaultExchangeConfigs, ResolveOptions{})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resolved.Symbol != "AAPL" {
		t.Fatalf("expected normalized symbol AAPL, got %q", resolved.Symbol)
	}
	if resolved.Target.Pair.Base != "AAPL" || resolved.Target.Pair.Quote != "USD" {
		t.Fatalf("expected AAPL/USD pair, got %+v", resolved.Target.Pair)
	}
}

func TestResolveTarget_WithAutoExchangeResolver(t *testing.T) {
	resolved, err := ResolveTarget("BTC/USD", "auto", "spot", StreamExchangeConfigs, ResolveOptions{
		ResolveAutoExchange: func(assetType string) (string, ExchangeConfig, error) {
			return "kraken", StreamExchangeConfigs["kraken"], nil
		},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resolved.Exchange != "kraken" || resolved.UpstreamExchange != "Kraken" {
		t.Fatalf("unexpected resolved auto exchange: %+v", resolved)
	}
	if resolved.Target.Pair.Base != "XBT" || resolved.Target.Pair.Quote != "USD" {
		t.Fatalf("expected kraken normalized pair XBT/USD, got %+v", resolved.Target.Pair)
	}
}
