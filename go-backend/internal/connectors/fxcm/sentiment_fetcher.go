// Package fxcm provides FXCM Sentiment bulk fetcher. Phase 14c.3.
// Ref: REFERENCE_SOURCE_STATUS.md, https://fxcmapi.github.io/
// URL configurable via FXCM_SENTIMENT_URL; API may require auth.
package fxcm

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

const (
	DefaultSentimentURL = "https://api.fxcm.com/api/v1/sentiment"
)

func NewSentimentFetcher(httpClient *http.Client) *base.BulkFetcher {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 30 * time.Second}
	}
	return base.NewBulkFetcher(base.BulkConfig{
		Name:       "FXCM_SENTIMENT",
		URL:        DefaultSentimentURL,
		Schedule:   "0 6,18 * * 1-5",
		Format:     base.BulkFormatJSON,
		ParseFunc:  parseSentimentJSON,
		HTTPClient: httpClient,
	})
}

func parseSentimentJSON(r io.Reader) ([]any, error) {
	var raw any
	if err := json.NewDecoder(r).Decode(&raw); err != nil {
		return nil, err
	}
	switch v := raw.(type) {
	case []any:
		return v, nil
	case map[string]any:
		if arr, ok := v["data"].([]any); ok {
			return arr, nil
		}
		if arr, ok := v["items"].([]any); ok {
			return arr, nil
		}
		return []any{v}, nil
	default:
		return []any{raw}, nil
	}
}
