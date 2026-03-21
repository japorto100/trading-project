// Package lbma provides LBMA Gold Fix bulk fetcher. Phase 14c.3.
// Ref: REFERENCE_SOURCE_STATUS.md, https://prices.lbma.org.uk/
// URL configurable via LBMA_GOLD_URL; LBMA XLS export may require licensing.
package lbma

import (
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

const (
	DefaultGoldURL = "https://prices.lbma.org.uk/export/xls/"
)

func NewGoldFetcher(httpClient *http.Client) *base.BulkFetcher {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 30 * time.Second}
	}
	return base.NewBulkFetcher(base.BulkConfig{
		Name:       "LBMA_GOLD_FIX",
		URL:        DefaultGoldURL,
		Schedule:   "0 6 * * 1-5",
		Format:     base.BulkFormatCSV,
		ParseFunc:  parseGoldCSV,
		HTTPClient: httpClient,
	})
}

func parseGoldCSV(r io.Reader) ([]any, error) {
	reader := csv.NewReader(r)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("read lbma gold csv: %w", err)
	}
	result := make([]any, 0, len(records))
	for _, row := range records {
		rowCopy := make([]string, len(row))
		copy(rowCopy, row)
		result = append(result, rowCopy)
	}
	return result, nil
}
