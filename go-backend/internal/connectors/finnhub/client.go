package finnhub

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/requestctx"
)

const DefaultBaseURL = "https://finnhub.io/api/v1"
const DefaultWSBaseURL = "wss://ws.finnhub.io"

type Config struct {
	BaseURL        string
	WSBaseURL      string
	APIKey         string
	RequestTimeout time.Duration
	CacheTTL       time.Duration
}

type Client struct {
	baseClient     *base.Client
	wsBaseURL      string
	apiKey         string
	requestTimeout time.Duration
	quoteCache     *base.JSONHotCache
}

type cachedTicker struct {
	Currency    string  `json:"currency"`
	LastUpdated int64   `json:"lastUpdated"`
	Last        float64 `json:"last"`
	Bid         float64 `json:"bid"`
	Ask         float64 `json:"ask"`
	High        float64 `json:"high"`
	Low         float64 `json:"low"`
	Volume      float64 `json:"volume"`
}

func NewClient(cfg Config) *Client {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}

	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	wsBaseURL := strings.TrimSpace(cfg.WSBaseURL)
	if wsBaseURL == "" {
		wsBaseURL = DefaultWSBaseURL
	}
	wsBaseURL = strings.TrimRight(wsBaseURL, "/")

	return &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 1,
		}),
		wsBaseURL:      wsBaseURL,
		apiKey:         strings.TrimSpace(cfg.APIKey),
		requestTimeout: timeout,
		quoteCache:     base.NewJSONHotCache("finnhub-quote", cfg.CacheTTL),
	}
}

func (c *Client) GetTicker(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	if !gct.IsSemanticAssetType(assetType, "equity") {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported finnhub assetType"),
		}
	}
	apiKey := c.apiKeyForContext(ctx)
	if apiKey == "" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusUnauthorized,
			Cause:      fmt.Errorf("missing FINNHUB_API_KEY"),
		}
	}

	symbol := strings.ToUpper(strings.TrimSpace(pair.Base.String()))
	if symbol == "" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("missing symbol"),
		}
	}

	query := url.Values{}
	query.Set("symbol", symbol)
	query.Set("token", apiKey)
	cacheKey := base.StableCacheKey(symbol)
	if c.quoteCache != nil {
		var cached cachedTicker
		if c.quoteCache.Get(ctx, cacheKey, &cached) && cached.Last > 0 {
			return gct.Ticker{
				Pair:        currency.NewPair(currency.NewCode(cached.Currency), currency.NewCode("USD")),
				Currency:    cached.Currency,
				LastUpdated: cached.LastUpdated,
				Last:        cached.Last,
				Bid:         cached.Bid,
				Ask:         cached.Ask,
				High:        cached.High,
				Low:         cached.Low,
				Volume:      cached.Volume,
			}, nil
		}
	}
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, "/quote", query, nil)
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("build finnhub quote request for %s: %w", symbol, err)
	}

	ticker, err := c.doTickerRequest(req)
	if err != nil {
		return gct.Ticker{}, err
	}
	if c.quoteCache != nil {
		c.quoteCache.Set(ctx, cacheKey, cachedTicker{
			Currency:    ticker.Currency,
			LastUpdated: ticker.LastUpdated,
			Last:        ticker.Last,
			Bid:         ticker.Bid,
			Ask:         ticker.Ask,
			High:        ticker.High,
			Low:         ticker.Low,
			Volume:      ticker.Volume,
		})
	}
	return ticker, nil
}

func (c *Client) doTickerRequest(req *http.Request) (gct.Ticker, error) {
	resp, err := c.baseClient.Do(req)
	if err != nil {
		timeout := false
		var netErr net.Error
		if errors.As(err, &netErr) && netErr.Timeout() {
			timeout = true
		}
		return gct.Ticker{}, &gct.RequestError{
			Path:    "/quote",
			Timeout: timeout,
			Cause:   err,
		}
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= http.StatusBadRequest {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: resp.StatusCode,
		}
	}

	var payload struct {
		Current   float64 `json:"c"`
		High      float64 `json:"h"`
		Low       float64 `json:"l"`
		Timestamp int64   `json:"t"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return gct.Ticker{}, fmt.Errorf("decode finnhub quote: %w", err)
	}
	if payload.Current <= 0 {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("no quote data"),
		}
	}

	high := payload.High
	if high <= 0 {
		high = payload.Current
	}
	low := payload.Low
	if low <= 0 {
		low = payload.Current
	}
	lastUpdated := payload.Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}

	symbol := strings.ToUpper(strings.TrimSpace(req.URL.Query().Get("symbol")))
	if symbol == "" {
		symbol = "UNKNOWN"
	}

	return gct.Ticker{
		Pair:        currency.NewPair(currency.NewCode(symbol), currency.NewCode("USD")),
		Currency:    symbol,
		LastUpdated: lastUpdated,
		Last:        payload.Current,
		Bid:         payload.Current,
		Ask:         payload.Current,
		High:        high,
		Low:         low,
		Volume:      0,
	}, nil
}

func (c *Client) apiKeyForContext(ctx context.Context) string {
	if creds, ok := requestctx.ProviderCredential(ctx, "finnhub"); ok {
		if key := strings.TrimSpace(creds.Key); key != "" {
			return key
		}
	}
	return strings.TrimSpace(c.apiKey)
}

func (c *Client) OpenTradeStream(ctx context.Context, symbol string) (<-chan gct.Ticker, <-chan error, error) {
	apiKey := c.apiKeyForContext(ctx)
	if apiKey == "" {
		return nil, nil, &gct.RequestError{
			Path:       "/ws",
			StatusCode: http.StatusUnauthorized,
			Cause:      fmt.Errorf("missing FINNHUB_API_KEY"),
		}
	}

	instrument := strings.ToUpper(strings.TrimSpace(symbol))
	if instrument == "" {
		return nil, nil, &gct.RequestError{
			Path:       "/ws",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("missing symbol"),
		}
	}

	endpoint, err := url.Parse(c.wsBaseURL)
	if err != nil {
		return nil, nil, fmt.Errorf("build finnhub websocket url: %w", err)
	}
	query := endpoint.Query()
	query.Set("token", apiKey)
	endpoint.RawQuery = query.Encode()

	tickerChannel := make(chan gct.Ticker)
	errorChannel := make(chan error, 1)

	wsClient := base.NewWebsocketClient(base.WebsocketConfig{
		URL:                 endpoint.String(),
		HandshakeTimeout:    c.requestTimeout,
		PingInterval:        30 * time.Second,
		WriteWait:           10 * time.Second,
		ReconnectInterval:   2 * time.Second,
		MaxReconnectRetries: 5,
	})

	wsClient.SetOnConnect(func() error {
		subscribePayload := map[string]string{
			"type":   "subscribe",
			"symbol": instrument,
		}
		return wsClient.WriteJSON(subscribePayload)
	})

	wsClient.SetErrorHandler(func(err error) {
		select {
		case errorChannel <- fmt.Errorf("finnhub websocket error: %w", err):
		default:
		}
	})

	wsClient.SetMessageHandler(func(messageType int, message []byte) {
		if messageType != websocket.TextMessage {
			return
		}

		var payload struct {
			Type string `json:"type"`
			Data []struct {
				Price     float64 `json:"p"`
				Symbol    string  `json:"s"`
				Timestamp int64   `json:"t"`
				Volume    float64 `json:"v"`
			} `json:"data"`
		}
		if err := json.Unmarshal(message, &payload); err != nil {
			// Not all messages are trades (e.g. ping), just ignore decode errors for now
			return
		}

		if strings.ToLower(payload.Type) != "trade" {
			return
		}

		for _, trade := range payload.Data {
			if trade.Price <= 0 {
				continue
			}

			tradeSymbol := strings.ToUpper(strings.TrimSpace(trade.Symbol))
			if tradeSymbol == "" {
				tradeSymbol = instrument
			}
			lastUpdated := trade.Timestamp / 1000
			if lastUpdated <= 0 {
				lastUpdated = time.Now().Unix()
			}

			ticker := gct.Ticker{
				Pair:        currency.NewPair(currency.NewCode(tradeSymbol), currency.NewCode("USD")),
				Currency:    tradeSymbol,
				LastUpdated: lastUpdated,
				Last:        trade.Price,
				Bid:         trade.Price,
				Ask:         trade.Price,
				High:        trade.Price,
				Low:         trade.Price,
				Volume:      trade.Volume,
			}

			select {
			case <-ctx.Done():
				return
			case tickerChannel <- ticker:
			}
		}
	})

	if err := wsClient.Connect(ctx); err != nil {
		return nil, nil, fmt.Errorf("connect finnhub websocket: %w", err)
	}

	go func() {
		<-ctx.Done()
		wsClient.Close()
		close(tickerChannel)
		close(errorChannel)
	}()

	return tickerChannel, errorChannel, nil
}
