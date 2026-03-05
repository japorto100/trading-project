// Package rollout provides Reversible Rollout Gates scaffold. Phase 24.4.
package rollout

import (
	"sync"
)

type Stage string

const (
	StageInternal Stage = "internal"
	StagePilot   Stage = "pilot"
	StageLimited Stage = "limited_external"
	StageGeneral Stage = "general"
)

type GateConfig struct {
	ErrorRateMax   float64
	LatencyP95Ms   int
	AvailabilityMin float64
}

type FeatureRollout struct {
	Feature string
	Stage   Stage
	Gates   GateConfig
}

type Registry struct {
	mu       sync.RWMutex
	features map[string]FeatureRollout
}

func NewRegistry() *Registry {
	return &Registry{
		features: make(map[string]FeatureRollout),
	}
}

func (r *Registry) SetStage(feature string, stage Stage) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.features[feature].Gates.ErrorRateMax == 0 {
		r.features[feature] = FeatureRollout{
			Feature: feature,
			Stage:   stage,
			Gates: GateConfig{
				ErrorRateMax:    0.01,
				LatencyP95Ms:    500,
				AvailabilityMin: 0.995,
			},
		}
	} else {
		f := r.features[feature]
		f.Stage = stage
		r.features[feature] = f
	}
}

func (r *Registry) GetStage(feature string) Stage {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if f, ok := r.features[feature]; ok {
		return f.Stage
	}
	return StageInternal
}
