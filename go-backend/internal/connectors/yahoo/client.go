package yahoo

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/groups"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
)

const DefaultBaseURL = "https://query1.finance.yahoo.com"
const ProviderName = "yahoo"

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
	Registry       *connectorregistry.Registry
}

type Quote struct {
	Symbol        string  `json:"symbol"`
	Price         float64 `json:"price"`
	Change        float64 `json:"change"`
	ChangePercent float64 `json:"changePercent"`
	High          float64 `json:"high"`
	Low           float64 `json:"low"`
	Open          float64 `json:"open"`
	Volume        float64 `json:"volume"`
	Timestamp     int64   `json:"timestamp"`
}

type Candle struct {
	Time   int64   `json:"time"`
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

type OHLCVRequest struct {
	Symbol    string
	Timeframe string
	Limit     int
	Start     *int64
	End       *int64
}

type Client struct {
	baseClient *base.Client
	provider   string
	descriptor base.ProviderDescriptor
	group      groups.Policy
}

func NewClient(cfg Config) *Client {
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	client := &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 0,
		}),
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

func (c *Client) ProviderDescriptor() base.ProviderDescriptor {
	if c == nil {
		return base.ProviderDescriptor{}
	}
	return c.descriptor
}

func (c *Client) GroupPolicy() groups.Policy {
	if c == nil {
		return groups.Policy{}
	}
	return c.group
}

func (c *Client) GetQuote(ctx context.Context, symbol string) (Quote, error) {
	if c == nil {
		return Quote{}, fmt.Errorf("yahoo client unavailable")
	}
	trimmed := strings.TrimSpace(symbol)
	if trimmed == "" {
		return Quote{}, fmt.Errorf("symbol required")
	}

	query := url.Values{}
	query.Set("symbols", toYahooSymbol(trimmed))
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, "/v7/finance/quote", query, nil)
	if err != nil {
		return Quote{}, fmt.Errorf("build yahoo quote request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return Quote{}, fmt.Errorf("yahoo quote request failed: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= http.StatusBadRequest {
		return Quote{}, fmt.Errorf("yahoo quote upstream status %d", resp.StatusCode)
	}

	var payload struct {
		QuoteResponse struct {
			Result []struct {
				Symbol                  string  `json:"symbol"`
				RegularMarketPrice      float64 `json:"regularMarketPrice"`
				RegularMarketChange     float64 `json:"regularMarketChange"`
				RegularMarketChangePct  float64 `json:"regularMarketChangePercent"`
				RegularMarketDayHigh    float64 `json:"regularMarketDayHigh"`
				RegularMarketDayLow     float64 `json:"regularMarketDayLow"`
				RegularMarketOpen       float64 `json:"regularMarketOpen"`
				RegularMarketVolume     float64 `json:"regularMarketVolume"`
				RegularMarketTime       int64   `json:"regularMarketTime"`
				PostMarketPrice         float64 `json:"postMarketPrice"`
				PostMarketChangePercent float64 `json:"postMarketChangePercent"`
				PostMarketChange        float64 `json:"postMarketChange"`
			} `json:"result"`
		} `json:"quoteResponse"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return Quote{}, fmt.Errorf("decode yahoo quote response: %w", err)
	}
	if len(payload.QuoteResponse.Result) == 0 {
		return Quote{}, fmt.Errorf("yahoo quote returned no results")
	}

	item := payload.QuoteResponse.Result[0]
	price := item.RegularMarketPrice
	change := item.RegularMarketChange
	changePercent := item.RegularMarketChangePct
	if price <= 0 && item.PostMarketPrice > 0 {
		price = item.PostMarketPrice
		change = item.PostMarketChange
		changePercent = item.PostMarketChangePercent
	}
	if price <= 0 {
		return Quote{}, fmt.Errorf("yahoo quote returned no price")
	}

	high := item.RegularMarketDayHigh
	if high <= 0 {
		high = price
	}
	low := item.RegularMarketDayLow
	if low <= 0 {
		low = price
	}
	open := item.RegularMarketOpen
	if open <= 0 {
		open = price - change
	}
	timestamp := item.RegularMarketTime
	if timestamp <= 0 {
		timestamp = time.Now().Unix()
	}

	return Quote{
		Symbol:        strings.TrimSpace(symbol),
		Price:         price,
		Change:        change,
		ChangePercent: changePercent,
		High:          high,
		Low:           low,
		Open:          open,
		Volume:        item.RegularMarketVolume,
		Timestamp:     timestamp,
	}, nil
}

func (c *Client) GetOHLCV(ctx context.Context, req OHLCVRequest) ([]Candle, error) {
	if c == nil {
		return nil, fmt.Errorf("yahoo client unavailable")
	}
	symbol := strings.TrimSpace(req.Symbol)
	if symbol == "" {
		return nil, fmt.Errorf("symbol required")
	}
	timeframe := strings.TrimSpace(req.Timeframe)
	if timeframe == "" {
		timeframe = "1H"
	}
	limit := req.Limit
	if limit <= 0 {
		limit = 300
	}

	query := url.Values{}
	query.Set("interval", mapInterval(timeframe))
	query.Set("includePrePost", "false")
	if req.Start != nil {
		query.Set("period1", fmt.Sprintf("%d", *req.Start))
		end := time.Now().Unix()
		if req.End != nil {
			end = *req.End
		}
		query.Set("period2", fmt.Sprintf("%d", end))
	} else {
		query.Set("range", periodForLimit(timeframe, limit))
	}

	path := "/v8/finance/chart/" + url.PathEscape(toYahooSymbol(symbol))
	httpReq, err := c.baseClient.NewRequest(ctx, http.MethodGet, path, query, nil)
	if err != nil {
		return nil, fmt.Errorf("build yahoo ohlcv request: %w", err)
	}
	httpReq.Header.Set("Accept", "application/json")

	resp, err := c.baseClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("yahoo ohlcv request failed: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("yahoo ohlcv upstream status %d", resp.StatusCode)
	}

	var payload struct {
		Chart struct {
			Result []struct {
				Timestamp  []int64 `json:"timestamp"`
				Indicators struct {
					Quote []struct {
						Open   []*float64 `json:"open"`
						High   []*float64 `json:"high"`
						Low    []*float64 `json:"low"`
						Close  []*float64 `json:"close"`
						Volume []*float64 `json:"volume"`
					} `json:"quote"`
				} `json:"indicators"`
			} `json:"result"`
		} `json:"chart"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode yahoo ohlcv response: %w", err)
	}
	if len(payload.Chart.Result) == 0 || len(payload.Chart.Result[0].Indicators.Quote) == 0 {
		return nil, fmt.Errorf("yahoo ohlcv returned no results")
	}

	result := payload.Chart.Result[0]
	quote := result.Indicators.Quote[0]
	rows := make([]Candle, 0, len(result.Timestamp))
	for index, ts := range result.Timestamp {
		closeValue := valueAt(quote.Close, index)
		if closeValue == 0 {
			continue
		}
		openValue := valueAt(quote.Open, index)
		if openValue == 0 {
			openValue = closeValue
		}
		highValue := valueAt(quote.High, index)
		if highValue == 0 {
			highValue = closeValue
		}
		lowValue := valueAt(quote.Low, index)
		if lowValue == 0 {
			lowValue = closeValue
		}
		rows = append(rows, Candle{
			Time:   ts,
			Open:   openValue,
			High:   highValue,
			Low:    lowValue,
			Close:  closeValue,
			Volume: valueAt(quote.Volume, index),
		})
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("yahoo ohlcv returned no candles")
	}
	if len(rows) > limit {
		rows = rows[len(rows)-limit:]
	}
	return rows, nil
}

var indexSymbolMap = map[string]string{
	"SPX":  "^GSPC",
	"NDX":  "^NDX",
	"DJI":  "^DJI",
	"IXIC": "^IXIC",
	"DAX":  "^GDAXI",
	"FTSE": "^FTSE",
	"N225": "^N225",
	"HSI":  "^HSI",
}

func toYahooSymbol(symbol string) string {
	value := strings.ToUpper(strings.TrimSpace(symbol))
	if value == "" {
		return value
	}
	if mapped, ok := indexSymbolMap[value]; ok {
		return mapped
	}
	if strings.Contains(value, "/") {
		base, quote, _ := strings.Cut(value, "/")
		if isFiat(base) && len(quote) == 3 {
			return base + quote + "=X"
		}
		return base + "-" + quote
	}
	return value
}

func isFiat(code string) bool {
	switch strings.ToUpper(strings.TrimSpace(code)) {
	case "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD":
		return true
	default:
		return false
	}
}

func mapInterval(timeframe string) string {
	switch strings.ToUpper(strings.TrimSpace(timeframe)) {
	case "1M":
		return "1m"
	case "3M":
		return "2m"
	case "5M":
		return "5m"
	case "15M":
		return "15m"
	case "30M":
		return "30m"
	case "1H":
		return "60m"
	case "2H", "4H":
		return "1h"
	case "1D":
		return "1d"
	case "1W":
		return "1wk"
	case "1MO":
		return "1mo"
	default:
		return "1d"
	}
}

func periodForLimit(timeframe string, limit int) string {
	switch strings.ToUpper(strings.TrimSpace(timeframe)) {
	case "1W", "1MO":
		return "max"
	case "1D":
		switch {
		case limit > 2520:
			return "max"
		case limit > 1260:
			return "10y"
		case limit > 756:
			return "5y"
		default:
			return "3y"
		}
	case "1M":
		return "7d"
	case "5M":
		return "30d"
	case "15M", "30M":
		return "60d"
	case "1H", "2H", "4H":
		return "730d"
	default:
		return "1y"
	}
}

func valueAt(values []*float64, index int) float64 {
	if index < 0 || index >= len(values) || values[index] == nil {
		return 0
	}
	return *values[index]
}
