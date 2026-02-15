package news

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

const DefaultGDELTBaseURL = "https://api.gdeltproject.org/api/v2/doc/doc"

type GDELTClientConfig struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type GDELTClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewGDELTClient(cfg GDELTClientConfig) *GDELTClient {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultGDELTBaseURL
	}
	return &GDELTClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *GDELTClient) Fetch(ctx context.Context, symbol string, limit int) ([]marketServices.Headline, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 250 {
		limit = 250
	}

	queryTerm := "finance OR markets"
	symbol = strings.TrimSpace(symbol)
	if symbol != "" {
		queryTerm = symbol + " AND (finance OR markets)"
	}

	parsedURL, err := url.Parse(c.baseURL)
	if err != nil {
		return nil, err
	}
	query := parsedURL.Query()
	query.Set("query", queryTerm)
	query.Set("mode", "artlist")
	query.Set("format", "json")
	query.Set("maxrecords", strconv.Itoa(limit))
	query.Set("sort", "DateDesc")
	parsedURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, parsedURL.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, nil
	}

	var payload struct {
		Articles []struct {
			Title string `json:"title"`
			URL   string `json:"url"`
			Seen  string `json:"seendate"`
		} `json:"articles"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}

	items := make([]marketServices.Headline, 0, len(payload.Articles))
	for _, article := range payload.Articles {
		publishedAt := time.Now().UTC()
		if parsedSeen, err := time.Parse("20060102T150405Z", strings.TrimSpace(article.Seen)); err == nil {
			publishedAt = parsedSeen.UTC()
		}
		items = append(items, marketServices.Headline{
			Title:       strings.TrimSpace(article.Title),
			URL:         strings.TrimSpace(article.URL),
			Source:      "gdelt",
			PublishedAt: publishedAt,
		})
	}
	return items, nil
}
