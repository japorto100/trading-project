package http

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	backtestService "tradeviewfusion/go-backend/internal/services/backtest"
)

type fakeBacktestRunManager struct {
	started   backtestService.Run
	startErr  error
	cancelled backtestService.Run
	cancelErr error
	run       backtestService.Run
	found     bool
	list      []backtestService.Run
}

func (f *fakeBacktestRunManager) Start(_ backtestService.RunRequest) (backtestService.Run, error) {
	if f.startErr != nil {
		return backtestService.Run{}, f.startErr
	}
	return f.started, nil
}

func (f *fakeBacktestRunManager) Cancel(_ string) (backtestService.Run, error) {
	if f.cancelErr != nil {
		return backtestService.Run{}, f.cancelErr
	}
	return f.cancelled, nil
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

func TestBacktestRunByIDHandler_CancelsRun(t *testing.T) {
	manager := &fakeBacktestRunManager{
		cancelled: backtestService.Run{
			ID:       "bt_1",
			Status:   backtestService.RunStatusCancelRequested,
			Progress: 95,
		},
	}
	handler := BacktestRunByIDHandler(manager)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/backtest/runs/bt_1/cancel", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d", res.Code)
	}
}

func TestBacktestRunByIDHandler_CancelReturnsConflict(t *testing.T) {
	manager := &fakeBacktestRunManager{
		cancelErr: backtestService.ErrRunNotCancelable,
	}
	handler := BacktestRunByIDHandler(manager)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/backtest/runs/bt_1/cancel", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d", res.Code)
	}
}

func TestBacktestRunByIDHandler_CancelReturnsNotFound(t *testing.T) {
	manager := &fakeBacktestRunManager{
		cancelErr: backtestService.ErrRunNotFound,
	}
	handler := BacktestRunByIDHandler(manager)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/backtest/runs/bt_404/cancel", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", res.Code)
	}
}

func TestBacktestRunByIDHandler_StreamSendsRunAndDone(t *testing.T) {
	manager := &fakeBacktestRunManager{
		run: backtestService.Run{
			ID:       "bt_1",
			Status:   backtestService.RunStatusCompleted,
			Progress: 100,
		},
		found: true,
	}
	handler := BacktestRunByIDHandler(manager)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/backtest/runs/bt_1/stream", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	body := res.Body.String()
	if !strings.Contains(body, "event: ready") {
		t.Fatalf("expected ready event, body=%s", body)
	}
	if !strings.Contains(body, "event: done") {
		t.Fatalf("expected done event, body=%s", body)
	}
}

func TestParseBacktestRunPath(t *testing.T) {
	runID, action, err := parseBacktestRunPath("/api/v1/backtest/runs/bt_1/cancel")
	if err != nil {
		t.Fatalf("parse path: %v", err)
	}
	if runID != "bt_1" || action != "cancel" {
		t.Fatalf("unexpected parse result: runID=%s action=%s", runID, action)
	}

	_, _, err = parseBacktestRunPath("/api/v1/backtest/runs/bt_1/stream/extra")
	if err == nil {
		t.Fatal("expected error for invalid run path")
	}
}

func TestBacktestRunByIDHandler_CancelUnexpectedError(t *testing.T) {
	manager := &fakeBacktestRunManager{
		cancelErr: errors.New("unexpected"),
	}
	handler := BacktestRunByIDHandler(manager)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/backtest/runs/bt_1/cancel", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", res.Code)
	}
}
