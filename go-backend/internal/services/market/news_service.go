package market

import (
	"context"
	"sort"
	"strings"
	"time"
)

type Headline struct {
	Title       string    `json:"title"`
	URL         string    `json:"url"`
	Source      string    `json:"source"`
	PublishedAt time.Time `json:"publishedAt"`
	Summary     string    `json:"summary,omitempty"`
}

type newsFetcher interface {
	Fetch(ctx context.Context, symbol string, limit int) ([]Headline, error)
}

type NewsService struct {
	rssFetcher    newsFetcher
	gdeltFetcher  newsFetcher
	finvizFetcher newsFetcher
}

func NewNewsService(rssFetcher, gdeltFetcher, finvizFetcher newsFetcher) *NewsService {
	return &NewsService{
		rssFetcher:    rssFetcher,
		gdeltFetcher:  gdeltFetcher,
		finvizFetcher: finvizFetcher,
	}
}

func (s *NewsService) Headlines(ctx context.Context, symbol string, limit int) ([]Headline, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	fetchers := []newsFetcher{s.rssFetcher, s.gdeltFetcher, s.finvizFetcher}
	merged := make([]Headline, 0, limit*2)

	for _, fetcher := range fetchers {
		if fetcher == nil {
			continue
		}
		items, err := fetcher.Fetch(ctx, symbol, limit)
		if err != nil {
			continue
		}
		merged = append(merged, items...)
	}

	unique := deduplicateHeadlines(merged)
	sort.SliceStable(unique, func(i, j int) bool {
		return unique[i].PublishedAt.After(unique[j].PublishedAt)
	})
	if len(unique) > limit {
		unique = unique[:limit]
	}
	return unique, nil
}

func deduplicateHeadlines(items []Headline) []Headline {
	seen := make(map[string]struct{}, len(items))
	result := make([]Headline, 0, len(items))

	for _, item := range items {
		key := strings.TrimSpace(strings.ToLower(item.URL))
		if key == "" {
			key = strings.TrimSpace(strings.ToLower(item.Title))
		}
		if key == "" {
			continue
		}
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		result = append(result, item)
	}
	return result
}
