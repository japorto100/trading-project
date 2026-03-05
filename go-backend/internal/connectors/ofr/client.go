// Package ofr provides OFR (Office of Financial Research) connector. Phase 14b.2.
// Ref: REFERENCE_SOURCE_STATUS.md, https://data.financialresearch.gov/v1
// Financial Stress Index, Short-term Funding Monitor, Credit Spreads.
package ofr

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

const DefaultBaseURL = "https://data.financialresearch.gov/v1"

const (
	seriesPrefix = "OFR_"
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
		defaultPath: "/v1",
	}
}

func (c *Client) GetTicker(ctx context.Context, _ currency.Pair, _ asset.Item) (gct.Ticker, error) {
	_ = ctx
	return gct.Ticker{}, &gct.RequestError{
		Path:       c.defaultPath,
		StatusCode: http.StatusNotImplemented,
		Cause:      fmt.Errorf("%s connector scaffold: implement GetSeries for FSI/credit dataflow", seriesPrefix),
	}
}

func (c *Client) GetSeries(ctx context.Context, _ currency.Pair, _ asset.Item, _ int) ([]gct.SeriesPoint, error) {
	_ = ctx
	return nil, fmt.Errorf("OFR connector scaffold: implement GetSeries")
}
