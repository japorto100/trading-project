// Package adb provides Asian Development Bank SDMX connector. Phase 14a.2.
// Ref: REFERENCE_SOURCE_STATUS.md, ADB Data API (data.adb.org)
// Scaffold: SDMX structure ready, full integration pending API spec confirmation.
package adb

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

const DefaultBaseURL = "https://data.adb.org/api/v1/sdmx"

const (
	seriesPrefix = "ADB_"
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	httpClient  *base.Client
	adbSDMX     *base.SDMXClient
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
		adbSDMX: base.NewSDMXClient(base.SDMXConfig{
			HTTPClient:             httpClient,
			DataflowID:             "ADB",
			Provider:               base.SDMXProviderADB,
			DimensionOrder:         []string{"REF_AREA", "INDICATOR", "FREQ"},
			Format:                 "jsondata",
			DimensionAtObservation: "TIME_PERIOD",
			DataPathPrefix:         "data",
		}),
		defaultPath: "data/ADB",
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
	_ = c.adbSDMX
	return nil, fmt.Errorf("ADB connector scaffold: implement GetSeries")
}
