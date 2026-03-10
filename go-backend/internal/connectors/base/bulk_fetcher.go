package base

import (
	"archive/zip"
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type BulkFormat string

const (
	BulkFormatCSV    BulkFormat = "csv"
	BulkFormatTSV    BulkFormat = "tsv"
	BulkFormatXML    BulkFormat = "xml"
	BulkFormatJSON   BulkFormat = "json"
	BulkFormatCSVGZ  BulkFormat = "csv.gz"
	BulkFormatCSVZIP BulkFormat = "csv.zip"
)

type BulkConfig struct {
	Name         string
	URL          string
	Schedule     string
	Format       BulkFormat
	ParseFunc    func(io.Reader) ([]any, error)
	IdempotentBy string
	HTTPClient   *http.Client
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
	if f.cfg.ParseFunc == nil {
		return nil, fmt.Errorf("bulk fetcher parse func required")
	}
	client := f.cfg.HTTPClient
	if client == nil {
		client = http.DefaultClient
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, f.cfg.URL, nil)
	if err != nil {
		return nil, fmt.Errorf("bulk fetch request: %w", err)
	}
	req.Header.Set("Accept", "*/*")
	req.Header.Set("User-Agent", "tradeview-fusion/1.0")
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("bulk fetch: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("bulk fetch %s: %d", f.cfg.URL, resp.StatusCode)
	}
	var r io.Reader = resp.Body
	if f.cfg.Format == BulkFormatCSVGZ || strings.HasSuffix(strings.ToLower(f.cfg.URL), ".gz") {
		gz, err := gzip.NewReader(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("bulk fetch gzip: %w", err)
		}
		defer func() { _ = gz.Close() }()
		r = gz
	} else if f.cfg.Format == BulkFormatCSVZIP || strings.HasSuffix(strings.ToLower(f.cfg.URL), ".zip") {
		payload, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("bulk fetch zip read: %w", err)
		}
		zr, err := zip.NewReader(bytes.NewReader(payload), int64(len(payload)))
		if err != nil {
			return nil, fmt.Errorf("bulk fetch zip: %w", err)
		}
		var firstFile *zip.File
		for _, file := range zr.File {
			if file.FileInfo().IsDir() {
				continue
			}
			firstFile = file
			break
		}
		if firstFile == nil {
			return nil, fmt.Errorf("bulk fetch zip: no file entries")
		}
		fileReader, err := firstFile.Open()
		if err != nil {
			return nil, fmt.Errorf("bulk fetch zip open: %w", err)
		}
		defer func() { _ = fileReader.Close() }()
		r = fileReader
	}
	return f.cfg.ParseFunc(r)
}
