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
	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

const DefaultBaseURL = "https://finnhub.io/api/v1"
const DefaultWSBaseURL = "wss://ws.finnhub.io"

type Config struct {
	BaseURL        string
	WSBaseURL      string
	APIKey         string
	RequestTimeout time.Duration
}

type Client struct {
	baseClient     *base.Client
	wsBaseURL      string
	apiKey         string
	requestTimeout time.Duration
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
	if c.apiKey == "" {
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
	query.Set("token", c.apiKey)
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, "/quote", query, nil)
	if err != nil {
		return gct.Ticker{}, err
	}

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

func (c *Client) OpenTradeStream(ctx context.Context, symbol string) (<-chan gct.Ticker, <-chan error, error) {
	if c.apiKey == "" {
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
	query.Set("token", c.apiKey)
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
