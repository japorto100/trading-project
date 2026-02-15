package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"
	backtestService "tradeviewfusion/go-backend/internal/services/backtest"
)

type backtestRunManager interface {
	Start(req backtestService.RunRequest) (backtestService.Run, error)
	Get(id string) (backtestService.Run, bool)
	List(limit int) []backtestService.Run
}

func BacktestRunsHandler(manager backtestRunManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if manager == nil {
			writeBacktestJSON(w, http.StatusBadGateway, contracts.APIResponse[any]{
				Success: false,
				Error:   "backtest manager unavailable",
			})
			return
		}

		switch r.Method {
		case http.MethodGet:
			limit := 25
			if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
				parsed, err := strconv.Atoi(rawLimit)
				if err != nil || parsed < 1 || parsed > 200 {
					writeBacktestJSON(w, http.StatusBadRequest, contracts.APIResponse[any]{
						Success: false,
						Error:   "invalid limit",
					})
					return
				}
				limit = parsed
			}
			runs := manager.List(limit)
			writeBacktestJSON(w, http.StatusOK, contracts.APIResponse[[]backtestService.Run]{
				Success: true,
				Data:    runs,
			})
		case http.MethodPost:
			var req backtestService.RunRequest
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				writeBacktestJSON(w, http.StatusBadRequest, contracts.APIResponse[any]{
					Success: false,
					Error:   "invalid json body",
				})
				return
			}
			run, err := manager.Start(req)
			if err != nil {
				writeBacktestJSON(w, http.StatusBadRequest, contracts.APIResponse[any]{
					Success: false,
					Error:   err.Error(),
				})
				return
			}
			writeBacktestJSON(w, http.StatusAccepted, contracts.APIResponse[backtestService.Run]{
				Success: true,
				Data:    run,
			})
		default:
			w.Header().Set("Allow", "GET, POST")
			writeBacktestJSON(w, http.StatusMethodNotAllowed, contracts.APIResponse[any]{
				Success: false,
				Error:   "method not allowed",
			})
		}
	}
}

func BacktestRunByIDHandler(manager backtestRunManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if manager == nil {
			writeBacktestJSON(w, http.StatusBadGateway, contracts.APIResponse[any]{
				Success: false,
				Error:   "backtest manager unavailable",
			})
			return
		}
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", "GET")
			writeBacktestJSON(w, http.StatusMethodNotAllowed, contracts.APIResponse[any]{
				Success: false,
				Error:   "method not allowed",
			})
			return
		}

		runID := strings.TrimPrefix(r.URL.Path, "/api/v1/backtest/runs/")
		runID = strings.TrimSpace(runID)
		if runID == "" || strings.Contains(runID, "/") {
			writeBacktestJSON(w, http.StatusBadRequest, contracts.APIResponse[any]{
				Success: false,
				Error:   "invalid run id",
			})
			return
		}

		run, ok := manager.Get(runID)
		if !ok {
			writeBacktestJSON(w, http.StatusNotFound, contracts.APIResponse[any]{
				Success: false,
				Error:   "run not found",
			})
			return
		}

		writeBacktestJSON(w, http.StatusOK, contracts.APIResponse[backtestService.Run]{
			Success: true,
			Data:    run,
		})
	}
}
