package backtest

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

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
