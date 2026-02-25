package base

import (
	"context"
	"fmt"
	"io"
	"strings"
)

type BulkFormat string

const (
	BulkFormatCSV   BulkFormat = "csv"
	BulkFormatTSV   BulkFormat = "tsv"
	BulkFormatXML   BulkFormat = "xml"
	BulkFormatJSON  BulkFormat = "json"
	BulkFormatCSVGZ BulkFormat = "csv.gz"
)

type BulkConfig struct {
	Name         string
	URL          string
	Schedule     string
	Format       BulkFormat
	ParseFunc    func(io.Reader) ([]any, error)
	IdempotentBy string
}

type BulkFetcher struct {
	cfg BulkConfig
}

func NewBulkFetcher(cfg BulkConfig) *BulkFetcher {
	return &BulkFetcher{cfg: cfg}
}

func (f *BulkFetcher) Fetch(ctx context.Context) ([]any, error) {
	if f == nil {
		return nil, fmt.Errorf("bulk fetcher unavailable")
	}
	if strings.TrimSpace(f.cfg.URL) == "" {
		return nil, fmt.Errorf("bulk fetch url required")
	}
	_ = ctx
	return nil, fmt.Errorf("bulk fetcher scaffold: downloader/parser not implemented")
}
