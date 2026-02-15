package news

import (
	"context"
	"net/http"
	"strings"
	"time"

	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

type RSSClientConfig struct {
	FeedURLs       []string
	RequestTimeout time.Duration
}

type RSSClient struct {
	feedURLs   []string
	httpClient *http.Client
}

func NewRSSClient(cfg RSSClientConfig) *RSSClient {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}

	feeds := make([]string, 0, len(cfg.FeedURLs))
	for _, feed := range cfg.FeedURLs {
		trimmed := strings.TrimSpace(feed)
		if trimmed != "" {
			feeds = append(feeds, trimmed)
		}
	}

	return &RSSClient{
		feedURLs: feeds,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *RSSClient) Fetch(ctx context.Context, _ string, limit int) ([]marketServices.Headline, error) {
	if len(c.feedURLs) == 0 {
		return nil, nil
	}

	items := make([]marketServices.Headline, 0, limit)
	perFeedLimit := limit
	if perFeedLimit <= 0 {
		perFeedLimit = 20
	}
	if len(c.feedURLs) > 1 {
		perFeedLimit = max(5, limit/len(c.feedURLs))
	}

	for _, feedURL := range c.feedURLs {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, feedURL, nil)
		if err != nil {
			continue
		}
		resp, err := c.httpClient.Do(req)
		if err != nil {
			continue
		}
		parsedItems, parseErr := parseRSS(resp.Body, "rss", perFeedLimit)
		_ = resp.Body.Close()
		if parseErr != nil {
			continue
		}
		items = append(items, parsedItems...)
	}
	return items, nil
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
