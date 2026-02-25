package geopolitical

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type IngestRunsStore struct {
	mu       sync.Mutex
	filePath string
}

type GeoIngestRun struct {
	ID                 string           `json:"id"`
	Kind               string           `json:"kind"`
	Mode               string           `json:"mode"`
	UpstreamPath       string           `json:"upstreamPath"`
	Actor              string           `json:"actor"`
	RequestID          string           `json:"requestId,omitempty"`
	StatusCode         int              `json:"statusCode"`
	Success            bool             `json:"success"`
	StartedAt          string           `json:"startedAt"`
	FinishedAt         string           `json:"finishedAt"`
	CandidateSyncCount int              `json:"candidateSyncCount,omitempty"`
	NextOpenCount      *int             `json:"nextOpenCount,omitempty"`
	GoOpenCount        *int             `json:"goOpenCount,omitempty"`
	OpenCountDelta     *int             `json:"openCountDelta,omitempty"`
	AdapterStats       []map[string]any `json:"adapterStats,omitempty"`
	Notes              []string         `json:"notes,omitempty"`
}

type IngestRunsListFilters struct {
	Kind  string
	Limit int
}

type ingestRunsStoreFile struct {
	Runs []GeoIngestRun `json:"runs"`
}

func NewIngestRunsStore(filePath string) *IngestRunsStore {
	trimmed := strings.TrimSpace(filePath)
	if trimmed == "" {
		trimmed = filepath.Join("data", "geopolitical", "gateway-ingest-runs.json")
	}
	return &IngestRunsStore{filePath: trimmed}
}

func (s *IngestRunsStore) Append(run GeoIngestRun) (*GeoIngestRun, error) {
	if s == nil {
		return nil, fmt.Errorf("ingest runs store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(run.ID) == "" {
		run.ID = randomPrefixedID("gir")
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if strings.TrimSpace(run.StartedAt) == "" {
		run.StartedAt = now
	}
	if strings.TrimSpace(run.FinishedAt) == "" {
		run.FinishedAt = now
	}
	store.Runs = append([]GeoIngestRun{run}, store.Runs...)
	if len(store.Runs) > 300 {
		store.Runs = store.Runs[:300]
	}
	if err := s.writeLocked(store); err != nil {
		return nil, err
	}
	copy := run
	return &copy, nil
}

func (s *IngestRunsStore) List(filters IngestRunsListFilters) ([]GeoIngestRun, error) {
	if s == nil {
		return nil, fmt.Errorf("ingest runs store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	kind := strings.TrimSpace(filters.Kind)
	limit := filters.Limit
	if limit <= 0 {
		limit = 50
	}
	if limit > 300 {
		limit = 300
	}
	items := make([]GeoIngestRun, 0, len(store.Runs))
	for _, run := range store.Runs {
		if kind != "" && run.Kind != kind {
			continue
		}
		items = append(items, run)
	}
	sort.SliceStable(items, func(i, j int) bool {
		return parseRFC3339(items[i].FinishedAt).After(parseRFC3339(items[j].FinishedAt))
	})
	if len(items) > limit {
		items = items[:limit]
	}
	return items, nil
}

func (s *IngestRunsStore) readLocked() (ingestRunsStoreFile, error) {
	raw, err := os.ReadFile(s.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return ingestRunsStoreFile{Runs: []GeoIngestRun{}}, nil
		}
		return ingestRunsStoreFile{}, fmt.Errorf("read ingest runs store: %w", err)
	}
	var parsed ingestRunsStoreFile
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return ingestRunsStoreFile{}, fmt.Errorf("decode ingest runs store: %w", err)
	}
	if parsed.Runs == nil {
		parsed.Runs = []GeoIngestRun{}
	}
	return parsed, nil
}

func (s *IngestRunsStore) writeLocked(store ingestRunsStoreFile) error {
	return writeJSONFileAtomic(s.filePath, store)
}
