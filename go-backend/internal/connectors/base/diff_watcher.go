package base

import (
	"context"
	"fmt"
	"strings"
)

type DiffWatcherConfig struct {
	Name      string
	URL       string
	Schedule  string
	Format    string
	IDField   string
	StorePath string
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
	_ = ctx
	return nil, fmt.Errorf("diff watcher scaffold: persistence/diff engine not implemented")
}
