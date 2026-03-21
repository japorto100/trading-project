// Package geomapsources provides GeoMap Official Source Connector Pack.
// Phase 14g.1. Aggregates OFAC, UN, SECO, EU DiffWatchers and maps sanctions deltas to GeoMap candidates.
// Ref: REFERENCE_SOURCE_STATUS.md, execution_mini_plan.md
package geomapsources

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"golang.org/x/sync/errgroup"
	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/eu"
	"tradeviewfusion/go-backend/internal/connectors/ofac"
	"tradeviewfusion/go-backend/internal/connectors/seco"
	"tradeviewfusion/go-backend/internal/connectors/un"
)

// Candidate is a GeoMap candidate record (map[string]any) for review/ingest.
type Candidate = map[string]any

// GeoMapSourcePack aggregates sanctions DiffWatchers and maps their deltas to GeoMap candidates.
type GeoMapSourcePack struct {
	watchers []*base.DiffWatcher
	sources  []string // OFAC, UN, SECO, EU - same order as watchers
}

// PackConfig holds paths for sanctions store files.
type PackConfig struct {
	DataDir string // e.g. "data" - store paths will be data/sanctions/{source}.json
}

// NewGeoMapSourcePack creates a pack with OFAC, UN, SECO, EU watchers.
func NewGeoMapSourcePack(cfg PackConfig) *GeoMapSourcePack {
	dataDir := strings.TrimSpace(cfg.DataDir)
	if dataDir == "" {
		dataDir = "data"
	}
	sanctionsDir := filepath.Join(dataDir, "sanctions")
	_ = os.MkdirAll(sanctionsDir, 0o750)

	ofacPath := filepath.Join(sanctionsDir, "ofac_sdn.json")
	unPath := filepath.Join(sanctionsDir, "un_consolidated.json")
	secoPath := filepath.Join(sanctionsDir, "seco_sanctions.json")
	euPath := filepath.Join(sanctionsDir, "eu_sanctions.json")

	return &GeoMapSourcePack{
		watchers: []*base.DiffWatcher{
			ofac.NewSDNWatcher(ofacPath, nil),
			un.NewSanctionsWatcher(unPath, nil),
			seco.NewSanctionsWatcher(secoPath, nil),
			eu.NewSanctionsWatcher(euPath, nil),
		},
		sources: []string{"OFAC", "UN", "SECO", "EU"},
	}
}

// FetchAndMapToCandidates runs CheckForUpdates on all watchers in parallel and maps Added entries to GeoMap candidates.
// Uses errgroup.WithContext: the first watcher error cancels all remaining fetches.
func (p *GeoMapSourcePack) FetchAndMapToCandidates(ctx context.Context) ([]Candidate, error) {
	if p == nil {
		return nil, fmt.Errorf("geomap source pack unavailable")
	}
	results := make([]*base.DiffResult, len(p.watchers))
	g, gctx := errgroup.WithContext(ctx)
	for i, watcher := range p.watchers {
		g.Go(func() error {
			result, err := watcher.CheckForUpdates(gctx)
			if err != nil {
				return fmt.Errorf("check sanctions watcher %d for updates: %w", i, err)
			}
			results[i] = result
			return nil
		})
	}
	if err := g.Wait(); err != nil {
		return nil, fmt.Errorf("fetch geomap source pack updates: %w", err)
	}
	var all []Candidate
	for i, result := range results {
		source := "OFAC"
		if i < len(p.sources) {
			source = p.sources[i]
		}
		for _, item := range result.Added {
			c := mapSanctionsToCandidate(item, source)
			if c != nil {
				all = append(all, c)
			}
		}
	}
	return all, nil
}

func mapSanctionsToCandidate(item map[string]any, source string) Candidate {
	headline := extractName(item)
	if headline == "" {
		headline = fmt.Sprintf("Sanctions listing: %s", source)
	}
	id := extractID(item, source)
	if id == "" {
		id = "gcg_sanctions_" + source + "_" + fmt.Sprintf("%d", time.Now().UTC().UnixNano())
	}
	country := extractCountry(item)
	generatedAt := time.Now().UTC().Format(time.RFC3339)

	c := Candidate{
		"id":           id,
		"headline":     trim(headline, 300),
		"state":        "open",
		"triggerType":  "hard_signal",
		"generatedAt":  generatedAt,
		"confidence":   0.9,
		"severityHint": 3,
		"category":     "sanctions_export_controls",
		"sourceRefs": []map[string]any{
			{
				"provider":    strings.ToLower(source),
				"id":          id,
				"sourceTier":  "A",
				"reliability": 0.9,
				"fetchedAt":   generatedAt,
				"title":       headline,
				"url":         sourceURL(source),
			},
		},
	}
	if country != "" {
		c["regionHint"] = country
		c["countryHints"] = []string{country}
	}
	// Coordinates: optional 0,0 or later Geocoding per plan
	c["coordinates"] = []float64{0, 0}
	return c
}

func extractName(item map[string]any) string {
	for _, k := range []string{"name", "lastName", "firstName", "title"} {
		if v, ok := item[k]; ok {
			if s, ok := v.(string); ok && strings.TrimSpace(s) != "" {
				return strings.TrimSpace(s)
			}
		}
	}
	// OFAC: lastName only
	if v, ok := item["lastName"]; ok {
		return strings.TrimSpace(fmt.Sprint(v))
	}
	return ""
}

func extractID(item map[string]any, source string) string {
	for _, k := range []string{"uid", "reference_number", "id", "Id", "ID"} {
		if v, ok := item[k]; ok {
			if s, ok := v.(string); ok && strings.TrimSpace(s) != "" {
				return source + "_" + strings.TrimSpace(s)
			}
		}
	}
	return ""
}

func extractCountry(item map[string]any) string {
	for _, k := range []string{"country", "nationality", "countryOfBirth", "countryHints"} {
		if v, ok := item[k]; ok {
			if s, ok := v.(string); ok && strings.TrimSpace(s) != "" {
				return strings.TrimSpace(s)
			}
		}
	}
	return ""
}

func trim(s string, max int) string {
	s = strings.TrimSpace(s)
	if len(s) > max {
		return s[:max]
	}
	return s
}

func sourceURL(source string) string {
	switch source {
	case "OFAC":
		return "https://www.treasury.gov/ofac/downloads"
	case "UN":
		return "https://scsanctions.un.org/resources/xml/en/consolidated.xml"
	case "SECO":
		return "https://data.opensanctions.org/datasets/latest/ch_seco_sanctions/"
	case "EU":
		return "https://data.opensanctions.org/datasets/latest/eu_fsf/"
	default:
		return ""
	}
}
