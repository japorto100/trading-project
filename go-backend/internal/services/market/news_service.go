package market

import (
	"context"
	"net/url"
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
		merged = append(merged, normalizeHeadlines(items)...)
	}

	unique := deduplicateHeadlines(merged)
	sort.SliceStable(unique, func(i, j int) bool {
		return unique[i].PublishedAt.After(unique[j].PublishedAt)
	})
	return applySourceQuota(unique, limit), nil
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

func normalizeHeadlines(items []Headline) []Headline {
	result := make([]Headline, 0, len(items))
	now := time.Now().UTC()

	for _, item := range items {
		title := strings.TrimSpace(item.Title)
		rawURL := strings.TrimSpace(item.URL)
		if title == "" || rawURL == "" {
			continue
		}
		parsedURL, err := url.Parse(rawURL)
		if err != nil || parsedURL.Scheme == "" || parsedURL.Host == "" {
			continue
		}

		source := strings.ToLower(strings.TrimSpace(item.Source))
		if source == "" {
			source = "unknown"
		}

		publishedAt := item.PublishedAt.UTC()
		if publishedAt.IsZero() {
			publishedAt = now
		}

		result = append(result, Headline{
			Title:       title,
			URL:         rawURL,
			Source:      source,
			PublishedAt: publishedAt,
			Summary:     strings.TrimSpace(item.Summary),
		})
	}

	return result
}

func applySourceQuota(items []Headline, limit int) []Headline {
	if limit <= 0 {
		return []Headline{}
	}
	if len(items) <= limit {
		return items
	}

	sourceSet := make(map[string]struct{})
	for _, item := range items {
		sourceSet[item.Source] = struct{}{}
	}

	sourceCount := len(sourceSet)
	if sourceCount <= 1 {
		return items[:limit]
	}

	maxPerSource := limit/sourceCount + 1
	if maxPerSource < 1 {
		maxPerSource = 1
	}

	result := make([]Headline, 0, limit)
	skipped := make([]Headline, 0, len(items))
	usedPerSource := make(map[string]int, sourceCount)

	for _, item := range items {
		if len(result) >= limit {
			break
		}
		if usedPerSource[item.Source] >= maxPerSource {
			skipped = append(skipped, item)
			continue
		}
		result = append(result, item)
		usedPerSource[item.Source]++
	}

	if len(result) >= limit {
		return result
	}

	for _, item := range skipped {
		if len(result) >= limit {
			break
		}
		result = append(result, item)
	}

	return result
}
