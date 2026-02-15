package fred

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultBaseURL = "https://api.stlouisfed.org/fred"

type Config struct {
	BaseURL        string
	APIKey         string
	RequestTimeout time.Duration
}

type Client struct {
	baseURL    string
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

	return &Client{
		baseURL: baseURL,
		apiKey:  strings.TrimSpace(cfg.APIKey),
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *Client) GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	if strings.ToLower(strings.TrimSpace(assetType)) != "macro" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported fred assetType"),
		}
	}
	if c.apiKey == "" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusUnauthorized,
			Cause:      fmt.Errorf("missing FRED_API_KEY"),
		}
	}

	seriesID := strings.ToUpper(strings.TrimSpace(pair.Base))
	if seriesID == "" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("missing series id"),
		}
	}

	endpoint, err := url.Parse(c.baseURL + "/series/observations")
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("build fred url: %w", err)
	}
	query := endpoint.Query()
	query.Set("series_id", seriesID)
	query.Set("api_key", c.apiKey)
	query.Set("file_type", "json")
	query.Set("sort_order", "desc")
	query.Set("limit", "1")
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
			Path:    "/series/observations",
			Timeout: timeout,
			Cause:   err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: resp.StatusCode,
		}
	}

	var payload struct {
		Observations []struct {
			Date  string `json:"date"`
			Value string `json:"value"`
		} `json:"observations"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return gct.Ticker{}, fmt.Errorf("decode fred observations: %w", err)
	}
	if len(payload.Observations) == 0 {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no observations"),
		}
	}

	value, err := strconv.ParseFloat(strings.TrimSpace(payload.Observations[0].Value), 64)
	if err != nil {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("invalid observation value"),
		}
	}

	lastUpdated := time.Now().Unix()
	if parsedDate, parseErr := time.Parse("2006-01-02", payload.Observations[0].Date); parseErr == nil {
		lastUpdated = parsedDate.Unix()
	}

	return gct.Ticker{
		Pair:        gct.Pair{Base: seriesID, Quote: "USD"},
		Currency:    seriesID,
		LastUpdated: lastUpdated,
		Last:        value,
		Bid:         value,
		Ask:         value,
		High:        value,
		Low:         value,
		Volume:      0,
	}, nil
}
