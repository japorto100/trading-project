package market

import (
	"context"
	"testing"
	"time"

	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type fakeHeadlineFetcher struct {
	items     []Headline
	err       error
	lastTerm  string
	lastLimit int
}

func (f *fakeHeadlineFetcher) Fetch(_ context.Context, term string, limit int) ([]Headline, error) {
	f.lastTerm = term
	f.lastLimit = limit
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
	items, err := service.Headlines(context.Background(), "AAPL", "", "", 10)
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
	items, err := service.Headlines(context.Background(), "", "", "", 2)
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
	items, err := service.Headlines(context.Background(), "", "", "", 10)
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
	items, err := service.Headlines(context.Background(), "", "", "", 4)
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

func TestNewsService_Headlines_UsesQueryForRSSAndGDELTButSymbolForFinviz(t *testing.T) {
	rss := &fakeHeadlineFetcher{}
	gdelt := &fakeHeadlineFetcher{}
	finviz := &fakeHeadlineFetcher{}

	service := NewNewsService(rss, gdelt, finviz)
	_, err := service.Headlines(context.Background(), "AAPL", "geopolitics sanctions", "", 6)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if rss.lastTerm != "geopolitics sanctions" {
		t.Fatalf("expected rss term to use query, got %q", rss.lastTerm)
	}
	if gdelt.lastTerm != "geopolitics sanctions" {
		t.Fatalf("expected gdelt term to use query, got %q", gdelt.lastTerm)
	}
	if finviz.lastTerm != "AAPL" {
		t.Fatalf("expected finviz term to use symbol, got %q", finviz.lastTerm)
	}
}

func TestNewsService_Headlines_LanguageFilterDisablesNonLanguageAwareFetchers(t *testing.T) {
	rss := &fakeHeadlineFetcher{}
	gdelt := &fakeHeadlineFetcher{}
	finviz := &fakeHeadlineFetcher{}

	service := NewNewsService(rss, gdelt, finviz)
	_, err := service.Headlines(context.Background(), "AAPL", "election", "de", 5)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if rss.lastLimit != 0 || finviz.lastLimit != 0 {
		t.Fatalf("expected rss/finviz to be skipped for non-en lang, got rss=%d finviz=%d", rss.lastLimit, finviz.lastLimit)
	}
	if gdelt.lastTerm == "" {
		t.Fatal("expected gdelt to be called with a language-constrained term")
	}
}

func TestNewsService_Headlines_UsesRegistryCandidates(t *testing.T) {
	rss := &fakeHeadlineFetcher{
		items: []Headline{{Title: "rss", URL: "https://rss/1", Source: "rss", PublishedAt: time.Date(2026, 2, 16, 10, 0, 0, 0, time.UTC)}},
	}
	gdelt := &fakeHeadlineFetcher{
		items: []Headline{{Title: "gdelt", URL: "https://gdelt/1", Source: "gdelt", PublishedAt: time.Date(2026, 2, 16, 9, 0, 0, 0, time.UTC)}},
	}
	finviz := &fakeHeadlineFetcher{
		items: []Headline{{Title: "finviz", URL: "https://finviz/1", Source: "finviz", PublishedAt: time.Date(2026, 2, 16, 8, 0, 0, 0, time.UTC)}},
	}

	service := NewNewsService(rss, gdelt, finviz)
	router := adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"news_headlines": {Providers: []string{"gdelt", "rss", "finviz"}, Strategy: "freshness_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"rest": {MaxConcurrency: 1},
			"rss":  {MaxConcurrency: 1},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"gdelt":  {Group: "rest"},
			"rss":    {Group: "rss"},
			"finviz": {Group: "rest"},
		},
	})
	service.SetAdaptiveRouter(router)

	items, err := service.Headlines(context.Background(), "AAPL", "risk", "", 5)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 3 {
		t.Fatalf("expected 3 items, got %d", len(items))
	}
	if gdelt.lastLimit != 5 || rss.lastLimit != 5 || finviz.lastLimit != 5 {
		t.Fatalf("expected all registry-selected fetchers to receive limit 5, got gdelt=%d rss=%d finviz=%d", gdelt.lastLimit, rss.lastLimit, finviz.lastLimit)
	}
	snapshot := router.Snapshot()
	successes := map[string]int{}
	for _, state := range snapshot {
		successes[state.Name] = state.Successes
	}
	if successes["gdelt"] != 1 || successes["rss"] != 1 || successes["finviz"] != 1 {
		t.Fatalf("expected router successes for all news providers, got %+v", successes)
	}
}
