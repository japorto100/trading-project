// Package cftc provides CFTC Commitment of Traders (COT) bulk fetcher. Phase 14c.1.
// Ref: REFERENCE_SOURCE_STATUS.md, https://www.cftc.gov/MarketReports/CommitmentsofTraders/
package cftc

import (
	"encoding/csv"
	"io"
	"net/http"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

const (
	DefaultCOTURL = "https://www.cftc.gov/files/dea/cotarchives/2024/futures/financials/deacot20241231.csv"
)

func NewCOTFetcher(httpClient *http.Client) *base.BulkFetcher {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 30 * time.Second}
	}
	return base.NewBulkFetcher(base.BulkConfig{
		Name:       "CFTC_COT",
		URL:        DefaultCOTURL,
		Schedule:   "0 6 * * 1", // weekly Monday 6am
		Format:     base.BulkFormatCSV,
		ParseFunc:  parseCOTCSV,
		HTTPClient: httpClient,
	})
}

func parseCOTCSV(r io.Reader) ([]any, error) {
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
