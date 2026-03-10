package base

import (
	"archive/zip"
	"bytes"
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBulkFetcherFetch_ZipCSV(t *testing.T) {
	var archive bytes.Buffer
	zipWriter := zip.NewWriter(&archive)
	fileWriter, err := zipWriter.Create("sample.csv")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if _, err := io.WriteString(fileWriter, "name,value\nA,1\n"); err != nil {
		t.Fatalf("WriteString: %v", err)
	}
	if err := zipWriter.Close(); err != nil {
		t.Fatalf("Close: %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/zip")
		_, _ = w.Write(archive.Bytes())
	}))
	defer server.Close()

	fetcher := NewBulkFetcher(BulkConfig{
		Name:   "ZIP_TEST",
		URL:    server.URL + "/sample.zip",
		Format: BulkFormatCSVZIP,
		ParseFunc: func(r io.Reader) ([]any, error) {
			payload, err := io.ReadAll(r)
			if err != nil {
				return nil, err
			}
			return []any{string(payload)}, nil
		},
		HTTPClient: server.Client(),
	})

	items, err := fetcher.Fetch(context.Background())
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(items))
	}
	if items[0].(string) != "name,value\nA,1\n" {
		t.Fatalf("unexpected payload %q", items[0].(string))
	}
}
