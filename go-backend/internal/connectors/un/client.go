// Package un provides UN SDMX connector. Phase 14a.2.
// Ref: REFERENCE_SOURCE_STATUS.md, UN Stats API (unstats.un.org)
// Scaffold: SDMX structure ready, full integration pending API spec confirmation.
package un

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

const DefaultBaseURL = "https://data.un.org/ws/rest/sdmx"

const (
	seriesPrefix = "UN_"
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	httpClient  *base.Client
	unSDMX      *base.SDMXClient
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
	httpClient := base.NewClient(base.Config{
		BaseURL:    baseURL,
		Timeout:    timeout,
		RetryCount: 1,
	})
	return &Client{
		httpClient: httpClient,
		unSDMX: base.NewSDMXClient(base.SDMXConfig{
			HTTPClient:             httpClient,
			DataflowID:             "UN",
			Provider:               base.SDMXProviderUN,
			DimensionOrder:         []string{"REF_AREA", "INDICATOR", "FREQ"},
			Format:                 "jsondata",
			DimensionAtObservation: "TIME_PERIOD",
			DataPathPrefix:         "data",
		}),
		defaultPath: "data/UN",
	}
}

func (c *Client) GetTicker(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	return gct.Ticker{}, &gct.RequestError{
		Path:       c.defaultPath,
		StatusCode: http.StatusNotImplemented,
		Cause:      fmt.Errorf("%s connector scaffold: implement GetSeries for dataflow", seriesPrefix),
	}
}

func (c *Client) GetSeries(ctx context.Context, _ currency.Pair, _ asset.Item, _ int) ([]gct.SeriesPoint, error) {
	_ = c.unSDMX
	return nil, fmt.Errorf("UN connector scaffold: implement GetSeries")
}
