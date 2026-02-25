package news

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

const DefaultGDELTBaseURL = "https://api.gdeltproject.org/api/v2/doc/doc"

type GDELTClientConfig struct {
	BaseURL        string
	RequestTimeout time.Duration
	RequestRetries int
}

type GDELTClient struct {
	baseURL        string
	requestRetries int
	baseClient     *base.Client
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
	retries := cfg.RequestRetries
	if retries < 0 {
		retries = 0
	}
	return &GDELTClient{
		baseURL:        baseURL,
		requestRetries: retries,
		baseClient: base.NewClient(base.Config{
			Timeout:    timeout,
			RetryCount: 0,
		}),
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

	var payload struct {
		Articles []struct {
			Title string `json:"title"`
			URL   string `json:"url"`
			Seen  string `json:"seendate"`
		} `json:"articles"`
	}

	attempts := c.requestRetries + 1
	for attempt := 1; attempt <= attempts; attempt++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, parsedURL.String(), nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("Accept", "application/json")
		req.Header.Set("User-Agent", "tradeview-fusion-go-backend/1.0")

		resp, err := c.baseClient.Do(req)
		if err != nil {
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, err
		}

		if resp.StatusCode >= http.StatusInternalServerError {
			_ = resp.Body.Close()
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, nil
		}
		if resp.StatusCode >= http.StatusBadRequest {
			_ = resp.Body.Close()
			return nil, nil
		}

		if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
			_ = resp.Body.Close()
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, err
		}
		_ = resp.Body.Close()
		break
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
