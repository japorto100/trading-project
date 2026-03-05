// Package plugin provides Internal Plugin Pilot scaffold. Phase 24.1.
package plugin

import (
	"fmt"
	"sync"
)

type Manifest struct {
	PluginID     string   `json:"plugin_id"`
	Version      string   `json:"version"`
	EntryPoint   string   `json:"entry_point"`
	Capabilities []string `json:"capabilities"`
}

type Registry struct {
	mu       sync.RWMutex
	allowlist map[string]Manifest
	disabled map[string]bool
	killSwitch bool
}

func NewRegistry() *Registry {
	return &Registry{
		allowlist: make(map[string]Manifest),
		disabled:  make(map[string]bool),
	}
}

func (r *Registry) Allow(m Manifest) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.killSwitch {
		return fmt.Errorf("plugin kill switch active")
	}
	r.allowlist[m.PluginID] = m
	return nil
}

func (r *Registry) IsAllowed(pluginID string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if r.killSwitch || r.disabled[pluginID] {
		return false
	}
	_, ok := r.allowlist[pluginID]
	return ok
}

func (r *Registry) SetKillSwitch(on bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.killSwitch = on
}

func (r *Registry) Disable(pluginID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.disabled[pluginID] = true
}
