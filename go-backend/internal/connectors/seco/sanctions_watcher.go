// Package seco provides SECO (Swiss State Secretariat for Economic Affairs) sanctions watcher.
// Phase 14d.2. Uses OpenSanctions or official SECO data.
// Ref: REFERENCE_SOURCE_STATUS.md, https://data.opensanctions.org/datasets/latest/ch_seco_sanctions/
package seco

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

// DefaultSECOURL points to OpenSanctions SECO dataset index; actual entities may require bulk download.
// Alternative: sesam.search.admin.ch (official SECO).
const DefaultSECOURL = "https://data.opensanctions.org/datasets/latest/ch_seco_sanctions/entities.json"

func NewSanctionsWatcher(storePath string, httpClient *http.Client) *base.DiffWatcher {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 90 * time.Second}
	}
	url := strings.TrimSpace(getEnv("SECO_SANCTIONS_URL", DefaultSECOURL))
	return base.NewDiffWatcher(base.DiffWatcherConfig{
		Name:       "SECO_SANCTIONS",
		URL:        url,
		Schedule:   "0 9 * * 1-5",
		Format:     "json",
		IDField:    "id",
		StorePath:  storePath,
		ParseFunc:  parseSECOSanctionsJSON,
		HTTPClient: httpClient,
	})
}

func parseSECOSanctionsJSON(r io.Reader) ([]map[string]any, error) {
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
		return "seco_" + name
	}
	return "seco_unknown"
}

func getEnv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
