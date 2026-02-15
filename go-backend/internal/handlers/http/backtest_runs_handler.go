package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/contracts"
	backtestService "tradeviewfusion/go-backend/internal/services/backtest"
)

type backtestRunManager interface {
	Start(req backtestService.RunRequest) (backtestService.Run, error)
	Cancel(id string) (backtestService.Run, error)
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
		runID, action, err := parseBacktestRunPath(r.URL.Path)
		if err != nil {
			writeBacktestJSON(w, http.StatusBadRequest, contracts.APIResponse[any]{
				Success: false,
				Error:   err.Error(),
			})
			return
		}

		switch action {
		case "":
			if r.Method != http.MethodGet {
				w.Header().Set("Allow", "GET")
				writeBacktestJSON(w, http.StatusMethodNotAllowed, contracts.APIResponse[any]{
					Success: false,
					Error:   "method not allowed",
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
		case "cancel":
			if r.Method != http.MethodPost {
				w.Header().Set("Allow", "POST")
				writeBacktestJSON(w, http.StatusMethodNotAllowed, contracts.APIResponse[any]{
					Success: false,
					Error:   "method not allowed",
				})
				return
			}

			run, cancelErr := manager.Cancel(runID)
			if cancelErr != nil {
				statusCode := http.StatusBadRequest
				switch {
				case errors.Is(cancelErr, backtestService.ErrRunNotFound):
					statusCode = http.StatusNotFound
				case errors.Is(cancelErr, backtestService.ErrRunNotCancelable):
					statusCode = http.StatusConflict
				}
				writeBacktestJSON(w, statusCode, contracts.APIResponse[any]{
					Success: false,
					Error:   cancelErr.Error(),
				})
				return
			}

			writeBacktestJSON(w, http.StatusAccepted, contracts.APIResponse[backtestService.Run]{
				Success: true,
				Data:    run,
			})
		case "stream":
			if r.Method != http.MethodGet {
				w.Header().Set("Allow", "GET")
				writeBacktestJSON(w, http.StatusMethodNotAllowed, contracts.APIResponse[any]{
					Success: false,
					Error:   "method not allowed",
				})
				return
			}

			serveBacktestRunStream(w, r, manager, runID)
		default:
			writeBacktestJSON(w, http.StatusBadRequest, contracts.APIResponse[any]{
				Success: false,
				Error:   "invalid run path",
			})
		}
	}
}

func parseBacktestRunPath(path string) (runID string, action string, err error) {
	trimmed := strings.TrimPrefix(path, "/api/v1/backtest/runs/")
	trimmed = strings.TrimSpace(trimmed)
	if trimmed == "" {
		return "", "", fmt.Errorf("invalid run id")
	}
	segments := strings.Split(trimmed, "/")
	if len(segments) > 2 {
		return "", "", fmt.Errorf("invalid run path")
	}
	if strings.TrimSpace(segments[0]) == "" {
		return "", "", fmt.Errorf("invalid run id")
	}

	runID = strings.TrimSpace(segments[0])
	if len(segments) == 1 {
		return runID, "", nil
	}
	action = strings.TrimSpace(strings.ToLower(segments[1]))
	if action == "" {
		return "", "", fmt.Errorf("invalid run path")
	}
	return runID, action, nil
}

func serveBacktestRunStream(w http.ResponseWriter, r *http.Request, manager backtestRunManager, runID string) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		writeBacktestJSON(w, http.StatusInternalServerError, contracts.APIResponse[any]{
			Success: false,
			Error:   "streaming unsupported",
		})
		return
	}

	_, exists := manager.Get(runID)
	if !exists {
		_ = writeBacktestSSEEvent(w, "error", map[string]string{"message": "run not found"})
		flusher.Flush()
		return
	}

	_ = writeBacktestSSEEvent(w, "ready", map[string]string{"runId": runID})
	flusher.Flush()

	pollTicker := time.NewTicker(700 * time.Millisecond)
	defer pollTicker.Stop()
	heartbeatTicker := time.NewTicker(15 * time.Second)
	defer heartbeatTicker.Stop()

	var previousPayload []byte

	for {
		select {
		case <-r.Context().Done():
			return
		case <-heartbeatTicker.C:
			_ = writeBacktestSSEEvent(w, "heartbeat", map[string]string{
				"ts": time.Now().UTC().Format(time.RFC3339),
			})
			flusher.Flush()
		case <-pollTicker.C:
			run, ok := manager.Get(runID)
			if !ok {
				_ = writeBacktestSSEEvent(w, "error", map[string]string{"message": "run not found"})
				flusher.Flush()
				return
			}
			payload, err := json.Marshal(run)
			if err != nil {
				continue
			}
			if string(payload) != string(previousPayload) {
				_ = writeBacktestSSEEvent(w, "run", run)
				flusher.Flush()
				previousPayload = payload
			}
			if run.Status == backtestService.RunStatusCompleted ||
				run.Status == backtestService.RunStatusFailed ||
				run.Status == backtestService.RunStatusCanceled {
				_ = writeBacktestSSEEvent(w, "done", run)
				flusher.Flush()
				return
			}
		}
	}
}

func writeBacktestSSEEvent(w http.ResponseWriter, event string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, data)
	return err
}
