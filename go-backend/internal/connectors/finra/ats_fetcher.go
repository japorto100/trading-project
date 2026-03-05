// Package finra provides FINRA ATS bulk fetcher. Phase 14c.2.
// Ref: REFERENCE_SOURCE_STATUS.md, https://www.finra.org/finra-data
package finra

import (
	"encoding/csv"
	"io"
	"net/http"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

const (
	DefaultATSURL = "https://api.finra.org/data/ats/volume"
)

func NewATSFetcher(httpClient *http.Client) *base.BulkFetcher {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 30 * time.Second}
	}
	return base.NewBulkFetcher(base.BulkConfig{
		Name:       "FINRA_ATS",
		URL:        DefaultATSURL,
		Schedule:   "0 18 * * 1-5",
		Format:     base.BulkFormatCSV,
		ParseFunc:  parseATSCSV,
		HTTPClient: httpClient,
	})
}

func parseATSCSV(r io.Reader) ([]any, error) {
	reader := csv.NewReader(r)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	result := make([]any, 0, len(records))
	for _, row := range records {
		rowCopy := make([]string, len(row))
		copy(rowCopy, row)
		result = append(result, rowCopy)
	}
	return result, nil
}
