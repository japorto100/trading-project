package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	backtestService "tradeviewfusion/go-backend/internal/services/backtest"
)

type fakeBacktestRunManager struct {
	started backtestService.Run
	startErr error
	run      backtestService.Run
	found    bool
	list     []backtestService.Run
}

func (f *fakeBacktestRunManager) Start(_ backtestService.RunRequest) (backtestService.Run, error) {
	if f.startErr != nil {
		return backtestService.Run{}, f.startErr
	}
	return f.started, nil
}

func (f *fakeBacktestRunManager) Get(_ string) (backtestService.Run, bool) {
	return f.run, f.found
}

func (f *fakeBacktestRunManager) List(_ int) []backtestService.Run {
	return f.list
}

func TestBacktestRunsHandler_CreatesRun(t *testing.T) {
	manager := &fakeBacktestRunManager{
		started: backtestService.Run{
			ID:       "bt_1",
			Status:   backtestService.RunStatusQueued,
			Progress: 0,
		},
	}
	handler := BacktestRunsHandler(manager)

	payload := map[string]any{
		"strategy":  "demo.strat",
		"symbol":    "BTC/USDT",
		"exchange":  "binance",
		"assetType": "spot",
	}
	encoded, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/backtest/runs", bytes.NewReader(encoded))
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d", res.Code)
	}
}

func TestBacktestRunByIDHandler_ReturnsRun(t *testing.T) {
	manager := &fakeBacktestRunManager{
		run: backtestService.Run{
			ID:       "bt_1",
			Status:   backtestService.RunStatusCompleted,
			Progress: 100,
		},
		found: true,
	}
	handler := BacktestRunByIDHandler(manager)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/backtest/runs/bt_1", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
}
