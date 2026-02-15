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
