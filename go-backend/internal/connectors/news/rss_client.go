package news

import (
	"context"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

type RSSClientConfig struct {
	FeedURLs       []string
	RequestTimeout time.Duration
	RequestRetries int
}

type RSSClient struct {
	feedURLs         []string
	requestRetries   int
	baseClient       *base.Client
	requestUserAgent string
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

	retries := cfg.RequestRetries
	if retries < 0 {
		retries = 0
	}

	return &RSSClient{
		feedURLs:       feeds,
		requestRetries: retries,
		baseClient: base.NewClient(base.Config{
			Timeout:    timeout,
			RetryCount: 0,
		}),
		requestUserAgent: "tradeview-fusion-go-backend/1.0",
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
		attempts := c.requestRetries + 1
		for attempt := 1; attempt <= attempts; attempt++ {
			req, err := c.baseClient.NewRequest(ctx, http.MethodGet, feedURL, nil, nil)
			if err != nil {
				break
			}
			req.Header.Set("Accept", "application/xml")
			req.Header.Set("User-Agent", c.requestUserAgent)

			resp, err := c.baseClient.Do(req)
			if err != nil {
				if attempt < attempts {
					if !sleepWithContext(ctx, backoffDuration(attempt)) {
						break
					}
					continue
				}
				break
			}

			if resp.StatusCode >= http.StatusInternalServerError {
				_ = resp.Body.Close()
				if attempt < attempts {
					if !sleepWithContext(ctx, backoffDuration(attempt)) {
						break
					}
					continue
				}
				break
			}
			if resp.StatusCode >= http.StatusBadRequest {
				_ = resp.Body.Close()
				break
			}

			parsedItems, parseErr := parseRSS(resp.Body, "rss", perFeedLimit)
			_ = resp.Body.Close()
			if parseErr != nil {
				break
			}
			items = append(items, parsedItems...)
			break
		}
	}
	return items, nil
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
