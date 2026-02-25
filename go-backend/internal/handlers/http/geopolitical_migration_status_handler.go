package http

import (
	"net/http"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalMigrationCandidateListStore interface {
	List(filters geopoliticalServices.CandidateListFilters) ([]map[string]any, error)
}

type geopoliticalMigrationContradictionsListStore interface {
	List(filters geopoliticalServices.ContradictionListFilters) ([]geopoliticalServices.GeoContradiction, error)
}

type geopoliticalMigrationTimelineListStore interface {
	List(eventID string, limit int) ([]geopoliticalServices.GeoTimelineEntry, error)
}

type geopoliticalMigrationIngestRunsListStore interface {
	List(filters geopoliticalServices.IngestRunsListFilters) ([]geopoliticalServices.GeoIngestRun, error)
}

type GeopoliticalMigrationStatusConfig struct {
	CandidatesListMode        string
	CandidateRejectSnoozeMode string
	CandidateAcceptMode       string
	ContradictionsMode        string
	TimelineMode              string
	IngestHardMode            string
	IngestSoftMode            string
	AdminSeedMode             string
	IngestShadowCompare       bool
	CandidatesStore           geopoliticalMigrationCandidateListStore
	ContradictionsStore       geopoliticalMigrationContradictionsListStore
	TimelineStore             geopoliticalMigrationTimelineListStore
	IngestRunsStore           geopoliticalMigrationIngestRunsListStore
}

func GeopoliticalMigrationStatusHandler(cfg GeopoliticalMigrationStatusConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"success": true,
			"status": map[string]any{
				"candidatesList": map[string]any{"mode": cfg.CandidatesListMode},
				"candidateReview": map[string]any{
					"rejectSnoozeMode": cfg.CandidateRejectSnoozeMode,
					"acceptMode":       cfg.CandidateAcceptMode,
				},
				"contradictions":      map[string]any{"mode": cfg.ContradictionsMode},
				"timeline":            map[string]any{"mode": cfg.TimelineMode},
				"ingestHard":          map[string]any{"mode": cfg.IngestHardMode},
				"ingestSoft":          map[string]any{"mode": cfg.IngestSoftMode},
				"adminSeed":           map[string]any{"mode": cfg.AdminSeedMode},
				"ingestShadowCompare": cfg.IngestShadowCompare,
				"diagnostics":         geopoliticalMigrationDiagnostics(cfg),
			},
		})
	}
}

func geopoliticalMigrationDiagnostics(cfg GeopoliticalMigrationStatusConfig) map[string]any {
	diagnostics := map[string]any{}
	errors := []string{}

	if cfg.CandidatesStore != nil {
		openItems, err := cfg.CandidatesStore.List(geopoliticalServices.CandidateListFilters{State: "open"})
		if err != nil {
			errors = append(errors, "candidates_open_count_failed")
		} else {
			diagnostics["openCandidates"] = len(openItems)
		}
	}
	if cfg.ContradictionsStore != nil {
		allItems, err := cfg.ContradictionsStore.List(geopoliticalServices.ContradictionListFilters{})
		if err != nil {
			errors = append(errors, "contradictions_count_failed")
		} else {
			openCount := 0
			for _, item := range allItems {
				if item.State == "open" {
					openCount++
				}
			}
			diagnostics["contradictions"] = map[string]any{
				"total": len(allItems),
				"open":  openCount,
			}
		}
	}
	if cfg.TimelineStore != nil {
		items, err := cfg.TimelineStore.List("", 50)
		if err != nil {
			errors = append(errors, "timeline_count_failed")
		} else {
			diagnostics["timelineRecentCount"] = len(items)
		}
	}
	if cfg.IngestRunsStore != nil {
		runs, err := cfg.IngestRunsStore.List(geopoliticalServices.IngestRunsListFilters{Limit: 25})
		if err != nil {
			errors = append(errors, "ingest_runs_failed")
		} else {
			diagnostics["recentRuns"] = summarizeRecentIngestRunsByKind(runs)
		}
	}
	if len(errors) > 0 {
		diagnostics["errors"] = errors
	}
	return diagnostics
}

func summarizeRecentIngestRunsByKind(runs []geopoliticalServices.GeoIngestRun) map[string]any {
	latest := map[string]geopoliticalServices.GeoIngestRun{}
	for _, run := range runs {
		if run.Kind == "" {
			continue
		}
		if _, exists := latest[run.Kind]; exists {
			continue
		}
		latest[run.Kind] = run
	}
	out := map[string]any{}
	for kind, run := range latest {
		entry := map[string]any{
			"id":                 run.ID,
			"mode":               run.Mode,
			"success":            run.Success,
			"statusCode":         run.StatusCode,
			"finishedAt":         run.FinishedAt,
			"candidateSyncCount": run.CandidateSyncCount,
		}
		if run.OpenCountDelta != nil {
			entry["openCountDelta"] = *run.OpenCountDelta
		}
		out[kind] = entry
	}
	return out
}
