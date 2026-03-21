package adaptive

import (
	"context"
	"fmt"
	"maps"
	"sort"
	"strings"
	"sync"
	"time"

	baseconnectors "tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/groups"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
)

type Config = connectorregistry.Config
type AssetClassConfig = connectorregistry.AssetClassConfig
type ProviderConfig = connectorregistry.ProviderConfig

type ProviderState struct {
	Name               string                      `json:"name"`
	Group              string                      `json:"group,omitempty"`
	Kind               string                      `json:"kind,omitempty"`
	Notes              string                      `json:"notes,omitempty"`
	AuthMode           string                      `json:"authMode,omitempty"`
	Enabled            bool                        `json:"enabled"`
	RateLimitPerSecond float64                     `json:"rateLimitPerSecond,omitempty"`
	RateLimitBurst     int                         `json:"rateLimitBurst,omitempty"`
	RetryProfile       string                      `json:"retryProfile,omitempty"`
	Fallbacks          []string                    `json:"fallbacks,omitempty"`
	Bridge             string                      `json:"bridge,omitempty"`
	Capabilities       baseconnectors.Capabilities `json:"capabilities,omitzero"`
	Healthy            bool                        `json:"healthy"`
	CircuitOpen        bool                        `json:"circuitOpen"`
	Score              int                         `json:"score"`
	Failures           int                         `json:"failures"`
	Consecutive        int                         `json:"consecutiveFailures"`
	Successes          int                         `json:"successes"`
	LastError          string                      `json:"lastError,omitempty"`
	LastErrorClass     baseconnectors.ErrorClass   `json:"lastErrorClass,omitempty"`
	FailureClasses     map[string]int              `json:"failureClasses,omitempty"`
	LastFailure        time.Time                   `json:"lastFailure,omitzero"`
	LastSuccess        time.Time                   `json:"lastSuccess,omitzero"`
	CooldownUntil      time.Time                   `json:"cooldownUntil,omitzero"`
}

type Router struct {
	mu               sync.RWMutex
	assetClasses     map[string]AssetClassConfig
	states           map[string]*ProviderState
	providerMeta     map[string]baseconnectors.ProviderDescriptor
	groupPolicies    map[string]groups.Policy
	circuitThreshold int
	cooldown         time.Duration
}

func New(cfg Config) *Router {
	return NewFromRegistry(connectorregistry.New(cfg))
}

func NewFromRegistry(reg *connectorregistry.Registry) *Router {
	r := &Router{
		assetClasses:     make(map[string]AssetClassConfig),
		states:           make(map[string]*ProviderState),
		providerMeta:     make(map[string]baseconnectors.ProviderDescriptor),
		groupPolicies:    make(map[string]groups.Policy),
		circuitThreshold: 2,
		cooldown:         30 * time.Second,
	}
	if reg == nil {
		return r
	}
	for _, name := range reg.ProviderNames() {
		descriptor, ok := reg.Descriptor(name)
		if !ok {
			continue
		}
		r.providerMeta[name] = descriptor
	}
	for _, groupName := range groups.All() {
		if policy, ok := reg.GroupPolicy(groupName); ok {
			r.groupPolicies[groupName] = policy
		}
	}
	for _, name := range reg.AssetClassNames() {
		assetClass, ok := reg.AssetClass(name)
		if !ok {
			continue
		}
		r.assetClasses[name] = assetClass
		for _, provider := range assetClass.Providers {
			if _, exists := r.states[provider]; exists {
				continue
			}
			state := &ProviderState{Name: provider, Healthy: true, Score: 100, Enabled: true}
			r.applyProviderMetaLocked(state, provider)
			r.states[provider] = state
		}
	}
	return r
}

func LoadFromFile(path string) (*Router, error) {
	reg, err := connectorregistry.LoadFromFile(path)
	if err != nil {
		return nil, fmt.Errorf("load adaptive router config: %w", err)
	}
	return NewFromRegistry(reg), nil
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
		if !state.Enabled {
			return
		}
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
	} else {
		for _, provider := range allowlist {
			addIfAllowed(provider)
		}
	}
	r.mu.Unlock()

	sort.SliceStable(candidates, func(i, j int) bool {
		if candidates[i].open != candidates[j].open {
			return !candidates[i].open
		}
		if candidates[i].score != candidates[j].score {
			return candidates[i].score > candidates[j].score
		}
		return false
	})

	out := make([]string, 0, len(candidates))
	for _, c := range candidates {
		out = append(out, c.name)
	}
	return out
}

func (r *Router) Strategy(assetClass string) string {
	if r == nil {
		return ""
	}
	r.mu.RLock()
	defer r.mu.RUnlock()
	classCfg, ok := r.assetClasses[normalizeKey(assetClass)]
	if !ok {
		return ""
	}
	return normalizeKey(classCfg.Strategy)
}

func (r *Router) GroupPolicy(group string) (groups.Policy, bool) {
	if r == nil {
		return groups.Policy{}, false
	}
	r.mu.RLock()
	defer r.mu.RUnlock()
	policy, ok := r.groupPolicies[groups.Normalize(group)]
	return policy, ok
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
			maps.Copy(copyState.FailureClasses, state.FailureClasses)
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

func (r *Router) Descriptor(provider string) (baseconnectors.ProviderDescriptor, bool) {
	if r == nil {
		return baseconnectors.ProviderDescriptor{}, false
	}
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.descriptorLocked(provider)
}

func (r *Router) DescriptorsByGroup(group string) []baseconnectors.ProviderDescriptor {
	if r == nil {
		return nil
	}
	r.mu.RLock()
	defer r.mu.RUnlock()
	group = normalizeGroup(group)
	if group == "" {
		return nil
	}
	out := make([]baseconnectors.ProviderDescriptor, 0)
	for name := range r.providerMeta {
		descriptor, ok := r.descriptorLocked(name)
		if !ok || descriptor.Group != group {
			continue
		}
		out = append(out, descriptor)
	}
	sort.Slice(out, func(i, j int) bool {
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
		return fmt.Errorf("wait for adaptive router context: %w", ctx.Err())
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
	state := &ProviderState{Name: normalized, Healthy: true, Score: 100, Enabled: true}
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
		state.Group = groups.Normalize(meta.Group)
	}
	if state.Kind == "" {
		state.Kind = strings.TrimSpace(meta.Kind)
	}
	if state.Notes == "" {
		state.Notes = strings.TrimSpace(meta.Notes)
	}
	if state.AuthMode == "" {
		state.AuthMode = normalizeKey(meta.AuthMode)
	}
	state.Enabled = meta.Enabled
	if state.RateLimitPerSecond == 0 {
		state.RateLimitPerSecond = meta.RateLimitPerSecond
	}
	if state.RateLimitBurst == 0 {
		state.RateLimitBurst = meta.RateLimitBurst
	}
	if state.RetryProfile == "" {
		state.RetryProfile = normalizeKey(meta.RetryProfile)
	}
	if state.Bridge == "" {
		state.Bridge = normalizeKey(meta.Bridge)
	}
	if len(state.Fallbacks) == 0 && len(meta.Fallbacks) > 0 {
		state.Fallbacks = append([]string(nil), meta.Fallbacks...)
	}
	if state.Capabilities == (baseconnectors.Capabilities{}) {
		state.Capabilities = meta.Capabilities
	}
}

func normalizeKey(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func normalizeGroup(value string) string {
	return groups.Normalize(value)
}

func normalizeProvider(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func (r *Router) descriptorLocked(provider string) (baseconnectors.ProviderDescriptor, bool) {
	normalized := normalizeProvider(provider)
	meta, ok := r.providerMeta[normalized]
	if !ok {
		return baseconnectors.ProviderDescriptor{}, false
	}
	meta.Name = normalized
	meta.Group = groups.Normalize(meta.Group)
	meta.AuthMode = normalizeKey(meta.AuthMode)
	meta.Bridge = normalizeKey(meta.Bridge)
	meta.RetryProfile = normalizeKey(meta.RetryProfile)
	meta.Fallbacks = append([]string(nil), meta.Fallbacks...)
	return meta, true
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
