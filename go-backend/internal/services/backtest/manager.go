package backtest

import (
	"context"
	"encoding/hex"
	"fmt"
	"hash/fnv"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type RunStatus string

const (
	RunStatusQueued    RunStatus = "queued"
	RunStatusRunning   RunStatus = "running"
	RunStatusCompleted RunStatus = "completed"
	RunStatusFailed    RunStatus = "failed"
)

type RunRequest struct {
	Strategy  string `json:"strategy"`
	Symbol    string `json:"symbol"`
	Exchange  string `json:"exchange"`
	AssetType string `json:"assetType"`
	StartTime int64  `json:"startTime,omitempty"`
	EndTime   int64  `json:"endTime,omitempty"`
}

type RunResult struct {
	NetReturn   float64 `json:"netReturn"`
	Sharpe      float64 `json:"sharpe"`
	MaxDrawdown float64 `json:"maxDrawdown"`
	Trades      int     `json:"trades"`
}

type Run struct {
	ID          string     `json:"id"`
	Status      RunStatus  `json:"status"`
	Progress    int        `json:"progress"`
	Executor    string     `json:"executor,omitempty"`
	UpstreamID  string     `json:"upstreamId,omitempty"`
	CreatedAt   int64      `json:"createdAt"`
	StartedAt   int64      `json:"startedAt,omitempty"`
	CompletedAt int64      `json:"completedAt,omitempty"`
	Request     RunRequest `json:"request"`
	Result      *RunResult `json:"result,omitempty"`
	Error       string     `json:"error,omitempty"`
}

type Manager struct {
	strategyDir      string
	executor         Executor
	executionTimeout time.Duration
	mu               sync.RWMutex
	runs             map[string]Run
}

func NewManager(strategyDir string) *Manager {
	return NewManagerWithExecutor(strategyDir, NewSimulatedExecutor(), 2*time.Minute)
}

func NewManagerWithExecutor(strategyDir string, executor Executor, executionTimeout time.Duration) *Manager {
	if executor == nil {
		executor = NewSimulatedExecutor()
	}
	if executionTimeout <= 0 {
		executionTimeout = 2 * time.Minute
	}
	return &Manager{
		strategyDir:      strings.TrimSpace(strategyDir),
		executor:         executor,
		executionTimeout: executionTimeout,
		runs:             make(map[string]Run),
	}
}

func (m *Manager) Start(req RunRequest) (Run, error) {
	req.Strategy = strings.TrimSpace(req.Strategy)
	req.Symbol = strings.TrimSpace(req.Symbol)
	req.Exchange = strings.ToLower(strings.TrimSpace(req.Exchange))
	req.AssetType = strings.ToLower(strings.TrimSpace(req.AssetType))
	if req.Strategy == "" {
		return Run{}, fmt.Errorf("strategy required")
	}
	if req.Symbol == "" || req.Exchange == "" || req.AssetType == "" {
		return Run{}, fmt.Errorf("symbol, exchange, assetType required")
	}
	if !strings.HasSuffix(strings.ToLower(req.Strategy), ".strat") {
		return Run{}, fmt.Errorf("strategy must reference .strat file")
	}
	if _, err := m.validateStrategy(req.Strategy); err != nil {
		return Run{}, err
	}

	now := time.Now().Unix()
	run := Run{
		ID:        newRunID(),
		Status:    RunStatusQueued,
		Progress:  0,
		Executor:  m.executor.Name(),
		CreatedAt: now,
		Request:   req,
	}

	m.mu.Lock()
	m.runs[run.ID] = run
	m.mu.Unlock()

	go m.execute(run.ID)
	return run, nil
}

func (m *Manager) Get(id string) (Run, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	run, ok := m.runs[id]
	return run, ok
}

func (m *Manager) List(limit int) []Run {
	if limit <= 0 {
		limit = 25
	}
	if limit > 200 {
		limit = 200
	}

	m.mu.RLock()
	defer m.mu.RUnlock()
	runs := make([]Run, 0, len(m.runs))
	for _, run := range m.runs {
		runs = append(runs, run)
	}
	sort.Slice(runs, func(i, j int) bool {
		return runs[i].CreatedAt > runs[j].CreatedAt
	})
	if len(runs) > limit {
		runs = runs[:limit]
	}
	return runs
}

func (m *Manager) StrategyExamples() ([]string, error) {
	if strings.TrimSpace(m.strategyDir) == "" {
		return nil, fmt.Errorf("strategy directory missing")
	}
	entries, err := os.ReadDir(m.strategyDir)
	if err != nil {
		return nil, err
	}
	result := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if filepath.Ext(entry.Name()) != ".strat" {
			continue
		}
		result = append(result, entry.Name())
	}
	sort.Strings(result)
	return result, nil
}

func (m *Manager) validateStrategy(strategy string) (string, error) {
	if strings.TrimSpace(m.strategyDir) == "" {
		return "", fmt.Errorf("strategy directory missing")
	}
	clean := filepath.Base(strategy)
	fullPath := filepath.Join(m.strategyDir, clean)
	info, err := os.Stat(fullPath)
	if err != nil || info.IsDir() {
		return "", fmt.Errorf("strategy not found")
	}
	return fullPath, nil
}

func (m *Manager) execute(runID string) {
	run, ok := m.Get(runID)
	if !ok {
		return
	}

	strategyPath, err := m.validateStrategy(run.Request.Strategy)
	if err != nil {
		m.update(runID, func(current *Run) {
			current.Status = RunStatusFailed
			current.Progress = 100
			current.CompletedAt = time.Now().Unix()
			current.Error = err.Error()
		})
		return
	}

	m.update(runID, func(run *Run) {
		run.Status = RunStatusRunning
		run.Progress = 30
		run.StartedAt = time.Now().Unix()
	})

	ctx, cancel := context.WithTimeout(context.Background(), m.executionTimeout)
	defer cancel()

	outcome, err := m.executor.Execute(ctx, run.Request, strategyPath)
	if err != nil {
		m.update(runID, func(run *Run) {
			run.Status = RunStatusFailed
			run.Progress = 100
			run.CompletedAt = time.Now().Unix()
			run.Error = err.Error()
		})
		return
	}

	m.update(runID, func(run *Run) {
		run.Status = RunStatusCompleted
		run.Progress = 100
		run.CompletedAt = time.Now().Unix()
		run.UpstreamID = outcome.UpstreamTaskID
		run.Result = outcome.Result
	})
}

func (m *Manager) update(runID string, apply func(run *Run)) {
	m.mu.Lock()
	defer m.mu.Unlock()
	run, ok := m.runs[runID]
	if !ok {
		return
	}
	apply(&run)
	m.runs[runID] = run
}

func simulateResult(req RunRequest) RunResult {
	h := fnv.New64a()
	_, _ = h.Write([]byte(req.Strategy + "|" + req.Symbol + "|" + req.Exchange + "|" + req.AssetType))
	seed := h.Sum64()

	netReturn := (float64(seed%2800) / 100.0) - 8.0
	sharpe := float64(seed%220)/100.0 + 0.2
	maxDrawdown := float64(seed%1800)/100.0 + 3.0
	trades := int(seed%140) + 12
	return RunResult{
		NetReturn:   round2(netReturn),
		Sharpe:      round2(sharpe),
		MaxDrawdown: round2(maxDrawdown),
		Trades:      trades,
	}
}

func round2(value float64) float64 {
	return math.Round(value*100) / 100
}

func newRunID() string {
	buf := make([]byte, 8)
	now := time.Now().UnixNano()
	for i := 0; i < len(buf); i++ {
		buf[i] = byte((now >> (i * 8)) & 0xff)
	}
	return "bt_" + strings.ToLower(hex.EncodeToString(buf))
}
