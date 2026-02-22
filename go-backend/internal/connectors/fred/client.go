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
	series, err := c.GetSeries(ctx, pair, assetType, 1)
	if err != nil {
		return gct.Ticker{}, err
	}
	if len(series) == 0 {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no observations"),
		}
	}

	seriesID := strings.ToUpper(strings.TrimSpace(pair.Base))
	value := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
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

func (c *Client) GetSeries(ctx context.Context, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error) {
	if strings.ToLower(strings.TrimSpace(assetType)) != "macro" {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported fred assetType"),
		}
	}
	if c.apiKey == "" {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusUnauthorized,
			Cause:      fmt.Errorf("missing FRED_API_KEY"),
		}
	}

	seriesID := strings.ToUpper(strings.TrimSpace(pair.Base))
	if seriesID == "" {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("missing series id"),
		}
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 500 {
		limit = 500
	}

	endpoint, err := url.Parse(c.baseURL + "/series/observations")
	if err != nil {
		return nil, fmt.Errorf("build fred url: %w", err)
	}
	query := endpoint.Query()
	query.Set("series_id", seriesID)
	query.Set("api_key", c.apiKey)
	query.Set("file_type", "json")
	query.Set("sort_order", "desc")
	query.Set("limit", strconv.Itoa(limit))
	endpoint.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		timeout := false
		var netErr net.Error
		if errors.As(err, &netErr) && netErr.Timeout() {
			timeout = true
		}
		return nil, &gct.RequestError{
			Path:    "/series/observations",
			Timeout: timeout,
			Cause:   err,
		}
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{
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
		return nil, fmt.Errorf("decode fred observations: %w", err)
	}
	if len(payload.Observations) == 0 {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no observations"),
		}
	}

	series := make([]gct.SeriesPoint, 0, len(payload.Observations))
	for _, observation := range payload.Observations {
		value, parseErr := strconv.ParseFloat(strings.TrimSpace(observation.Value), 64)
		if parseErr != nil {
			continue
		}
		timestamp := time.Now().Unix()
		if parsedDate, dateErr := time.Parse("2006-01-02", observation.Date); dateErr == nil {
			timestamp = parsedDate.Unix()
		}
		series = append(series, gct.SeriesPoint{
			Timestamp: timestamp,
			Value:     value,
		})
	}

	if len(series) == 0 {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("invalid observation value"),
		}
	}

	return series, nil
}
