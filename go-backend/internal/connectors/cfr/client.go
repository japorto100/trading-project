package cfr

import (
	"context"
	"strings"
	"time"
)

const DefaultTrackerURL = "https://www.cfr.org/global-conflict-tracker"

type Item struct {
	ID          string
	Title       string
	URL         string
	Summary     string
	PublishedAt string
	Region      string
}

type Client struct {
	items []Item
}

func NewClient() *Client {
	now := time.Now().UTC().Format(time.RFC3339)
	return &Client{
		items: []Item{
			{
				ID:          "cfr-ukraine-russia",
				Title:       "Ukraine-Russia conflict",
				URL:         "https://www.cfr.org/global-conflict-tracker/conflict/conflict-ukraine",
				Summary:     "CFR tracker context for war developments and escalation risk.",
				PublishedAt: now,
				Region:      "Europe",
			},
			{
				ID:          "cfr-israeli-palestinian",
				Title:       "Israeli-Palestinian conflict",
				URL:         "https://www.cfr.org/global-conflict-tracker/conflict/israeli-palestinian-conflict",
				Summary:     "CFR tracker context for regional escalation and ceasefire dynamics.",
				PublishedAt: now,
				Region:      "Middle East",
			},
			{
				ID:          "cfr-taiwan",
				Title:       "Confrontation over Taiwan",
				URL:         "https://www.cfr.org/global-conflict-tracker/conflict/confrontation-over-taiwan",
				Summary:     "CFR tracker context for cross-strait military pressure and deterrence risk.",
				PublishedAt: now,
				Region:      "East Asia",
			},
			{
				ID:          "cfr-south-china-sea",
				Title:       "Territorial disputes in the South China Sea",
				URL:         "https://www.cfr.org/global-conflict-tracker/conflict/territorial-disputes-south-china-sea",
				Summary:     "CFR tracker context for maritime disputes and security pressure.",
				PublishedAt: now,
				Region:      "East Asia",
			},
			{
				ID:          "cfr-sahel",
				Title:       "Sahel insurgencies",
				URL:         "https://www.cfr.org/global-conflict-tracker/conflict/violent-extremism-sahel",
				Summary:     "CFR tracker context for insecurity, displacement, and spillover risks.",
				PublishedAt: now,
				Region:      "Africa",
			},
			{
				ID:          "cfr-north-korea",
				Title:       "North Korea crisis",
				URL:         "https://www.cfr.org/global-conflict-tracker/conflict/north-korea-crisis",
				Summary:     "CFR tracker context for Korean Peninsula escalation and deterrence stability.",
				PublishedAt: now,
				Region:      "Northeast Asia",
			},
		},
	}
}

func (c *Client) List(_ context.Context, limit int, region string, q string) ([]Item, error) {
	if c == nil {
		return []Item{}, nil
	}

	normalizedRegion := strings.ToLower(strings.TrimSpace(region))
	normalizedQuery := strings.ToLower(strings.TrimSpace(q))

	result := make([]Item, 0, len(c.items))
	for _, item := range c.items {
		if normalizedRegion != "" && !strings.Contains(strings.ToLower(item.Region), normalizedRegion) {
			continue
		}
		if normalizedQuery != "" {
			searchSpace := strings.ToLower(item.Title + " " + item.Summary + " " + item.Region)
			if !strings.Contains(searchSpace, normalizedQuery) {
				continue
			}
		}
		result = append(result, item)
		if limit > 0 && len(result) >= limit {
			break
		}
	}
	return result, nil
}
