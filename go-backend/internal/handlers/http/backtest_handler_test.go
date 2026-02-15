package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestBacktestCapabilitiesHandler_ReturnsSortedExamples(t *testing.T) {
	dir := t.TempDir()
	files := []string{"b.strat", "a.strat", "README.md"}
	for _, file := range files {
		if err := os.WriteFile(filepath.Join(dir, file), []byte("x"), 0o644); err != nil {
			t.Fatalf("write test file: %v", err)
		}
	}

	handler := BacktestCapabilitiesHandler(dir)
	request := httptest.NewRequest(http.MethodGet, "/api/v1/backtest/capabilities", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", response.Code)
	}

	var body struct {
		Success bool `json:"success"`
		Data    struct {
			Engine           string   `json:"engine"`
			StrategyExamples []string `json:"strategyExamples"`
		} `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success {
		t.Fatal("expected success response")
	}
	if body.Data.Engine != "gocryptotrader" {
		t.Fatalf("expected gocryptotrader engine, got %s", body.Data.Engine)
	}
	if len(body.Data.StrategyExamples) != 2 {
		t.Fatalf("expected 2 strategy examples, got %d", len(body.Data.StrategyExamples))
	}
	if body.Data.StrategyExamples[0] != "a.strat" || body.Data.StrategyExamples[1] != "b.strat" {
		t.Fatalf("unexpected strategy ordering: %v", body.Data.StrategyExamples)
	}
}

func TestBacktestCapabilitiesHandler_Returns502WhenDirectoryMissing(t *testing.T) {
	handler := BacktestCapabilitiesHandler(filepath.Join(t.TempDir(), "missing"))
	request := httptest.NewRequest(http.MethodGet, "/api/v1/backtest/capabilities", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusBadGateway {
		t.Fatalf("expected status 502, got %d", response.Code)
	}
}
