package adaptive

import (
	"context"
	"fmt"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	baseconnectors "tradeviewfusion/go-backend/internal/connectors/base"

	"gopkg.in/yaml.v3"
)

type Config struct {
	AssetClasses map[string]AssetClassConfig `yaml:"asset_classes"`
	Providers    map[string]ProviderConfig   `yaml:"providers"`
}

type AssetClassConfig struct {
	Providers []string `yaml:"providers"`
	Strategy  string   `yaml:"strategy"`
}

type ProviderConfig struct {
	Group        string                      `yaml:"group,omitempty"`
	Kind         string                      `yaml:"kind,omitempty"`
	Notes        string                      `yaml:"notes,omitempty"`
	Capabilities baseconnectors.Capabilities `yaml:"capabilities,omitempty"`
}

type ProviderState struct {
	Name           string                      `json:"name"`
	Group          string                      `json:"group,omitempty"`
	Kind           string                      `json:"kind,omitempty"`
	Capabilities   baseconnectors.Capabilities `json:"capabilities,omitempty"`
	Healthy        bool                        `json:"healthy"`
	CircuitOpen    bool                        `json:"circuitOpen"`
	Score          int                         `json:"score"`
	Failures       int                         `json:"failures"`
	Consecutive    int                         `json:"consecutiveFailures"`
	Successes      int                         `json:"successes"`
	LastError      string                      `json:"lastError,omitempty"`
	LastErrorClass baseconnectors.ErrorClass   `json:"lastErrorClass,omitempty"`
	FailureClasses map[string]int              `json:"failureClasses,omitempty"`
	LastFailure    time.Time                   `json:"lastFailure,omitempty"`
	LastSuccess    time.Time                   `json:"lastSuccess,omitempty"`
	CooldownUntil  time.Time                   `json:"cooldownUntil,omitempty"`
}

type Router struct {
	mu               sync.RWMutex
	assetClasses     map[string]AssetClassConfig
	states           map[string]*ProviderState
	providerMeta     map[string]ProviderConfig
	circuitThreshold int
	cooldown         time.Duration
}

func New(cfg Config) *Router {
	r := &Router{
		assetClasses:     make(map[string]AssetClassConfig),
		states:           make(map[string]*ProviderState),
		providerMeta:     make(map[string]ProviderConfig),
		circuitThreshold: 2,
		cooldown:         30 * time.Second,
	}
	for name, meta := range cfg.Providers {
		normalized := normalizeProvider(name)
		if normalized == "" {
			continue
		}
		r.providerMeta[normalized] = ProviderConfig{
			Group:        normalizeKey(meta.Group),
			Kind:         strings.TrimSpace(meta.Kind),
			Notes:        strings.TrimSpace(meta.Notes),
			Capabilities: meta.Capabilities,
		}
	}
	for k, v := range cfg.AssetClasses {
		key := normalizeKey(k)
		providers := make([]string, 0, len(v.Providers))
		for _, p := range v.Providers {
			name := normalizeProvider(p)
			if name == "" {
				continue
			}
			providers = append(providers, name)
			if _, exists := r.states[name]; !exists {
				state := &ProviderState{Name: name, Healthy: true, Score: 100}
				r.applyProviderMetaLocked(state, name)
				r.states[name] = state
			}
		}
		r.assetClasses[key] = AssetClassConfig{
			Providers: providers,
			Strategy:  strings.TrimSpace(v.Strategy),
		}
	}
	return r
}

func LoadFromFile(path string) (*Router, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read adaptive router config: %w", err)
	}
	var cfg Config
	if err := yaml.Unmarshal(raw, &cfg); err != nil {
		return nil, fmt.Errorf("decode adaptive router config: %w", err)
	}
	return New(cfg), nil
}

func (r *Router) Candidates(assetClass string, allowlist []string) []string {
	if r == nil {
		return cloneStrings(allowlist)
	}

	key := normalizeKey(assetClass)
	r.mu.Lock()
	classCfg, hasClass := r.assetClasses[key]
	now := time.Now()
	type candidate struct {
		name  string
		score int
		open  bool
	}
	candidates := make([]candidate, 0)
	added := make(map[string]struct{})
	addIfAllowed := func(name string) {
		if name == "" {
			return
		}
		normalized := normalizeProvider(name)
		if normalized == "" {
			return
		}
		if len(allowlist) > 0 && !containsNormalized(allowlist, normalized) {
			return
		}
		if _, exists := added[normalized]; exists {
			return
		}
		state := r.ensureStateLocked(normalized)
		circuitOpen := !state.CooldownUntil.IsZero() && now.Before(state.CooldownUntil)
		score := state.Score
		if score == 0 {
			score = 100
		}
		candidates = append(candidates, candidate{name: normalized, score: score, open: circuitOpen})
		added[normalized] = struct{}{}
	}
	if hasClass {
		for _, provider := range classCfg.Providers {
			addIfAllowed(provider)
		}
	}
	for _, provider := range allowlist {
		addIfAllowed(provider)
	}
	r.mu.Unlock()

	sort.SliceStable(candidates, func(i, j int) bool {
		if candidates[i].open != candidates[j].open {
			return !candidates[i].open
		}
		if candidates[i].score != candidates[j].score {
			return candidates[i].score > candidates[j].score
		}
		return candidates[i].name < candidates[j].name
	})

	out := make([]string, 0, len(candidates))
	for _, c := range candidates {
		out = append(out, c.name)
	}
	return out
}

func (r *Router) RecordSuccess(provider string) {
	if r == nil {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	state := r.ensureStateLocked(provider)
	state.Healthy = true
	state.CircuitOpen = false
	state.Successes++
	state.Consecutive = 0
	state.LastError = ""
	state.LastErrorClass = ""
	state.LastSuccess = time.Now()
	state.CooldownUntil = time.Time{}
	if state.Score < 100 {
		state.Score += 10
		if state.Score > 100 {
			state.Score = 100
		}
	}
}

func (r *Router) RecordFailure(provider string, err error) {
	r.RecordFailureWithClass(provider, err, baseconnectors.ClassifyError(err, nil))
}

func (r *Router) RecordFailureWithClass(provider string, err error, class baseconnectors.ErrorClass) {
	if r == nil {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	state := r.ensureStateLocked(provider)
	if state.FailureClasses == nil {
		state.FailureClasses = make(map[string]int)
	}
	state.Healthy = false
	state.Failures++
	state.Consecutive++
	state.LastFailure = time.Now()
	if err != nil {
		state.LastError = strings.TrimSpace(err.Error())
	}
	if class != "" {
		state.LastErrorClass = class
		state.FailureClasses[string(class)]++
	}
	if state.Score > 10 {
		state.Score -= 15
	} else {
		state.Score = 1
	}
	if state.Consecutive >= r.circuitThreshold {
		state.CircuitOpen = true
		state.CooldownUntil = time.Now().Add(r.cooldown)
	}
}

func (r *Router) Snapshot() []ProviderState {
	if r == nil {
		return nil
	}
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]ProviderState, 0, len(r.states))
	for _, state := range r.states {
		copyState := *state
		if state.FailureClasses != nil {
			copyState.FailureClasses = make(map[string]int, len(state.FailureClasses))
			for k, v := range state.FailureClasses {
				copyState.FailureClasses[k] = v
			}
		}
		if !copyState.CooldownUntil.IsZero() && time.Now().After(copyState.CooldownUntil) {
			copyState.CircuitOpen = false
		}
		out = append(out, copyState)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Score != out[j].Score {
			return out[i].Score > out[j].Score
		}
		return out[i].Name < out[j].Name
	})
	return out
}

func (r *Router) Wait(ctx context.Context) error {
	if r == nil {
		return nil
	}
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
		return nil
	}
}

func (r *Router) ensureStateLocked(name string) *ProviderState {
	normalized := normalizeProvider(name)
	if normalized == "" {
		normalized = "unknown"
	}
	if state, ok := r.states[normalized]; ok {
		if !state.CooldownUntil.IsZero() && time.Now().After(state.CooldownUntil) {
			state.CircuitOpen = false
		}
		if state.Score == 0 {
			state.Score = 100
		}
		if state.Name == "" {
			state.Name = normalized
		}
		r.applyProviderMetaLocked(state, normalized)
		return state
	}
	state := &ProviderState{Name: normalized, Healthy: true, Score: 100}
	r.applyProviderMetaLocked(state, normalized)
	r.states[normalized] = state
	return state
}

func (r *Router) applyProviderMetaLocked(state *ProviderState, name string) {
	if r == nil || state == nil {
		return
	}
	meta, ok := r.providerMeta[normalizeProvider(name)]
	if !ok {
		return
	}
	if state.Group == "" {
		state.Group = normalizeKey(meta.Group)
	}
	if state.Kind == "" {
		state.Kind = strings.TrimSpace(meta.Kind)
	}
	if state.Capabilities == (baseconnectors.Capabilities{}) {
		state.Capabilities = meta.Capabilities
	}
}

func normalizeKey(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func normalizeProvider(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func containsNormalized(values []string, needle string) bool {
	for _, value := range values {
		if normalizeProvider(value) == needle {
			return true
		}
	}
	return false
}

func cloneStrings(values []string) []string {
	if len(values) == 0 {
		return nil
	}
	out := make([]string, len(values))
	copy(out, values)
	return out
}
