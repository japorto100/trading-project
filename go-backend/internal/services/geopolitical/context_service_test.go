package geopolitical

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/cfr"
	"tradeviewfusion/go-backend/internal/connectors/crisiswatch"
)

type fakeCFRProvider struct {
	items []cfr.Item
	err   error
}

func (f *fakeCFRProvider) List(_ context.Context, _ int, _ string, _ string) ([]cfr.Item, error) {
	if f.err != nil {
		return nil, f.err
	}
	return f.items, nil
}

type fakeCrisisWatchProvider struct {
	items []crisiswatch.Item
	err   error
}

func (f *fakeCrisisWatchProvider) List(_ context.Context, _ int, _ string, _ string) ([]crisiswatch.Item, error) {
	if f.err != nil {
		return nil, f.err
	}
	return f.items, nil
}

func TestContextService_ListContext_AggregatesAndDedupes(t *testing.T) {
	t.Parallel()

	service := NewContextService(
		&fakeCFRProvider{
			items: []cfr.Item{
				{
					ID:          "cfr-1",
					Title:       "CFR item",
					URL:         "https://example.org/shared",
					Summary:     "A",
					PublishedAt: "2026-02-15T00:00:00Z",
					Region:      "Europe",
				},
			},
		},
		&fakeCrisisWatchProvider{
			items: []crisiswatch.Item{
				{
					ID:          "cw-1",
					Title:       "CW item",
					URL:         "https://example.org/shared",
					Summary:     "B",
					PublishedAt: "2026-02-14T00:00:00Z",
					Region:      "Europe",
				},
			},
		},
	)

	items, err := service.ListContext(context.Background(), ContextQuery{
		Source: "all",
		Limit:  10,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected deduped length 1, got %d", len(items))
	}
	if items[0].Source != "cfr" {
		t.Fatalf("expected cfr first, got %q", items[0].Source)
	}
}

func TestContextService_ListContext_SourceFilter(t *testing.T) {
	t.Parallel()

	service := NewContextService(
		&fakeCFRProvider{
			items: []cfr.Item{
				{ID: "cfr-1", Title: "CFR", URL: "https://example.org/cfr"},
			},
		},
		&fakeCrisisWatchProvider{
			items: []crisiswatch.Item{
				{ID: "cw-1", Title: "CW", URL: "https://example.org/cw"},
			},
		},
	)

	items, err := service.ListContext(context.Background(), ContextQuery{
		Source: "crisiswatch",
		Limit:  10,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(items))
	}
	if items[0].Source != "crisiswatch" {
		t.Fatalf("expected crisiswatch source, got %q", items[0].Source)
	}
}
