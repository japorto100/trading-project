package market

import (
	"context"
	"testing"
	"time"
)

type fakeHeadlineFetcher struct {
	items []Headline
	err   error
}

func (f *fakeHeadlineFetcher) Fetch(_ context.Context, _ string, _ int) ([]Headline, error) {
	return f.items, f.err
}

func TestNewsService_Headlines_DeduplicatesAndSorts(t *testing.T) {
	older := time.Date(2026, 2, 14, 10, 0, 0, 0, time.UTC)
	newer := time.Date(2026, 2, 14, 11, 0, 0, 0, time.UTC)

	rss := &fakeHeadlineFetcher{
		items: []Headline{
			{Title: "A", URL: "https://x/a", Source: "rss", PublishedAt: older},
		},
	}
	gdelt := &fakeHeadlineFetcher{
		items: []Headline{
			{Title: "B", URL: "https://x/b", Source: "gdelt", PublishedAt: newer},
			{Title: "A DUP", URL: "https://x/a", Source: "gdelt", PublishedAt: newer},
		},
	}
	finviz := &fakeHeadlineFetcher{}

	service := NewNewsService(rss, gdelt, finviz)
	items, err := service.Headlines(context.Background(), "AAPL", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 unique items, got %d", len(items))
	}
	if items[0].URL != "https://x/b" {
		t.Fatalf("expected newest item first, got %s", items[0].URL)
	}
}

func TestNewsService_Headlines_RespectsLimit(t *testing.T) {
	base := time.Date(2026, 2, 14, 10, 0, 0, 0, time.UTC)
	rss := &fakeHeadlineFetcher{
		items: []Headline{
			{Title: "1", URL: "https://x/1", PublishedAt: base.Add(1 * time.Minute)},
			{Title: "2", URL: "https://x/2", PublishedAt: base.Add(2 * time.Minute)},
			{Title: "3", URL: "https://x/3", PublishedAt: base.Add(3 * time.Minute)},
		},
	}

	service := NewNewsService(rss, &fakeHeadlineFetcher{}, &fakeHeadlineFetcher{})
	items, err := service.Headlines(context.Background(), "", 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(items))
	}
}

func TestNewsService_Headlines_NormalizesAndFiltersInvalidItems(t *testing.T) {
	now := time.Date(2026, 2, 15, 12, 0, 0, 0, time.UTC)
	rss := &fakeHeadlineFetcher{
		items: []Headline{
			{Title: "  Valid  ", URL: "  https://x/valid  ", Source: "RSS", PublishedAt: now},
			{Title: "Missing URL", URL: "   ", Source: "rss", PublishedAt: now},
			{Title: "   ", URL: "https://x/invalid", Source: "rss", PublishedAt: now},
		},
	}

	service := NewNewsService(rss, &fakeHeadlineFetcher{}, &fakeHeadlineFetcher{})
	items, err := service.Headlines(context.Background(), "", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 valid item, got %d", len(items))
	}
	if items[0].Title != "Valid" {
		t.Fatalf("expected normalized title, got %q", items[0].Title)
	}
	if items[0].URL != "https://x/valid" {
		t.Fatalf("expected normalized url, got %q", items[0].URL)
	}
	if items[0].Source != "rss" {
		t.Fatalf("expected normalized source rss, got %q", items[0].Source)
	}
}

func TestNewsService_Headlines_AppliesSourceQuota(t *testing.T) {
	base := time.Date(2026, 2, 15, 12, 0, 0, 0, time.UTC)
	rss := &fakeHeadlineFetcher{
		items: []Headline{
			{Title: "r1", URL: "https://rss/1", Source: "rss", PublishedAt: base.Add(6 * time.Minute)},
			{Title: "r2", URL: "https://rss/2", Source: "rss", PublishedAt: base.Add(5 * time.Minute)},
			{Title: "r3", URL: "https://rss/3", Source: "rss", PublishedAt: base.Add(4 * time.Minute)},
			{Title: "r4", URL: "https://rss/4", Source: "rss", PublishedAt: base.Add(3 * time.Minute)},
		},
	}
	gdelt := &fakeHeadlineFetcher{
		items: []Headline{
			{Title: "g1", URL: "https://gdelt/1", Source: "gdelt", PublishedAt: base.Add(2 * time.Minute)},
		},
	}

	service := NewNewsService(rss, gdelt, &fakeHeadlineFetcher{})
	items, err := service.Headlines(context.Background(), "", 4)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 4 {
		t.Fatalf("expected 4 items, got %d", len(items))
	}

	rssCount := 0
	gdeltCount := 0
	for _, item := range items {
		if item.Source == "rss" {
			rssCount++
		}
		if item.Source == "gdelt" {
			gdeltCount++
		}
	}
	if rssCount > 3 {
		t.Fatalf("expected source quota to limit rss dominance, got %d rss items", rssCount)
	}
	if gdeltCount == 0 {
		t.Fatal("expected at least one gdelt item in limited set")
	}
}
