package backtest

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"
	"time"
)

type fakeExecutor struct {
	name    string
	outcome ExecutionOutcome
	err     error
}

type blockingExecutor struct{}

func (b *blockingExecutor) Name() string {
	return "blocking"
}

func (b *blockingExecutor) Execute(ctx context.Context, _ RunRequest, _ string) (ExecutionOutcome, error) {
	<-ctx.Done()
	return ExecutionOutcome{}, ctx.Err()
}

func (f *fakeExecutor) Name() string {
	if f.name != "" {
		return f.name
	}
	return "fake"
}

func (f *fakeExecutor) Execute(_ context.Context, _ RunRequest, _ string) (ExecutionOutcome, error) {
	if f.err != nil {
		return ExecutionOutcome{}, f.err
	}
	return f.outcome, nil
}

func TestManagerStartAndComplete(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "demo.strat"), []byte("x"), 0o644); err != nil {
		t.Fatalf("write strategy: %v", err)
	}

	manager := NewManager(dir)
	run, err := manager.Start(RunRequest{
		Strategy:  "demo.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	})
	if err != nil {
		t.Fatalf("start run: %v", err)
	}
	if run.ID == "" {
		t.Fatal("expected run id")
	}

	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		current, ok := manager.Get(run.ID)
		if !ok {
			t.Fatal("run should exist")
		}
		if current.Status == RunStatusCompleted {
			if current.Result == nil {
				t.Fatal("expected result on completed run")
			}
			return
		}
		time.Sleep(25 * time.Millisecond)
	}

	t.Fatal("run did not complete in time")
}

func TestManagerRejectsUnknownStrategy(t *testing.T) {
	manager := NewManager(t.TempDir())
	_, err := manager.Start(RunRequest{
		Strategy:  "missing.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	})
	if err == nil {
		t.Fatal("expected error for missing strategy")
	}
}

func TestManagerPersistsUpstreamTaskID(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "demo.strat"), []byte("x"), 0o644); err != nil {
		t.Fatalf("write strategy: %v", err)
	}

	manager := NewManagerWithExecutor(dir, &fakeExecutor{
		name: "gct-backtester",
		outcome: ExecutionOutcome{
			UpstreamTaskID: "task-abc",
		},
	}, time.Second)
	run, err := manager.Start(RunRequest{
		Strategy:  "demo.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	})
	if err != nil {
		t.Fatalf("start run: %v", err)
	}

	deadline := time.Now().Add(800 * time.Millisecond)
	for time.Now().Before(deadline) {
		current, ok := manager.Get(run.ID)
		if !ok {
			t.Fatal("run should exist")
		}
		if current.Status == RunStatusCompleted {
			if current.UpstreamID != "task-abc" {
				t.Fatalf("expected upstream id task-abc, got %s", current.UpstreamID)
			}
			if current.Executor != "gct-backtester" {
				t.Fatalf("expected executor gct-backtester, got %s", current.Executor)
			}
			return
		}
		time.Sleep(20 * time.Millisecond)
	}
	t.Fatal("run did not complete in time")
}

func TestManagerMarksRunFailedWhenExecutorFails(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "demo.strat"), []byte("x"), 0o644); err != nil {
		t.Fatalf("write strategy: %v", err)
	}

	manager := NewManagerWithExecutor(dir, &fakeExecutor{
		name: "failing-executor",
		err:  errors.New("upstream broken"),
	}, time.Second)
	run, err := manager.Start(RunRequest{
		Strategy:  "demo.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	})
	if err != nil {
		t.Fatalf("start run: %v", err)
	}

	deadline := time.Now().Add(800 * time.Millisecond)
	for time.Now().Before(deadline) {
		current, ok := manager.Get(run.ID)
		if !ok {
			t.Fatal("run should exist")
		}
		if current.Status == RunStatusFailed {
			if current.Error == "" {
				t.Fatal("expected error on failed run")
			}
			return
		}
		time.Sleep(20 * time.Millisecond)
	}
	t.Fatal("run did not fail in time")
}

func TestManagerCancelQueuedRun(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "demo.strat"), []byte("x"), 0o644); err != nil {
		t.Fatalf("write strategy: %v", err)
	}

	manager := NewManagerWithExecutor(dir, &blockingExecutor{}, 2*time.Second)
	run, err := manager.Start(RunRequest{
		Strategy:  "demo.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	})
	if err != nil {
		t.Fatalf("start run: %v", err)
	}

	cancelled, cancelErr := manager.Cancel(run.ID)
	if cancelErr != nil {
		t.Fatalf("cancel run: %v", cancelErr)
	}
	if cancelled.Status != RunStatusCanceled && cancelled.Status != RunStatusCancelRequested {
		t.Fatalf("expected canceled or cancel_requested, got %s", cancelled.Status)
	}

	deadline := time.Now().Add(1200 * time.Millisecond)
	for time.Now().Before(deadline) {
		current, ok := manager.Get(run.ID)
		if !ok {
			t.Fatal("run should exist")
		}
		if current.Status == RunStatusCanceled {
			return
		}
		time.Sleep(20 * time.Millisecond)
	}
	t.Fatal("run was not canceled")
}

func TestManagerCancelCompletedRunReturnsConflict(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "demo.strat"), []byte("x"), 0o644); err != nil {
		t.Fatalf("write strategy: %v", err)
	}

	manager := NewManagerWithExecutor(dir, &fakeExecutor{}, 500*time.Millisecond)
	run, err := manager.Start(RunRequest{
		Strategy:  "demo.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	})
	if err != nil {
		t.Fatalf("start run: %v", err)
	}

	deadline := time.Now().Add(1200 * time.Millisecond)
	for time.Now().Before(deadline) {
		current, ok := manager.Get(run.ID)
		if !ok {
			t.Fatal("run should exist")
		}
		if current.Status == RunStatusCompleted {
			_, cancelErr := manager.Cancel(run.ID)
			if !errors.Is(cancelErr, ErrRunNotCancelable) {
				t.Fatalf("expected ErrRunNotCancelable, got %v", cancelErr)
			}
			return
		}
		time.Sleep(20 * time.Millisecond)
	}
	t.Fatal("run did not complete in time")
}
