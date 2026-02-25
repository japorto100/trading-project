package geopolitical

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type ContradictionsStore struct {
	mu       sync.Mutex
	filePath string
}

type TimelineStore struct {
	mu       sync.Mutex
	filePath string
}

type ContradictionListFilters struct {
	State    string
	RegionID string
}

type GeoContradiction struct {
	ID           string                      `json:"id"`
	Title        string                      `json:"title"`
	State        string                      `json:"state"`
	SeverityHint int                         `json:"severityHint"`
	RegionID     string                      `json:"regionId,omitempty"`
	CountryCode  string                      `json:"countryCode,omitempty"`
	Summary      string                      `json:"summary,omitempty"`
	StatementA   string                      `json:"statementA"`
	StatementB   string                      `json:"statementB"`
	SourceRefs   []map[string]any            `json:"sourceRefs"`
	CandidateIDs []string                    `json:"candidateIds,omitempty"`
	Evidence     []GeoContradictionEvidence  `json:"evidence"`
	Resolution   *GeoContradictionResolution `json:"resolution,omitempty"`
	CreatedAt    string                      `json:"createdAt"`
	UpdatedAt    string                      `json:"updatedAt"`
	CreatedBy    string                      `json:"createdBy"`
	UpdatedBy    string                      `json:"updatedBy"`
}

type GeoContradictionEvidence struct {
	ID          string `json:"id"`
	Kind        string `json:"kind"`
	Label       string `json:"label"`
	Note        string `json:"note,omitempty"`
	URL         string `json:"url,omitempty"`
	CandidateID string `json:"candidateId,omitempty"`
	EventID     string `json:"eventId,omitempty"`
	CreatedAt   string `json:"createdAt"`
	CreatedBy   string `json:"createdBy"`
}

type GeoContradictionResolution struct {
	Outcome           string `json:"outcome"`
	Note              string `json:"note,omitempty"`
	MergedEventID     string `json:"mergedEventId,omitempty"`
	MergedCandidateID string `json:"mergedCandidateId,omitempty"`
	ResolvedAt        string `json:"resolvedAt"`
	ResolvedBy        string `json:"resolvedBy"`
}

type GeoTimelineEntry struct {
	ID          string `json:"id"`
	EventID     string `json:"eventId"`
	Action      string `json:"action"`
	Actor       string `json:"actor"`
	At          string `json:"at"`
	DiffSummary string `json:"diffSummary"`
}

type CreateContradictionInput struct {
	Title        string
	SeverityHint int
	RegionID     string
	CountryCode  string
	Summary      string
	StatementA   string
	StatementB   string
	SourceRefs   []map[string]any
	CandidateIDs []string
	CreatedBy    string
}

type PatchResolutionInput struct {
	Clear             bool
	Outcome           string
	Note              string
	MergedEventID     string
	MergedCandidateID string
}

type AddEvidenceInput struct {
	Kind        string
	Label       string
	Note        string
	URL         string
	CandidateID string
	EventID     string
}

type PatchContradictionInput struct {
	Summary           *string
	Resolution        *PatchResolutionInput
	AddEvidence       []AddEvidenceInput
	RemoveEvidenceIDs []string
}

type contradictionsStoreFile struct {
	Contradictions []GeoContradiction `json:"contradictions"`
}

type timelineStoreFile struct {
	Timeline []GeoTimelineEntry `json:"timeline"`
}

func NewContradictionsStore(filePath string) *ContradictionsStore {
	trimmed := strings.TrimSpace(filePath)
	if trimmed == "" {
		trimmed = filepath.Join("data", "geopolitical", "gateway-contradictions.json")
	}
	return &ContradictionsStore{filePath: trimmed}
}

func NewTimelineStore(filePath string) *TimelineStore {
	trimmed := strings.TrimSpace(filePath)
	if trimmed == "" {
		trimmed = filepath.Join("data", "geopolitical", "gateway-timeline.json")
	}
	return &TimelineStore{filePath: trimmed}
}

func (s *ContradictionsStore) List(filters ContradictionListFilters) ([]GeoContradiction, error) {
	if s == nil {
		return nil, fmt.Errorf("contradictions store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	stateFilter := strings.TrimSpace(filters.State)
	regionFilter := strings.TrimSpace(filters.RegionID)
	items := make([]GeoContradiction, 0, len(store.Contradictions))
	for _, c := range store.Contradictions {
		if stateFilter != "" && c.State != stateFilter {
			continue
		}
		if regionFilter != "" && c.RegionID != regionFilter {
			continue
		}
		items = append(items, c)
	}
	sort.SliceStable(items, func(i, j int) bool {
		return parseRFC3339(items[i].UpdatedAt).After(parseRFC3339(items[j].UpdatedAt))
	})
	return items, nil
}

func (s *ContradictionsStore) Get(id string) (*GeoContradiction, error) {
	if s == nil {
		return nil, fmt.Errorf("contradictions store unavailable")
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
	for _, c := range store.Contradictions {
		if c.ID == id {
			copy := c
			return &copy, nil
		}
	}
	return nil, nil
}

func (s *ContradictionsStore) Create(input CreateContradictionInput) (*GeoContradiction, error) {
	if s == nil {
		return nil, fmt.Errorf("contradictions store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if input.SeverityHint < 1 || input.SeverityHint > 5 {
		input.SeverityHint = 2
	}
	createdBy := trimmedOr(input.CreatedBy, "local-analyst")
	item := GeoContradiction{
		ID:           randomPrefixedID("gctrd"),
		Title:        trimMax(input.Title, 180),
		State:        "open",
		SeverityHint: input.SeverityHint,
		RegionID:     strings.TrimSpace(input.RegionID),
		CountryCode:  strings.ToUpper(strings.TrimSpace(input.CountryCode)),
		Summary:      trimMax(input.Summary, 2000),
		StatementA:   trimMax(input.StatementA, 800),
		StatementB:   trimMax(input.StatementB, 800),
		SourceRefs:   cloneAnyMaps(input.SourceRefs),
		CandidateIDs: cloneStrings(input.CandidateIDs),
		Evidence:     []GeoContradictionEvidence{},
		CreatedAt:    now,
		UpdatedAt:    now,
		CreatedBy:    createdBy,
		UpdatedBy:    createdBy,
	}
	store.Contradictions = append(store.Contradictions, item)
	if err := s.writeLocked(store); err != nil {
		return nil, err
	}
	copy := item
	return &copy, nil
}

func (s *ContradictionsStore) ReplaceAll(items []GeoContradiction) error {
	if s == nil {
		return fmt.Errorf("contradictions store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store := contradictionsStoreFile{
		Contradictions: append([]GeoContradiction(nil), items...),
	}
	if store.Contradictions == nil {
		store.Contradictions = []GeoContradiction{}
	}
	return s.writeLocked(store)
}

func (s *ContradictionsStore) Update(id, nextState, actor string, patch PatchContradictionInput) (*GeoContradiction, *GeoContradiction, error) {
	if s == nil {
		return nil, nil, fmt.Errorf("contradictions store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, nil, err
	}
	index := -1
	for i, c := range store.Contradictions {
		if c.ID == id {
			index = i
			break
		}
	}
	if index < 0 {
		return nil, nil, nil
	}
	before := store.Contradictions[index]
	updated := before
	now := time.Now().UTC().Format(time.RFC3339)
	updatedBy := trimmedOr(actor, "local-analyst")

	if nextState == "open" || nextState == "resolved" {
		updated.State = nextState
	}
	if patch.Summary != nil {
		updated.Summary = trimMax(*patch.Summary, 2000)
	}
	if patch.Resolution != nil {
		if patch.Resolution.Clear {
			updated.Resolution = nil
		} else {
			if updated.Resolution == nil {
				updated.Resolution = &GeoContradictionResolution{}
			}
			if patch.Resolution.Outcome != "" {
				updated.Resolution.Outcome = patch.Resolution.Outcome
			}
			if patch.Resolution.Note != "" || patch.Resolution.Note == "" {
				updated.Resolution.Note = trimMax(patch.Resolution.Note, 2000)
			}
			if patch.Resolution.MergedEventID != "" {
				updated.Resolution.MergedEventID = trimMax(patch.Resolution.MergedEventID, 64)
			}
			if patch.Resolution.MergedCandidateID != "" {
				updated.Resolution.MergedCandidateID = trimMax(patch.Resolution.MergedCandidateID, 64)
			}
			updated.Resolution.ResolvedAt = now
			updated.Resolution.ResolvedBy = updatedBy
		}
	}
	if len(patch.RemoveEvidenceIDs) > 0 {
		removeSet := make(map[string]struct{}, len(patch.RemoveEvidenceIDs))
		for _, id := range patch.RemoveEvidenceIDs {
			if trimmed := strings.TrimSpace(id); trimmed != "" {
				removeSet[trimmed] = struct{}{}
			}
		}
		filtered := make([]GeoContradictionEvidence, 0, len(updated.Evidence))
		for _, ev := range updated.Evidence {
			if _, exists := removeSet[ev.ID]; exists {
				continue
			}
			filtered = append(filtered, ev)
		}
		updated.Evidence = filtered
	}
	if len(patch.AddEvidence) > 0 {
		for _, ev := range patch.AddEvidence {
			kind := normalizeEvidenceKind(ev.Kind)
			updated.Evidence = append(updated.Evidence, GeoContradictionEvidence{
				ID:          randomPrefixedID("gcev"),
				Kind:        kind,
				Label:       trimMax(ev.Label, 240),
				Note:        trimMax(ev.Note, 2000),
				URL:         strings.TrimSpace(ev.URL),
				CandidateID: trimMax(ev.CandidateID, 64),
				EventID:     trimMax(ev.EventID, 64),
				CreatedAt:   now,
				CreatedBy:   updatedBy,
			})
		}
	}

	updated.UpdatedAt = now
	updated.UpdatedBy = updatedBy
	store.Contradictions[index] = updated
	if err := s.writeLocked(store); err != nil {
		return nil, nil, err
	}
	beforeCopy := before
	updatedCopy := updated
	return &beforeCopy, &updatedCopy, nil
}

func (s *TimelineStore) List(eventID string, limit int) ([]GeoTimelineEntry, error) {
	if s == nil {
		return nil, fmt.Errorf("timeline store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	if limit <= 0 {
		limit = 120
	}
	if limit > 500 {
		limit = 500
	}
	filtered := make([]GeoTimelineEntry, 0, len(store.Timeline))
	for _, entry := range store.Timeline {
		if eventID != "" && entry.EventID != eventID {
			continue
		}
		filtered = append(filtered, entry)
	}
	sort.SliceStable(filtered, func(i, j int) bool {
		return parseRFC3339(filtered[i].At).After(parseRFC3339(filtered[j].At))
	})
	if len(filtered) > limit {
		filtered = filtered[:limit]
	}
	return filtered, nil
}

func (s *TimelineStore) Append(entry GeoTimelineEntry) (*GeoTimelineEntry, error) {
	if s == nil {
		return nil, fmt.Errorf("timeline store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(entry.ID) == "" {
		entry.ID = randomPrefixedID("gt")
	}
	if strings.TrimSpace(entry.At) == "" {
		entry.At = time.Now().UTC().Format(time.RFC3339)
	}
	store.Timeline = append(store.Timeline, entry)
	if err := s.writeLocked(store); err != nil {
		return nil, err
	}
	copy := entry
	return &copy, nil
}

func (s *TimelineStore) ReplaceAll(items []GeoTimelineEntry) error {
	if s == nil {
		return fmt.Errorf("timeline store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store := timelineStoreFile{
		Timeline: append([]GeoTimelineEntry(nil), items...),
	}
	if store.Timeline == nil {
		store.Timeline = []GeoTimelineEntry{}
	}
	return s.writeLocked(store)
}

func (s *ContradictionsStore) readLocked() (contradictionsStoreFile, error) {
	raw, err := os.ReadFile(s.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return contradictionsStoreFile{Contradictions: []GeoContradiction{}}, nil
		}
		return contradictionsStoreFile{}, fmt.Errorf("read contradictions store: %w", err)
	}
	var parsed contradictionsStoreFile
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return contradictionsStoreFile{}, fmt.Errorf("decode contradictions store: %w", err)
	}
	if parsed.Contradictions == nil {
		parsed.Contradictions = []GeoContradiction{}
	}
	for i := range parsed.Contradictions {
		if parsed.Contradictions[i].Evidence == nil {
			parsed.Contradictions[i].Evidence = []GeoContradictionEvidence{}
		}
	}
	return parsed, nil
}

func (s *ContradictionsStore) writeLocked(store contradictionsStoreFile) error {
	return writeJSONFileAtomic(s.filePath, store)
}

func (s *TimelineStore) readLocked() (timelineStoreFile, error) {
	raw, err := os.ReadFile(s.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return timelineStoreFile{Timeline: []GeoTimelineEntry{}}, nil
		}
		return timelineStoreFile{}, fmt.Errorf("read timeline store: %w", err)
	}
	var parsed timelineStoreFile
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return timelineStoreFile{}, fmt.Errorf("decode timeline store: %w", err)
	}
	if parsed.Timeline == nil {
		parsed.Timeline = []GeoTimelineEntry{}
	}
	return parsed, nil
}

func (s *TimelineStore) writeLocked(store timelineStoreFile) error {
	return writeJSONFileAtomic(s.filePath, store)
}

func writeJSONFileAtomic(path string, value any) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return fmt.Errorf("mkdir store dir: %w", err)
	}
	encoded, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return fmt.Errorf("encode store: %w", err)
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, encoded, 0o644); err != nil {
		return fmt.Errorf("write temp store: %w", err)
	}
	if err := os.Rename(tmp, path); err != nil {
		return fmt.Errorf("replace store file: %w", err)
	}
	return nil
}

func normalizeEvidenceKind(kind string) string {
	switch strings.TrimSpace(kind) {
	case "source", "note", "candidate_link", "event_link":
		return strings.TrimSpace(kind)
	default:
		return "note"
	}
}

func cloneAnyMaps(items []map[string]any) []map[string]any {
	out := make([]map[string]any, 0, len(items))
	for _, item := range items {
		encoded, err := json.Marshal(item)
		if err != nil {
			continue
		}
		var mapped map[string]any
		if err := json.Unmarshal(encoded, &mapped); err != nil {
			continue
		}
		if mapped == nil {
			mapped = map[string]any{}
		}
		out = append(out, mapped)
	}
	return out
}

func cloneStrings(values []string) []string {
	if len(values) == 0 {
		return nil
	}
	out := make([]string, 0, len(values))
	for _, v := range values {
		if trimmed := strings.TrimSpace(v); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	if len(out) == 0 {
		return nil
	}
	return out
}

func trimMax(value string, max int) string {
	value = strings.TrimSpace(value)
	if max > 0 && len(value) > max {
		return value[:max]
	}
	return value
}

func trimmedOr(value, fallback string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}
	return value
}

func parseRFC3339(value string) time.Time {
	parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(value))
	if err != nil {
		return time.Time{}
	}
	return parsed
}

func randomPrefixedID(prefix string) string {
	var buf [8]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return fmt.Sprintf("%s_%d", prefix, time.Now().UnixNano())
	}
	return prefix + "_" + hex.EncodeToString(buf[:])
}
