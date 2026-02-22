package crisiswatch

import (
	"context"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"sync/atomic"
	"testing"
	"time"
)

func TestClientList_ParsesRSSItems(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/rss+xml")
		_, _ = w.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?>
			<rss version="2.0">
				<channel>
					<item>
						<guid>cw-1</guid>
						<title>Ukraine monthly update</title>
						<link>https://example.org/cw-1</link>
						<description>Conflict trends in Europe.</description>
						<pubDate>Mon, 15 Feb 2026 12:00:00 +0000</pubDate>
					</item>
					<item>
						<guid>cw-2</guid>
						<title>Sahel security update</title>
						<link>https://example.org/cw-2</link>
						<description>Armed activity remains elevated.</description>
						<pubDate>Mon, 10 Feb 2026 12:00:00 +0000</pubDate>
					</item>
				</channel>
			</rss>`))
	}))
	defer server.Close()

	client := NewClient(Config{RSSURL: server.URL})
	items, err := client.List(context.Background(), 10, "", "")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(items))
	}
	if items[0].ID != "cw-1" {
		t.Fatalf("expected id cw-1, got %q", items[0].ID)
	}
	if items[0].Region != "Europe" {
		t.Fatalf("expected inferred region Europe, got %q", items[0].Region)
	}
	if items[0].PublishedAt == "" {
		t.Fatal("expected publishedAt")
	}
}

func TestClientList_AppliesQueryAndRegionFilters(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/rss+xml")
		_, _ = w.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?>
			<rss version="2.0">
				<channel>
					<item>
						<title>Ukraine monthly update</title>
						<link>https://example.org/ua</link>
						<description>Europe conflict digest.</description>
					</item>
					<item>
						<title>Sahel security update</title>
						<link>https://example.org/sahel</link>
						<description>Africa conflict digest.</description>
					</item>
				</channel>
			</rss>`))
	}))
	defer server.Close()

	client := NewClient(Config{RSSURL: server.URL})
	items, err := client.List(context.Background(), 10, "africa", "security")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(items))
	}
	if items[0].URL != "https://example.org/sahel" {
		t.Fatalf("unexpected item url %q", items[0].URL)
	}
}

func TestClientList_MapsUpstreamStatus(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer server.Close()

	client := NewClient(Config{RSSURL: server.URL})
	_, err := client.List(context.Background(), 10, "", "")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestClientList_UsesTTLCache(t *testing.T) {
	t.Parallel()

	var calls int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		atomic.AddInt32(&calls, 1)
		w.Header().Set("Content-Type", "application/rss+xml")
		_, _ = w.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?>
			<rss version="2.0">
				<channel>
					<item>
						<title>Cached item</title>
						<link>https://example.org/cache</link>
						<description>Europe digest.</description>
					</item>
				</channel>
			</rss>`))
	}))
	defer server.Close()

	client := NewClient(Config{
		RSSURL:   server.URL,
		CacheTTL: time.Hour,
	})

	if _, err := client.List(context.Background(), 10, "", ""); err != nil {
		t.Fatalf("first call failed: %v", err)
	}
	if _, err := client.List(context.Background(), 10, "", ""); err != nil {
		t.Fatalf("second call failed: %v", err)
	}

	if got := atomic.LoadInt32(&calls); got != 1 {
		t.Fatalf("expected 1 upstream call, got %d", got)
	}
}

func TestClientList_LoadsPersistedCache(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	cachePath := filepath.Join(dir, "crisiswatch-cache.json")

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/rss+xml")
		_, _ = w.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?>
			<rss version="2.0">
				<channel>
					<item>
						<guid>persisted-1</guid>
						<title>Persisted item</title>
						<link>https://example.org/persisted</link>
						<description>Europe digest.</description>
					</item>
				</channel>
			</rss>`))
	}))
	client := NewClient(Config{
		RSSURL:      server.URL,
		CacheTTL:    time.Hour,
		PersistPath: cachePath,
	})
	if _, err := client.List(context.Background(), 10, "", ""); err != nil {
		server.Close()
		t.Fatalf("seed call failed: %v", err)
	}
	server.Close()

	clientFromDisk := NewClient(Config{
		RSSURL:      "http://127.0.0.1:0",
		CacheTTL:    time.Hour,
		PersistPath: cachePath,
	})
	items, err := clientFromDisk.List(context.Background(), 10, "", "")
	if err != nil {
		t.Fatalf("expected persisted fallback, got %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 persisted item, got %d", len(items))
	}
	if items[0].ID != "persisted-1" {
		t.Fatalf("unexpected persisted id %q", items[0].ID)
	}
}
