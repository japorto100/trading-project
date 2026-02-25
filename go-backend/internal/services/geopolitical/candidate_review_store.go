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

type CandidateReviewStore struct {
	mu       sync.Mutex
	filePath string
}

type CandidateListFilters struct {
	State         string
	RegionHint    string
	MinConfidence *float64
	Query         string
}

type CandidateStateUpdate struct {
	State             string
	ReviewNote        *string
	MergedIntoEventID *string
}

type candidateReviewStoreFile struct {
	Candidates []map[string]any `json:"candidates"`
}

func NewCandidateReviewStore(filePath string) *CandidateReviewStore {
	trimmed := strings.TrimSpace(filePath)
	if trimmed == "" {
		trimmed = filepath.Join("data", "geopolitical", "gateway-candidates.json")
	}
	return &CandidateReviewStore{filePath: trimmed}
}

func (s *CandidateReviewStore) List(filters CandidateListFilters) ([]map[string]any, error) {
	if s == nil {
		return nil, fmt.Errorf("candidate review store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}

	items := make([]map[string]any, 0, len(store.Candidates))
	stateFilter := strings.TrimSpace(filters.State)
	regionFilter := strings.TrimSpace(filters.RegionHint)
	query := strings.ToLower(strings.TrimSpace(filters.Query))
	for _, candidate := range store.Candidates {
		if stateFilter != "" && strings.TrimSpace(stringField(candidate, "state")) != stateFilter {
			continue
		}
		if regionFilter != "" && strings.TrimSpace(stringField(candidate, "regionHint")) != regionFilter {
			continue
		}
		if filters.MinConfidence != nil {
			if confidence, ok := numberField(candidate, "confidence"); !ok || confidence < *filters.MinConfidence {
				continue
			}
		}
		if query != "" && !strings.Contains(strings.ToLower(stringField(candidate, "headline")), query) {
			continue
		}
		items = append(items, cloneCandidateMap(candidate))
	}

	sort.SliceStable(items, func(i, j int) bool {
		return timeField(items[i], "generatedAt").After(timeField(items[j], "generatedAt"))
	})
	return items, nil
}

func (s *CandidateReviewStore) UpsertCandidate(candidate map[string]any) error {
	if s == nil {
		return fmt.Errorf("candidate review store unavailable")
	}
	if strings.TrimSpace(stringField(candidate, "id")) == "" {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return err
	}
	changed := upsertCandidateInSlice(&store.Candidates, candidate)
	if !changed {
		return nil
	}
	return s.writeLocked(store)
}

func (s *CandidateReviewStore) UpsertCandidates(candidates []map[string]any) error {
	if s == nil {
		return fmt.Errorf("candidate review store unavailable")
	}
	if len(candidates) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return err
	}
	changed := false
	for _, candidate := range candidates {
		if upsertCandidateInSlice(&store.Candidates, candidate) {
			changed = true
		}
	}
	if !changed {
		return nil
	}
	return s.writeLocked(store)
}

func (s *CandidateReviewStore) Get(id string) (map[string]any, error) {
	if s == nil {
		return nil, fmt.Errorf("candidate review store unavailable")
	}
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	for _, candidate := range store.Candidates {
		if strings.TrimSpace(stringField(candidate, "id")) == id {
			return cloneCandidateMap(candidate), nil
		}
	}
	return nil, nil
}

func (s *CandidateReviewStore) UpdateState(id string, patch CandidateStateUpdate) (before map[string]any, after map[string]any, err error) {
	if s == nil {
		return nil, nil, fmt.Errorf("candidate review store unavailable")
	}
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, nil, nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, nil, err
	}
	for index, candidate := range store.Candidates {
		if strings.TrimSpace(stringField(candidate, "id")) != id {
			continue
		}
		prev := cloneCandidateMap(candidate)
		next := cloneCandidateMap(candidate)
		if state := strings.TrimSpace(patch.State); state != "" {
			next["state"] = state
		}
		if patch.ReviewNote != nil {
			if trimmed := strings.TrimSpace(*patch.ReviewNote); trimmed != "" {
				next["reviewNote"] = trimmed
			} else {
				next["reviewNote"] = ""
			}
		}
		if patch.MergedIntoEventID != nil {
			if trimmed := strings.TrimSpace(*patch.MergedIntoEventID); trimmed != "" {
				next["mergedIntoEventId"] = trimmed
			} else {
				delete(next, "mergedIntoEventId")
			}
		}
		store.Candidates[index] = next
		if err := s.writeLocked(store); err != nil {
			return nil, nil, err
		}
		return prev, cloneCandidateMap(next), nil
	}
	return nil, nil, nil
}

func (s *CandidateReviewStore) readLocked() (candidateReviewStoreFile, error) {
	raw, err := os.ReadFile(s.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return candidateReviewStoreFile{Candidates: []map[string]any{}}, nil
		}
		return candidateReviewStoreFile{}, fmt.Errorf("read candidate review store: %w", err)
	}
	var parsed candidateReviewStoreFile
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return candidateReviewStoreFile{}, fmt.Errorf("decode candidate review store: %w", err)
	}
	if parsed.Candidates == nil {
		parsed.Candidates = []map[string]any{}
	}
	return parsed, nil
}

func (s *CandidateReviewStore) writeLocked(store candidateReviewStoreFile) error {
	dir := filepath.Dir(s.filePath)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("mkdir candidate review store dir: %w", err)
	}
	encoded, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return fmt.Errorf("encode candidate review store: %w", err)
	}
	tmpPath := s.filePath + ".tmp"
	if err := os.WriteFile(tmpPath, encoded, 0o644); err != nil {
		return fmt.Errorf("write candidate review temp file: %w", err)
	}
	if err := os.Rename(tmpPath, s.filePath); err != nil {
		return fmt.Errorf("replace candidate review store: %w", err)
	}
	return nil
}

func upsertCandidateInSlice(items *[]map[string]any, candidate map[string]any) bool {
	id := strings.TrimSpace(stringField(candidate, "id"))
	if id == "" {
		return false
	}
	next := cloneCandidateMap(candidate)
	for index, existing := range *items {
		if strings.TrimSpace(stringField(existing, "id")) == id {
			(*items)[index] = next
			return true
		}
	}
	*items = append(*items, next)
	return true
}

func cloneCandidateMap(value map[string]any) map[string]any {
	if value == nil {
		return map[string]any{}
	}
	encoded, err := json.Marshal(value)
	if err != nil {
		return map[string]any{}
	}
	var cloned map[string]any
	if err := json.Unmarshal(encoded, &cloned); err != nil {
		return map[string]any{}
	}
	if cloned == nil {
		return map[string]any{}
	}
	return cloned
}

func stringField(m map[string]any, key string) string {
	if m == nil {
		return ""
	}
	if value, ok := m[key].(string); ok {
		return value
	}
	return ""
}

func numberField(m map[string]any, key string) (float64, bool) {
	if m == nil {
		return 0, false
	}
	switch value := m[key].(type) {
	case float64:
		return value, true
	case float32:
		return float64(value), true
	case int:
		return float64(value), true
	case int64:
		return float64(value), true
	case json.Number:
		parsed, err := value.Float64()
		return parsed, err == nil
	default:
		return 0, false
	}
}

func timeField(m map[string]any, key string) time.Time {
	raw := strings.TrimSpace(stringField(m, key))
	if raw == "" {
		return time.Time{}
	}
	parsed, err := time.Parse(time.RFC3339, raw)
	if err != nil {
		return time.Time{}
	}
	return parsed
}
