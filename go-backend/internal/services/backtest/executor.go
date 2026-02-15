package backtest

import (
	"context"
	"time"
)

type ExecutionOutcome struct {
	UpstreamTaskID string
	Result         *RunResult
}

type Executor interface {
	Name() string
	Execute(ctx context.Context, req RunRequest, strategyPath string) (ExecutionOutcome, error)
}

type SimulatedExecutor struct {
	delay time.Duration
}

func NewSimulatedExecutor() *SimulatedExecutor {
	return &SimulatedExecutor{delay: 80 * time.Millisecond}
}

func (e *SimulatedExecutor) Name() string {
	return "simulated"
}

func (e *SimulatedExecutor) Execute(ctx context.Context, req RunRequest, _ string) (ExecutionOutcome, error) {
	if e.delay > 0 {
		timer := time.NewTimer(e.delay)
		defer timer.Stop()
		select {
		case <-ctx.Done():
			return ExecutionOutcome{}, ctx.Err()
		case <-timer.C:
		}
	}

	result := simulateResult(req)
	return ExecutionOutcome{
		Result: &result,
	}, nil
}
