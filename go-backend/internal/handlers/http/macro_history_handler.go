package http

import (
	"context"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/gct"
	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

var macroSymbolPartPattern = regexp.MustCompile(`^[A-Z0-9]{2,20}$`)
var macroSeriesPattern = regexp.MustCompile(`^[A-Z0-9_]{2,40}$`)

type macroHistoryClient interface {
	History(ctx context.Context, exchange string, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error)
}

func MacroHistoryHandler(client macroHistoryClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		symbol := strings.TrimSpace(r.URL.Query().Get("symbol"))
		exchange := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("exchange")))
		assetType := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("assetType")))
		if symbol == "" || exchange == "" || assetType == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "symbol, exchange, assetType required"})
			return
		}

		limit := 30
		if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
			parsedLimit, err := strconv.Atoi(rawLimit)
			if err != nil || parsedLimit < 1 || parsedLimit > 500 {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid limit"})
				return
			}
			limit = parsedLimit
		}

		pair, normalizedSymbol, ok := parseMacroSymbol(symbol, exchange)
		if !ok {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid symbol format"})
			return
		}
		if (exchange == "fred" || exchange == "fed" || exchange == "boj" || exchange == "snb" || exchange == "bcb" || exchange == "banxico" || exchange == "bok" || exchange == "bcra" || exchange == "tcmb" || exchange == "rbi") && assetType != "macro" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "unsupported assetType"})
			return
		}
		if exchange == "ecb" && assetType != "forex" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "unsupported assetType"})
			return
		}

		points, err := client.History(r.Context(), strings.ToUpper(exchange), pair, assetType, limit)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "macro history request failed"})
			return
		}

		response := struct {
			Success bool `json:"success"`
			Data    struct {
				Symbol    string            `json:"symbol"`
				Exchange  string            `json:"exchange"`
				AssetType string            `json:"assetType"`
				Points    []gct.SeriesPoint `json:"points"`
			} `json:"data"`
		}{
			Success: true,
		}
		response.Data.Symbol = normalizedSymbol
		response.Data.Exchange = exchange
		response.Data.AssetType = assetType
		response.Data.Points = points

		writeJSON(w, http.StatusOK, response)
	}
}

func parseMacroSymbol(symbol, exchange string) (gct.Pair, string, bool) {
	normalized := strings.TrimSpace(strings.ToUpper(symbol))
	normalized = strings.ReplaceAll(normalized, "-", "/")

	if exchange == "fred" || exchange == "fed" || exchange == "boj" || exchange == "snb" || exchange == "bcb" || exchange == "banxico" || exchange == "bok" || exchange == "bcra" || exchange == "tcmb" || exchange == "rbi" {
		trimmed := strings.ReplaceAll(normalized, "/", "")
		trimmed = strings.ReplaceAll(trimmed, "-", "_")
		trimmed = strings.ReplaceAll(trimmed, ".", "_")
		trimmed = strings.ReplaceAll(trimmed, " ", "_")
		if !macroSeriesPattern.MatchString(trimmed) {
			return gct.Pair{}, "", false
		}
		seriesID := marketServices.ResolveMacroSeries(strings.ToUpper(exchange), trimmed)
		if seriesID == "" {
			return gct.Pair{}, "", false
		}
		return gct.Pair{Base: seriesID, Quote: "USD"}, seriesID, true
	}

	parts := strings.Split(normalized, "/")
	if len(parts) != 2 {
		return gct.Pair{}, "", false
	}
	if !macroSymbolPartPattern.MatchString(parts[0]) || !macroSymbolPartPattern.MatchString(parts[1]) {
		return gct.Pair{}, "", false
	}
	return gct.Pair{Base: parts[0], Quote: parts[1]}, parts[0] + "/" + parts[1], true
}
