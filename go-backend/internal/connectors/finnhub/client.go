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
	"tradeviewfusion/go-backend/internal/connectors/gct"
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
	baseURL    string
	wsBaseURL  string
	apiKey     string
	httpClient *http.Client
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
	baseURL = strings.TrimRight(baseURL, "/")
	wsBaseURL := strings.TrimSpace(cfg.WSBaseURL)
	if wsBaseURL == "" {
		wsBaseURL = DefaultWSBaseURL
	}
	wsBaseURL = strings.TrimRight(wsBaseURL, "/")

	return &Client{
		baseURL:   baseURL,
		wsBaseURL: wsBaseURL,
		apiKey:    strings.TrimSpace(cfg.APIKey),
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *Client) GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	if strings.ToLower(strings.TrimSpace(assetType)) != "equity" {
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

	symbol := strings.ToUpper(strings.TrimSpace(pair.Base))
	if symbol == "" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("missing symbol"),
		}
	}

	endpoint, err := url.Parse(c.baseURL + "/quote")
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("build finnhub url: %w", err)
	}
	query := endpoint.Query()
	query.Set("symbol", symbol)
	query.Set("token", c.apiKey)
	endpoint.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("build request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
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
		Pair:        gct.Pair{Base: symbol, Quote: "USD"},
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

	dialer := websocket.Dialer{
		HandshakeTimeout: c.httpClient.Timeout,
	}
	connection, _, err := dialer.DialContext(ctx, endpoint.String(), nil)
	if err != nil {
		return nil, nil, &gct.RequestError{
			Path:  "/ws",
			Cause: err,
		}
	}

	subscribePayload := map[string]string{
		"type":   "subscribe",
		"symbol": instrument,
	}
	if err := connection.WriteJSON(subscribePayload); err != nil {
		_ = connection.Close()
		return nil, nil, fmt.Errorf("subscribe finnhub symbol: %w", err)
	}

	tickerChannel := make(chan gct.Ticker)
	errorChannel := make(chan error, 1)

	go func() {
		defer close(tickerChannel)
		defer close(errorChannel)
		defer func() { _ = connection.Close() }()

		for {
			select {
			case <-ctx.Done():
				return
			default:
			}

			_, message, readErr := connection.ReadMessage()
			if readErr != nil {
				if ctx.Err() != nil {
					return
				}
				errorChannel <- fmt.Errorf("read finnhub websocket payload: %w", readErr)
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
				errorChannel <- fmt.Errorf("decode finnhub websocket payload: %w", err)
				return
			}

			if strings.ToLower(payload.Type) != "trade" {
				continue
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
					Pair:        gct.Pair{Base: tradeSymbol, Quote: "USD"},
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
		}
	}()

	return tickerChannel, errorChannel, nil
}
