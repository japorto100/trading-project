// Package nyfed provides NY Fed (Federal Reserve Bank of New York) connector. Phase 14b.2.
// Ref: REFERENCE_SOURCE_STATUS.md, https://markets.newyorkfed.org
// Treasury rates, SOFR, EFFR, Repo reference rates.
package nyfed

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

const DefaultBaseURL = "https://markets.newyorkfed.org/api"

const (
	seriesPrefix = "NYFED_"
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	httpClient  *base.Client
	defaultPath string
}

func NewClient(cfg Config) *Client {
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 6 * time.Second
	}
	return &Client{
		httpClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 1,
		}),
		defaultPath: "/api",
	}
}

func (c *Client) GetTicker(ctx context.Context, _ currency.Pair, _ asset.Item) (gct.Ticker, error) {
	_ = ctx
	return gct.Ticker{}, &gct.RequestError{
		Path:       c.defaultPath,
		StatusCode: http.StatusNotImplemented,
		Cause:      fmt.Errorf("%s connector scaffold: implement GetSeries for SOFR/EFFR/treasury dataflow", seriesPrefix),
	}
}

func (c *Client) GetSeries(ctx context.Context, _ currency.Pair, _ asset.Item, _ int) ([]gct.SeriesPoint, error) {
	_ = ctx
	return nil, fmt.Errorf("NYFed connector scaffold: implement GetSeries")
}
