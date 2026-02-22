package geopolitical

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/cfr"
	"tradeviewfusion/go-backend/internal/connectors/crisiswatch"
)

const (
	defaultContextLimit = 20
	maxContextLimit     = 100
)

type ContextQuery struct {
	Source string
	Region string
	Query  string
	Limit  int
}

type ContextItem struct {
	ID          string
	Source      string
	Title       string
	URL         string
	Summary     string
	PublishedAt string
	Region      string
}

type ContextService struct {
	cfrClient         cfrProvider
	crisiswatchClient crisiswatchProvider
}

type cfrProvider interface {
	List(ctx context.Context, limit int, region string, q string) ([]cfr.Item, error)
}

type crisiswatchProvider interface {
	List(ctx context.Context, limit int, region string, q string) ([]crisiswatch.Item, error)
}

func NewContextService(cfrClient cfrProvider, crisiswatchClient crisiswatchProvider) *ContextService {
	return &ContextService{
		cfrClient:         cfrClient,
		crisiswatchClient: crisiswatchClient,
	}
}

func (s *ContextService) ListContext(ctx context.Context, query ContextQuery) ([]ContextItem, error) {
	if s == nil {
		return nil, fmt.Errorf("context service unavailable")
	}

	source := strings.ToLower(strings.TrimSpace(query.Source))
	if source == "" {
		source = "all"
	}
	limit := normalizeContextLimit(query.Limit)
	region := strings.TrimSpace(query.Region)
	text := strings.TrimSpace(query.Query)

	result := make([]ContextItem, 0, limit)
	appendItems := func(items []ContextItem) {
		for _, item := range items {
			if len(result) >= limit {
				break
			}
			if strings.TrimSpace(item.ID) == "" || strings.TrimSpace(item.URL) == "" {
				continue
			}
			result = append(result, item)
		}
	}

	switch source {
	case "cfr":
		items, err := s.fetchCFR(ctx, limit, region, text)
		if err != nil {
			return nil, err
		}
		appendItems(items)
	case "crisiswatch":
		items, err := s.fetchCrisisWatch(ctx, limit, region, text)
		if err != nil {
			return nil, err
		}
		appendItems(items)
	case "all":
		cfrItems, cfrErr := s.fetchCFR(ctx, limit, region, text)
		cwItems, cwErr := s.fetchCrisisWatch(ctx, limit, region, text)
		if cfrErr != nil && cwErr != nil {
			return nil, fmt.Errorf("all context providers failed")
		}
		appendItems(cfrItems)
		appendItems(cwItems)
	default:
		return nil, fmt.Errorf("unsupported source")
	}

	unique := dedupeContextItems(result)
	sort.SliceStable(unique, func(i, j int) bool {
		return unique[i].PublishedAt > unique[j].PublishedAt
	})
	if len(unique) > limit {
		unique = unique[:limit]
	}
	return unique, nil
}

func (s *ContextService) fetchCFR(ctx context.Context, limit int, region string, q string) ([]ContextItem, error) {
	if s.cfrClient == nil {
		return nil, fmt.Errorf("cfr provider unavailable")
	}
	items, err := s.cfrClient.List(ctx, limit, region, q)
	if err != nil {
		return nil, err
	}
	result := make([]ContextItem, 0, len(items))
	for _, item := range items {
		result = append(result, ContextItem{
			ID:          item.ID,
			Source:      "cfr",
			Title:       item.Title,
			URL:         item.URL,
			Summary:     item.Summary,
			PublishedAt: item.PublishedAt,
			Region:      item.Region,
		})
	}
	return result, nil
}

func (s *ContextService) fetchCrisisWatch(ctx context.Context, limit int, region string, q string) ([]ContextItem, error) {
	if s.crisiswatchClient == nil {
		return nil, fmt.Errorf("crisiswatch provider unavailable")
	}
	items, err := s.crisiswatchClient.List(ctx, limit, region, q)
	if err != nil {
		return nil, err
	}
	result := make([]ContextItem, 0, len(items))
	for _, item := range items {
		result = append(result, ContextItem{
			ID:          item.ID,
			Source:      "crisiswatch",
			Title:       item.Title,
			URL:         item.URL,
			Summary:     item.Summary,
			PublishedAt: item.PublishedAt,
			Region:      item.Region,
		})
	}
	return result, nil
}

func normalizeContextLimit(limit int) int {
	if limit <= 0 {
		return defaultContextLimit
	}
	if limit > maxContextLimit {
		return maxContextLimit
	}
	return limit
}

func dedupeContextItems(items []ContextItem) []ContextItem {
	seen := make(map[string]struct{}, len(items))
	result := make([]ContextItem, 0, len(items))
	for _, item := range items {
		key := strings.TrimSpace(strings.ToLower(item.URL))
		if key == "" {
			key = strings.TrimSpace(strings.ToLower(item.ID))
		}
		if key == "" {
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		result = append(result, item)
	}
	return result
}
