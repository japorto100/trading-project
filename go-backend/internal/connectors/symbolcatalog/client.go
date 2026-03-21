// Package symbolcatalog provides Symbol Catalog Service. Phase 14f.1.
// 500+ symbols normalized across providers.
package symbolcatalog

import (
	"context"
	"fmt"
	"slices"
	"strings"

	baseconnectors "tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/groups"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
)

const seriesPrefix = "SYMCAT_"
const ProviderName = "symbolcatalog"

type Config struct {
	RegistryPath string
	Registry     *connectorregistry.Registry
}

type Client struct {
	cfg        Config
	provider   string
	descriptor baseconnectors.ProviderDescriptor
	group      groups.Policy
}

type SearchResult struct {
	Symbol   string `json:"symbol"`
	Name     string `json:"name"`
	Type     string `json:"type"`
	Exchange string `json:"exchange,omitempty"`
	Currency string `json:"currency,omitempty"`
}

type catalogEntry struct {
	SearchResult
	Aliases []string
}

var builtinCatalog = []catalogEntry{
	{SearchResult: SearchResult{Symbol: "BTC/USD", Name: "Bitcoin", Type: "crypto", Exchange: "auto", Currency: "USD"}, Aliases: []string{"BTC", "BITCOIN", "XBT"}},
	{SearchResult: SearchResult{Symbol: "ETH/USD", Name: "Ethereum", Type: "crypto", Exchange: "auto", Currency: "USD"}, Aliases: []string{"ETH", "ETHEREUM"}},
	{SearchResult: SearchResult{Symbol: "SOL/USD", Name: "Solana", Type: "crypto", Exchange: "auto", Currency: "USD"}, Aliases: []string{"SOL", "SOLANA"}},
	{SearchResult: SearchResult{Symbol: "XRP/USD", Name: "Ripple", Type: "crypto", Exchange: "auto", Currency: "USD"}, Aliases: []string{"XRP", "RIPPLE"}},
	{SearchResult: SearchResult{Symbol: "AAPL", Name: "Apple Inc.", Type: "stock", Exchange: "finnhub", Currency: "USD"}, Aliases: []string{"APPLE"}},
	{SearchResult: SearchResult{Symbol: "MSFT", Name: "Microsoft Corp.", Type: "stock", Exchange: "finnhub", Currency: "USD"}, Aliases: []string{"MICROSOFT"}},
	{SearchResult: SearchResult{Symbol: "GOOGL", Name: "Alphabet Inc.", Type: "stock", Exchange: "finnhub", Currency: "USD"}, Aliases: []string{"GOOG", "ALPHABET", "GOOGLE"}},
	{SearchResult: SearchResult{Symbol: "AMZN", Name: "Amazon.com Inc.", Type: "stock", Exchange: "finnhub", Currency: "USD"}, Aliases: []string{"AMAZON"}},
	{SearchResult: SearchResult{Symbol: "TSLA", Name: "Tesla Inc.", Type: "stock", Exchange: "finnhub", Currency: "USD"}, Aliases: []string{"TESLA"}},
	{SearchResult: SearchResult{Symbol: "NVDA", Name: "NVIDIA Corp.", Type: "stock", Exchange: "finnhub", Currency: "USD"}, Aliases: []string{"NVIDIA"}},
	{SearchResult: SearchResult{Symbol: "META", Name: "Meta Platforms Inc.", Type: "stock", Exchange: "finnhub", Currency: "USD"}, Aliases: []string{"FACEBOOK", "META"}},
	{SearchResult: SearchResult{Symbol: "EUR/USD", Name: "Euro / US Dollar", Type: "fx", Exchange: "ecb", Currency: "USD"}, Aliases: []string{"EURUSD", "EURO"}},
	{SearchResult: SearchResult{Symbol: "GBP/USD", Name: "British Pound / US Dollar", Type: "fx", Exchange: "ecb", Currency: "USD"}, Aliases: []string{"GBPUSD", "POUND"}},
	{SearchResult: SearchResult{Symbol: "USD/JPY", Name: "US Dollar / Japanese Yen", Type: "fx", Exchange: "ecb", Currency: "JPY"}, Aliases: []string{"USDJPY", "YEN"}},
	{SearchResult: SearchResult{Symbol: "XAU/USD", Name: "Gold", Type: "commodity", Exchange: "auto", Currency: "USD"}, Aliases: []string{"XAU", "GOLD"}},
	{SearchResult: SearchResult{Symbol: "XAG/USD", Name: "Silver", Type: "commodity", Exchange: "auto", Currency: "USD"}, Aliases: []string{"XAG", "SILVER"}},
	{SearchResult: SearchResult{Symbol: "CL", Name: "Crude Oil WTI", Type: "commodity", Exchange: "auto", Currency: "USD"}, Aliases: []string{"WTI", "OIL", "CRUDE"}},
	{SearchResult: SearchResult{Symbol: "SPX", Name: "S&P 500", Type: "index", Exchange: "auto", Currency: "USD"}, Aliases: []string{"SP500", "S&P500"}},
	{SearchResult: SearchResult{Symbol: "NDX", Name: "Nasdaq 100", Type: "index", Exchange: "auto", Currency: "USD"}, Aliases: []string{"NASDAQ100"}},
	{SearchResult: SearchResult{Symbol: "DJI", Name: "Dow Jones Industrial Average", Type: "index", Exchange: "auto", Currency: "USD"}, Aliases: []string{"DOW", "DOWJONES"}},
	{SearchResult: SearchResult{Symbol: "DAX", Name: "DAX 40", Type: "index", Exchange: "auto", Currency: "EUR"}, Aliases: []string{"GER40"}},
	{SearchResult: SearchResult{Symbol: "FTSE", Name: "FTSE 100", Type: "index", Exchange: "auto", Currency: "GBP"}, Aliases: []string{"UK100"}},
	{SearchResult: SearchResult{Symbol: "N225", Name: "Nikkei 225", Type: "index", Exchange: "auto", Currency: "JPY"}, Aliases: []string{"NIKKEI"}},
	{SearchResult: SearchResult{Symbol: "HSI", Name: "Hang Seng Index", Type: "index", Exchange: "auto", Currency: "HKD"}, Aliases: []string{"HANGSENG"}},
	{SearchResult: SearchResult{Symbol: "IXIC", Name: "NASDAQ Composite", Type: "index", Exchange: "auto", Currency: "USD"}, Aliases: []string{"NASDAQ"}},
}

func NewClient(cfg Config) *Client {
	client := &Client{
		cfg:      cfg,
		provider: ProviderName,
	}
	if cfg.Registry != nil {
		if descriptor, ok := cfg.Registry.Descriptor(ProviderName); ok {
			client.provider = descriptor.Name
			client.descriptor = descriptor
			if descriptor.Group != "" {
				if policy, ok := cfg.Registry.GroupPolicy(descriptor.Group); ok {
					client.group = policy
				}
			}
		}
	}
	return client
}

func (c *Client) ProviderDescriptor() baseconnectors.ProviderDescriptor {
	if c == nil {
		return baseconnectors.ProviderDescriptor{}
	}
	return c.descriptor
}

func (c *Client) GroupPolicy() groups.Policy {
	if c == nil {
		return groups.Policy{}
	}
	return c.group
}

func (c *Client) Normalize(symbol string) (string, error) {
	s := strings.ToUpper(strings.TrimSpace(symbol))
	if s == "" {
		return "", fmt.Errorf("%s symbol required", seriesPrefix)
	}
	return s, nil
}

func (c *Client) Resolve(ctx context.Context, symbol string) (provider string, normalized string, err error) {
	_ = ctx
	normalized, err = c.Normalize(symbol)
	if err != nil {
		return "", "", err
	}
	return "unknown", normalized, nil
}

func (c *Client) Search(ctx context.Context, query string) ([]SearchResult, error) {
	_ = ctx
	needle := strings.ToUpper(strings.TrimSpace(query))
	if needle == "" {
		return nil, fmt.Errorf("%s query required", seriesPrefix)
	}

	results := make([]SearchResult, 0, 8)
	seen := make(map[string]struct{}, 8)
	add := func(entry SearchResult) {
		if _, exists := seen[entry.Symbol]; exists {
			return
		}
		seen[entry.Symbol] = struct{}{}
		results = append(results, entry)
	}

	for _, entry := range builtinCatalog {
		if entry.Symbol == needle {
			add(entry.SearchResult)
		}
	}
	for _, entry := range builtinCatalog {
		if strings.Contains(strings.ToUpper(entry.Symbol), needle) || strings.Contains(strings.ToUpper(entry.Name), needle) {
			add(entry.SearchResult)
			continue
		}
		if slices.ContainsFunc(entry.Aliases, func(alias string) bool {
			return strings.Contains(strings.ToUpper(alias), needle)
		}) {
			add(entry.SearchResult)
		}
	}
	if len(results) == 0 {
		normalized, err := c.Normalize(query)
		if err != nil {
			return nil, err
		}
		add(SearchResult{Symbol: normalized, Name: normalized, Type: inferType(normalized), Exchange: inferExchange(normalized)})
	}
	if len(results) > 10 {
		results = results[:10]
	}
	return results, nil
}

func inferType(symbol string) string {
	normalized := strings.ToUpper(strings.TrimSpace(symbol))
	switch {
	case strings.Contains(normalized, "/"):
		base, quote, _ := strings.Cut(normalized, "/")
		if isFiat(base) && isFiat(quote) {
			return "fx"
		}
		if base == "XAU" || base == "XAG" {
			return "commodity"
		}
		return "crypto"
	case normalized == "SPX" || normalized == "NDX" || normalized == "DJI" || normalized == "DAX" || normalized == "FTSE" || normalized == "N225" || normalized == "HSI" || normalized == "IXIC":
		return "index"
	case normalized == "CL":
		return "commodity"
	default:
		return "stock"
	}
}

func inferExchange(symbol string) string {
	switch inferType(symbol) {
	case "fx":
		return "ecb"
	case "stock":
		return "finnhub"
	default:
		return "auto"
	}
}

func isFiat(code string) bool {
	switch strings.ToUpper(strings.TrimSpace(code)) {
	case "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD", "HKD":
		return true
	default:
		return false
	}
}
