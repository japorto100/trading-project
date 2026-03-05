// Package capability implements Phase 23 Capability Registry.
// API/Tool scopes, owner, risk-tier per CAPABILITY_REGISTRY.md
package capability

import (
	"fmt"
	"os"
	"strings"
	"sync"

	"gopkg.in/yaml.v3"
)

// RiskTier per CAPABILITY_REGISTRY.md
const (
	RiskReadOnly      = "read-only"
	RiskBoundedWrite  = "bounded-write"
	RiskApprovalWrite = "approval-write"
)

// Capability represents a single API or tool capability.
type Capability struct {
	ID         string   `yaml:"id"`
	Scope      []string `yaml:"scope"`
	Owner      string   `yaml:"owner"`
	RiskTier   string   `yaml:"risk_tier"`
	Deprecated bool     `yaml:"deprecated"`
}

// Registry holds capabilities and provides lookup.
type Registry struct {
	mu   sync.RWMutex
	byID map[string]*Capability
	all  []*Capability
}

// ConfigFile is the YAML structure for capabilities.
type ConfigFile struct {
	Capabilities []Capability `yaml:"capabilities"`
}

// NewRegistry creates an empty registry.
func NewRegistry() *Registry {
	return &Registry{
		byID: make(map[string]*Capability),
		all:  nil,
	}
}

// LoadFromFile loads capabilities from a YAML file.
func (r *Registry) LoadFromFile(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("capability load %s: %w", path, err)
	}
	var cfg ConfigFile
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return fmt.Errorf("capability parse %s: %w", path, err)
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.byID = make(map[string]*Capability)
	r.all = nil
	for i := range cfg.Capabilities {
		c := &cfg.Capabilities[i]
		r.byID[c.ID] = c
		r.all = append(r.all, c)
	}
	return nil
}

// Lookup returns the capability by ID or nil.
func (r *Registry) Lookup(id string) *Capability {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.byID[id]
}

// ListByScope returns capabilities that have any of the given scopes.
func (r *Registry) ListByScope(scopes ...string) []*Capability {
	r.mu.RLock()
	defer r.mu.RUnlock()
	set := make(map[string]bool)
	for _, s := range scopes {
		set[s] = true
	}
	var out []*Capability
	for _, c := range r.all {
		if c.Deprecated {
			continue
		}
		for _, s := range c.Scope {
			if set[s] {
				out = append(out, c)
				break
			}
		}
	}
	return out
}

// ListByRiskTier returns capabilities with the given risk tier.
func (r *Registry) ListByRiskTier(tier string) []*Capability {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var out []*Capability
	for _, c := range r.all {
		if !c.Deprecated && c.RiskTier == tier {
			out = append(out, c)
		}
	}
	return out
}

// RequireReadOnly returns true if the capability is read-only (no mutation).
func (c *Capability) RequireReadOnly() bool {
	return c != nil && strings.EqualFold(c.RiskTier, RiskReadOnly)
}

// RequireIdempotencyKey returns true for bounded-write (needs idempotencyKey).
func (c *Capability) RequireIdempotencyKey() bool {
	return c != nil && strings.EqualFold(c.RiskTier, RiskBoundedWrite)
}

// RequireApproval returns true for approval-write.
func (c *Capability) RequireApproval() bool {
	return c != nil && strings.EqualFold(c.RiskTier, RiskApprovalWrite)
}
