package base

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type DiffWatcherConfig struct {
	Name      string
	URL       string
	Schedule  string
	Format    string
	IDField   string
	StorePath string
	ParseFunc func(io.Reader) ([]map[string]any, error)
	HTTPClient *http.Client
}

type DiffResult struct {
	Added   []map[string]any `json:"added,omitempty"`
	Removed []map[string]any `json:"removed,omitempty"`
	Changed []map[string]any `json:"changed,omitempty"`
}

type DiffWatcher struct {
	cfg DiffWatcherConfig
}

func NewDiffWatcher(cfg DiffWatcherConfig) *DiffWatcher {
	return &DiffWatcher{cfg: cfg}
}

func (w *DiffWatcher) CheckForUpdates(ctx context.Context) (*DiffResult, error) {
	if w == nil {
		return nil, fmt.Errorf("diff watcher unavailable")
	}
	if strings.TrimSpace(w.cfg.URL) == "" {
		return nil, fmt.Errorf("diff watcher url required")
	}
	if w.cfg.ParseFunc == nil {
		return nil, fmt.Errorf("diff watcher parse func required")
	}
	client := w.cfg.HTTPClient
	if client == nil {
		client = http.DefaultClient
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, w.cfg.URL, nil)
	if err != nil {
		return nil, fmt.Errorf("diff watcher request: %w", err)
	}
	req.Header.Set("Accept", "application/json, application/xml, */*")
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("diff watcher fetch: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("diff watcher %s: %d", w.cfg.URL, resp.StatusCode)
	}
	fresh, err := w.cfg.ParseFunc(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("diff watcher parse: %w", err)
	}
	freshMap := sliceToMap(fresh, w.cfg.IDField)
	var prevMap map[string]map[string]any
	if strings.TrimSpace(w.cfg.StorePath) != "" {
		if data, err := os.ReadFile(w.cfg.StorePath); err == nil {
			var prev []map[string]any
			if json.Unmarshal(data, &prev) == nil {
				prevMap = sliceToMap(prev, w.cfg.IDField)
			}
		}
	}
	if prevMap == nil {
		prevMap = make(map[string]map[string]any)
	}
	added, removed, changed := computeDiff(prevMap, freshMap)
	if strings.TrimSpace(w.cfg.StorePath) != "" {
		dir := filepath.Dir(w.cfg.StorePath)
		if dir != "" {
			_ = os.MkdirAll(dir, 0755)
		}
		if data, err := json.MarshalIndent(fresh, "", "  "); err == nil {
			_ = os.WriteFile(w.cfg.StorePath, data, 0644)
		}
	}
	return &DiffResult{Added: added, Removed: removed, Changed: changed}, nil
}

func sliceToMap(items []map[string]any, idField string) map[string]map[string]any {
	result := make(map[string]map[string]any, len(items))
	for _, item := range items {
		id := ""
		if idField != "" {
			if v, ok := item[idField]; ok {
				id = fmt.Sprint(v)
			}
		}
		if id == "" {
			id = fmt.Sprintf("%v", item)
		}
		result[id] = item
	}
	return result
}

func computeDiff(prev, fresh map[string]map[string]any) (added, removed, changed []map[string]any) {
	for id, item := range fresh {
		if _, exists := prev[id]; !exists {
			added = append(added, item)
		} else if !mapsEqual(prev[id], item) {
			changed = append(changed, item)
		}
	}
	for id, item := range prev {
		if _, exists := fresh[id]; !exists {
			removed = append(removed, item)
		}
	}
	return added, removed, changed
}

func mapsEqual(a, b map[string]any) bool {
	ja, _ := json.Marshal(a)
	jb, _ := json.Marshal(b)
	return string(ja) == string(jb)
}
