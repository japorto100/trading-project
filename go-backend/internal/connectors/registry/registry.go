package registry

import (
	"fmt"
	"os"
	"sort"
	"strings"

	baseconnectors "tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/groups"

	"github.com/go-playground/validator/v10"
	"gopkg.in/yaml.v3"
)

var validate = validator.New()

type Config struct {
	AssetClasses map[string]AssetClassConfig `yaml:"asset_classes" validate:"required,dive"`
	Groups       map[string]GroupConfig      `yaml:"groups,omitempty"`
	Providers    map[string]ProviderConfig   `yaml:"providers" validate:"required,dive"`
}

type AssetClassConfig struct {
	Providers []string `yaml:"providers" validate:"required,min=1"`
	Strategy  string   `yaml:"strategy" validate:"required"`
}

type ProviderConfig struct {
	Group              string                      `yaml:"group,omitempty"`
	Kind               string                      `yaml:"kind,omitempty"`
	Notes              string                      `yaml:"notes,omitempty"`
	AuthMode           string                      `yaml:"auth_mode,omitempty"`
	Enabled            *bool                       `yaml:"enabled,omitempty"`
	RateLimitPerSecond float64                     `yaml:"rate_limit_per_second,omitempty"`
	RateLimitBurst     int                         `yaml:"rate_limit_burst,omitempty"`
	RetryProfile       string                      `yaml:"retry_profile,omitempty"`
	Fallbacks          []string                    `yaml:"fallbacks,omitempty"`
	Bridge             string                      `yaml:"bridge,omitempty"`
	Capabilities       baseconnectors.Capabilities `yaml:"capabilities,omitempty"`
}

type GroupConfig struct {
	MaxConcurrency     int     `yaml:"max_concurrency,omitempty"`
	RateLimitPerSecond float64 `yaml:"rate_limit_per_second,omitempty"`
	RateLimitBurst     int     `yaml:"rate_limit_burst,omitempty"`
	RetryProfile       string  `yaml:"retry_profile,omitempty"`
}

type Registry struct {
	assetClasses  map[string]AssetClassConfig
	descriptors   map[string]baseconnectors.ProviderDescriptor
	groupPolicies map[string]groups.Policy
}

func New(cfg Config) *Registry {
	r := &Registry{
		assetClasses:  make(map[string]AssetClassConfig, len(cfg.AssetClasses)),
		descriptors:   make(map[string]baseconnectors.ProviderDescriptor, len(cfg.Providers)),
		groupPolicies: make(map[string]groups.Policy, len(cfg.Groups)),
	}
	for name, groupCfg := range cfg.Groups {
		normalized := groups.Normalize(name)
		if normalized == "" {
			continue
		}
		r.groupPolicies[normalized] = groups.Policy{
			Name:               normalized,
			MaxConcurrency:     groupCfg.MaxConcurrency,
			RateLimitPerSecond: groupCfg.RateLimitPerSecond,
			RateLimitBurst:     groupCfg.RateLimitBurst,
			RetryProfile:       normalizeKey(groupCfg.RetryProfile),
		}
	}
	for name, provider := range cfg.Providers {
		normalized := normalizeProvider(name)
		if normalized == "" {
			continue
		}
		enabled := true
		if provider.Enabled != nil {
			enabled = *provider.Enabled
		}
		r.descriptors[normalized] = baseconnectors.ProviderDescriptor{
			Name:               normalized,
			Group:              groups.Normalize(provider.Group),
			Kind:               strings.TrimSpace(provider.Kind),
			AuthMode:           normalizeKey(provider.AuthMode),
			Bridge:             normalizeKey(provider.Bridge),
			Notes:              strings.TrimSpace(provider.Notes),
			Enabled:            enabled,
			RateLimitPerSecond: provider.RateLimitPerSecond,
			RateLimitBurst:     provider.RateLimitBurst,
			RetryProfile:       normalizeKey(provider.RetryProfile),
			Fallbacks:          normalizeProviders(provider.Fallbacks),
			Capabilities:       provider.Capabilities,
		}
	}
	for name, assetClass := range cfg.AssetClasses {
		normalizedName := normalizeKey(name)
		if normalizedName == "" {
			continue
		}
		r.assetClasses[normalizedName] = AssetClassConfig{
			Providers: normalizeProviders(assetClass.Providers),
			Strategy:  normalizeKey(assetClass.Strategy),
		}
	}
	return r
}

func LoadFromFile(path string) (*Registry, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read provider registry config: %w", err)
	}
	var cfg Config
	if err := yaml.Unmarshal(raw, &cfg); err != nil {
		return nil, fmt.Errorf("decode provider registry config: %w", err)
	}
	if err := validate.Struct(cfg); err != nil {
		return nil, fmt.Errorf("validate provider registry config: %w", err)
	}
	return New(cfg), nil
}

func (r *Registry) Descriptor(provider string) (baseconnectors.ProviderDescriptor, bool) {
	if r == nil {
		return baseconnectors.ProviderDescriptor{}, false
	}
	descriptor, ok := r.descriptors[normalizeProvider(provider)]
	return descriptor, ok
}

func (r *Registry) DescriptorsByGroup(group string) []baseconnectors.ProviderDescriptor {
	if r == nil {
		return nil
	}
	normalizedGroup := groups.Normalize(group)
	if normalizedGroup == "" {
		return nil
	}
	out := make([]baseconnectors.ProviderDescriptor, 0)
	for _, descriptor := range r.descriptors {
		if descriptor.Group != normalizedGroup {
			continue
		}
		out = append(out, descriptor)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out
}

func (r *Registry) AssetClass(name string) (AssetClassConfig, bool) {
	if r == nil {
		return AssetClassConfig{}, false
	}
	assetClass, ok := r.assetClasses[normalizeKey(name)]
	return assetClass, ok
}

func (r *Registry) GroupPolicy(group string) (groups.Policy, bool) {
	if r == nil {
		return groups.Policy{}, false
	}
	policy, ok := r.groupPolicies[groups.Normalize(group)]
	return policy, ok
}

func (r *Registry) AssetClassNames() []string {
	if r == nil {
		return nil
	}
	names := make([]string, 0, len(r.assetClasses))
	for name := range r.assetClasses {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

func (r *Registry) ProviderNames() []string {
	if r == nil {
		return nil
	}
	names := make([]string, 0, len(r.descriptors))
	for name := range r.descriptors {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

func normalizeKey(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func normalizeProvider(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func normalizeProviders(values []string) []string {
	if len(values) == 0 {
		return nil
	}
	out := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		normalized := normalizeProvider(value)
		if normalized == "" {
			continue
		}
		if _, exists := seen[normalized]; exists {
			continue
		}
		seen[normalized] = struct{}{}
		out = append(out, normalized)
	}
	return out
}
