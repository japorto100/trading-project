package marketparams

import (
	"fmt"
	"regexp"
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"
)

var symbolPartPattern = regexp.MustCompile(`^[A-Z0-9]{2,20}$`)
var macroInstrumentPattern = regexp.MustCompile(`^[A-Z0-9_]{2,40}$`)

type ExchangeConfig struct {
	Upstream          string
	Source            string
	AllowedAssetTypes map[string]struct{}
	DefaultQuote      string
	SymbolFormat      string
}

type ResolveOptions struct {
	ResolveAutoExchange func(assetType string) (string, ExchangeConfig, error)
}

type ResolvedTarget struct {
	Symbol           string
	Exchange         string
	UpstreamExchange string
	AssetType        string
	Pair             contracts.Pair
	Target           contracts.MarketTarget
	Source           string
}

var DefaultExchangeConfigs = map[string]ExchangeConfig{
	"binance":  {Upstream: "Binance", Source: "gct", AllowedAssetTypes: set("spot", "margin", "futures"), DefaultQuote: "USDT", SymbolFormat: "pair"},
	"kraken":   {Upstream: "Kraken", Source: "gct", AllowedAssetTypes: set("spot", "margin", "futures"), DefaultQuote: "USD", SymbolFormat: "pair"},
	"coinbase": {Upstream: "Coinbase", Source: "gct", AllowedAssetTypes: set("spot", "margin", "futures"), DefaultQuote: "USD", SymbolFormat: "pair"},
	"okx":      {Upstream: "OKX", Source: "gct", AllowedAssetTypes: set("spot", "margin", "futures"), DefaultQuote: "USDT", SymbolFormat: "pair"},
	"bybit":    {Upstream: "Bybit", Source: "gct", AllowedAssetTypes: set("spot", "margin", "futures"), DefaultQuote: "USDT", SymbolFormat: "pair"},
	"auto":     {Upstream: "AUTO", Source: "router", AllowedAssetTypes: set("spot", "margin", "futures", "equity", "forex", "macro"), DefaultQuote: "USD", SymbolFormat: "instrument_or_pair"},
	"ecb":      {Upstream: "ECB", Source: "ecb", AllowedAssetTypes: set("forex"), DefaultQuote: "USD", SymbolFormat: "pair"},
	"finnhub":  {Upstream: "FINNHUB", Source: "finnhub", AllowedAssetTypes: set("equity"), DefaultQuote: "USD", SymbolFormat: "instrument_or_pair"},
	"fred":     {Upstream: "FRED", Source: "fred", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"fed":      {Upstream: "FED", Source: "fred", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"boj":      {Upstream: "BOJ", Source: "fred", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"snb":      {Upstream: "SNB", Source: "fred", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"bcb":      {Upstream: "BCB", Source: "bcb", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"banxico":  {Upstream: "BANXICO", Source: "banxico", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"bok":      {Upstream: "BOK", Source: "bok", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"bcra":     {Upstream: "BCRA", Source: "bcra", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"tcmb":     {Upstream: "TCMB", Source: "tcmb", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"rbi":      {Upstream: "RBI", Source: "rbi", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
	"imf":      {Upstream: "IMF", Source: "imf", AllowedAssetTypes: set("macro"), DefaultQuote: "USD", SymbolFormat: "instrument"},
}

var StreamExchangeConfigs = map[string]ExchangeConfig{
	"auto":     DefaultExchangeConfigs["auto"],
	"binance":  DefaultExchangeConfigs["binance"],
	"kraken":   DefaultExchangeConfigs["kraken"],
	"coinbase": DefaultExchangeConfigs["coinbase"],
	"okx":      DefaultExchangeConfigs["okx"],
	"bybit":    DefaultExchangeConfigs["bybit"],
	"finnhub":  DefaultExchangeConfigs["finnhub"],
}

func ResolveTarget(symbol, exchange, assetType string, configs map[string]ExchangeConfig, opts ResolveOptions) (ResolvedTarget, error) {
	exchange = strings.ToLower(strings.TrimSpace(exchange))
	if exchange == "" {
		exchange = "binance"
	}
	assetType = strings.ToLower(strings.TrimSpace(assetType))
	if assetType == "" {
		assetType = "spot"
	}
	symbol = strings.TrimSpace(symbol)
	if symbol == "" {
		symbol = "BTC/USDT"
	}

	exchangeCfg, ok := configs[exchange]
	if !ok {
		return ResolvedTarget{}, fmt.Errorf("unsupported exchange")
	}
	if exchange == "auto" && opts.ResolveAutoExchange != nil {
		resolvedExchange, resolvedCfg, err := opts.ResolveAutoExchange(assetType)
		if err != nil {
			return ResolvedTarget{}, err
		}
		exchange = resolvedExchange
		exchangeCfg = resolvedCfg
	}
	if _, assetAllowed := exchangeCfg.AllowedAssetTypes[assetType]; !assetAllowed {
		return ResolvedTarget{}, fmt.Errorf("unsupported assetType")
	}

	pair, normalizedSymbol, ok := resolveSymbol(symbol, exchangeCfg)
	if !ok {
		return ResolvedTarget{}, fmt.Errorf("invalid symbol format")
	}
	pair = normalizePairForExchange(exchange, pair)

	target := contracts.MarketTarget{
		Exchange:  exchangeCfg.Upstream,
		AssetType: assetType,
		Pair:      pair,
	}
	return ResolvedTarget{
		Symbol:           normalizedSymbol,
		Exchange:         exchange,
		UpstreamExchange: exchangeCfg.Upstream,
		AssetType:        assetType,
		Pair:             pair,
		Target:           target,
		Source:           exchangeCfg.Source,
	}, nil
}

func resolveSymbol(symbol string, cfg ExchangeConfig) (contracts.Pair, string, bool) {
	switch cfg.SymbolFormat {
	case "instrument":
		instrument, ok := parseMacroInstrumentSymbol(symbol)
		if !ok {
			return contracts.Pair{}, "", false
		}
		quote := cfg.DefaultQuote
		if quote == "" {
			quote = "USD"
		}
		return contracts.Pair{Base: instrument, Quote: strings.ToUpper(quote)}, instrument, true
	case "instrument_or_pair":
		if pair, ok := parseSymbol(symbol); ok {
			return pair, pair.Symbol(), true
		}
		instrument, ok := parseInstrumentSymbol(symbol)
		if !ok {
			return contracts.Pair{}, "", false
		}
		quote := cfg.DefaultQuote
		if quote == "" {
			quote = "USD"
		}
		return contracts.Pair{Base: instrument, Quote: strings.ToUpper(quote)}, instrument, true
	default:
		pair, ok := parseSymbol(symbol)
		if !ok {
			return contracts.Pair{}, "", false
		}
		return pair, pair.Symbol(), true
	}
}

func parseSymbol(symbol string) (contracts.Pair, bool) {
	normalized := strings.TrimSpace(strings.ToUpper(symbol))
	normalized = strings.ReplaceAll(normalized, "-", "/")
	normalized = strings.ReplaceAll(normalized, "_", "/")
	parts := strings.Split(normalized, "/")
	if len(parts) != 2 {
		return contracts.Pair{}, false
	}
	if !symbolPartPattern.MatchString(parts[0]) || !symbolPartPattern.MatchString(parts[1]) {
		return contracts.Pair{}, false
	}
	return contracts.Pair{Base: parts[0], Quote: parts[1]}, true
}

func parseInstrumentSymbol(symbol string) (string, bool) {
	normalized := strings.TrimSpace(strings.ToUpper(symbol))
	normalized = strings.ReplaceAll(normalized, "-", "")
	normalized = strings.ReplaceAll(normalized, "_", "")
	if !symbolPartPattern.MatchString(normalized) {
		return "", false
	}
	return normalized, true
}

func parseMacroInstrumentSymbol(symbol string) (string, bool) {
	normalized := strings.TrimSpace(strings.ToUpper(symbol))
	normalized = strings.ReplaceAll(normalized, "-", "_")
	normalized = strings.ReplaceAll(normalized, " ", "_")
	for strings.Contains(normalized, "__") {
		normalized = strings.ReplaceAll(normalized, "__", "_")
	}
	if !macroInstrumentPattern.MatchString(normalized) {
		return "", false
	}
	return normalized, true
}

func normalizePairForExchange(exchange string, pair contracts.Pair) contracts.Pair {
	normalized := pair.Normalized()
	base := normalized.Base
	quote := normalized.Quote
	switch strings.ToLower(strings.TrimSpace(exchange)) {
	case "kraken":
		if base == "BTC" {
			base = "XBT"
		}
		if quote == "" {
			quote = "USD"
		}
	case "binance", "okx", "bybit":
		if quote == "" || quote == "USD" {
			quote = "USDT"
		}
	case "coinbase":
		if quote == "" {
			quote = "USD"
		}
	}
	return contracts.Pair{Base: base, Quote: quote}
}

func set(values ...string) map[string]struct{} {
	out := make(map[string]struct{}, len(values))
	for _, value := range values {
		out[value] = struct{}{}
	}
	return out
}
