// Package eu provides EU Financial Sanctions Files (FSF) watcher.
// Phase 14d.2. Current runtime default remains OpenSanctions EU FSF JSON.
// P2 target is migration to the official European Commission FSF XML/CSV files once a stable
// machine-readable fetch contract is fixed for runtime use.
// Ref: REFERENCE_SOURCE_STATUS.md, https://data.opensanctions.org/datasets/latest/eu_fsf/
package eu

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

// DefaultEUURL points to the normalized OpenSanctions EU FSF dataset.
// The official FSF system provides XML/CSV/PDF files and RSS, but the durable crawler/robot URLs
// appear to be account/token-oriented in the current documentation, so runtime migration is deferred.
const DefaultEUURL = "https://data.opensanctions.org/datasets/latest/eu_fsf/entities.json"

func NewSanctionsWatcher(storePath string, httpClient *http.Client) *base.DiffWatcher {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 90 * time.Second}
	}
	url := strings.TrimSpace(getEnv("EU_SANCTIONS_URL", DefaultEUURL))
	return base.NewDiffWatcher(base.DiffWatcherConfig{
		Name:       "EU_SANCTIONS",
		URL:        url,
		Schedule:   "0 9 * * 1-5",
		Format:     "json",
		IDField:    "id",
		StorePath:  storePath,
		ParseFunc:  parseEUSanctionsJSON,
		HTTPClient: httpClient,
	})
}

func parseEUSanctionsJSON(r io.Reader) ([]map[string]any, error) {
	var raw any
	if err := json.NewDecoder(r).Decode(&raw); err != nil {
		return nil, err
	}
	switch v := raw.(type) {
	case []any:
		return jsonSliceToMaps(v)
	case map[string]any:
		if arr, ok := v["results"].([]any); ok {
			return jsonSliceToMaps(arr)
		}
		if arr, ok := v["entities"].([]any); ok {
			return jsonSliceToMaps(arr)
		}
		if arr, ok := v["data"].([]any); ok {
			return jsonSliceToMaps(arr)
		}
		return []map[string]any{}, nil
	default:
		return []map[string]any{}, nil
	}
}

func jsonSliceToMaps(arr []any) ([]map[string]any, error) {
	result := make([]map[string]any, 0, len(arr))
	for _, item := range arr {
		if m, ok := item.(map[string]any); ok {
			if id := extractID(m); id != "" {
				result = append(result, m)
			} else {
				m["id"] = jsonMapFallbackID(m)
				result = append(result, m)
			}
		}
	}
	return result, nil
}

func extractID(m map[string]any) string {
	for _, k := range []string{"id", "Id", "ID"} {
		if v, ok := m[k]; ok {
			if s, ok := v.(string); ok && strings.TrimSpace(s) != "" {
				return s
			}
		}
	}
	return ""
}

func jsonMapFallbackID(m map[string]any) string {
	if name, ok := m["name"].(string); ok && name != "" {
		return "eu_" + name
	}
	return "eu_unknown"
}

func getEnv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
