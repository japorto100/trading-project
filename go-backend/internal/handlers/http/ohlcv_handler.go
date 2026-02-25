package http

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	financebridge "tradeviewfusion/go-backend/internal/connectors/financebridge"
)

type ohlcvClient interface {
	GetOHLCV(ctx context.Context, req financebridge.OHLCVRequest) ([]financebridge.Candle, error)
}

func OHLCVHandler(client ohlcvClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "ohlcv client unavailable"})
			return
		}

		symbol := strings.TrimSpace(r.URL.Query().Get("symbol"))
		if symbol == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "symbol parameter is required"})
			return
		}

		timeframe := strings.TrimSpace(r.URL.Query().Get("timeframe"))
		if timeframe == "" {
			timeframe = "1H"
		}

		limit := 300
		if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
			parsed, err := strconv.Atoi(rawLimit)
			if err != nil || parsed < 1 || parsed > 200000 {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid limit"})
				return
			}
			limit = parsed
		}

		start, hasStart, startErr := parseOptionalInt64(r.URL.Query().Get("start"))
		if startErr != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid start"})
			return
		}
		end, hasEnd, endErr := parseOptionalInt64(r.URL.Query().Get("end"))
		if endErr != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid end"})
			return
		}
		if hasStart && hasEnd && start >= end {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid time range: start must be less than end"})
			return
		}

		req := financebridge.OHLCVRequest{
			Symbol:    symbol,
			Timeframe: timeframe,
			Limit:     limit,
		}
		if hasStart {
			req.Start = &start
		}
		if hasEnd {
			req.End = &end
		}

		rows, err := client.GetOHLCV(r.Context(), req)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "ohlcv request failed"})
			return
		}

		response := struct {
			Success   bool                   `json:"success"`
			Symbol    string                 `json:"symbol"`
			Timeframe string                 `json:"timeframe"`
			Provider  string                 `json:"provider"`
			Limit     int                    `json:"limit"`
			Start     *int64                 `json:"start"`
			End       *int64                 `json:"end"`
			Count     int                    `json:"count"`
			Data      []financebridge.Candle `json:"data"`
		}{
			Success:   true,
			Symbol:    symbol,
			Timeframe: timeframe,
			Provider:  "finance-bridge",
			Limit:     limit,
			Count:     len(rows),
			Data:      rows,
		}
		if hasStart {
			response.Start = &start
		}
		if hasEnd {
			response.End = &end
		}

		writeJSON(w, http.StatusOK, response)
	}
}

func parseOptionalInt64(raw string) (int64, bool, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return 0, false, nil
	}
	parsed, err := strconv.ParseInt(trimmed, 10, 64)
	if err != nil {
		return 0, false, err
	}
	return parsed, true, nil
}
