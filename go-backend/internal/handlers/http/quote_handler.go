package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/contracts"
	"tradeviewfusion/go-backend/internal/handlers/marketparams"
)

type quoteClient interface {
	GetTickerTarget(ctx context.Context, target contracts.MarketTarget) (gct.Ticker, error)
}

func QuoteHandler(client quoteClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		symbol := valueOrDefault(r.URL.Query().Get("symbol"), "BTC/USDT")
		exchange := strings.ToLower(valueOrDefault(r.URL.Query().Get("exchange"), "binance"))
		assetType := strings.ToLower(valueOrDefault(r.URL.Query().Get("assetType"), "spot"))

		resolved, err := marketparams.ResolveTarget(symbol, exchange, assetType, marketparams.DefaultExchangeConfigs, marketparams.ResolveOptions{})
		if err != nil {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.Quote]{
				Success: false,
				Error:   err.Error(),
			})
			return
		}
		ticker, err := client.GetTickerTarget(r.Context(), resolved.Target)
		if err != nil {
			status := mapQuoteErrorToHTTP(err)
			writeJSON(w, status, contracts.APIResponse[*contracts.Quote]{
				Success: false,
				Error:   buildQuoteErrorMessage(err),
			})
			return
		}

		timestamp := ticker.LastUpdated
		if timestamp == 0 {
			timestamp = time.Now().Unix()
		}

		quote := contracts.Quote{
			Symbol:    resolved.Symbol,
			Exchange:  exchange,
			AssetType: resolved.AssetType,
			Last:      ticker.Last,
			Bid:       ticker.Bid,
			Ask:       ticker.Ask,
			High:      ticker.High,
			Low:       ticker.Low,
			Volume:    ticker.Volume,
			Timestamp: timestamp,
			Source:    resolved.Source,
		}

		writeJSON(w, http.StatusOK, contracts.APIResponse[*contracts.Quote]{
			Success: true,
			Data:    &quote,
		})
	}
}

func valueOrDefault(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func mapQuoteErrorToHTTP(err error) int {
	if gct.IsTimeout(err) {
		return http.StatusGatewayTimeout
	}

	if status, ok := gct.StatusCode(err); ok {
		switch status {
		case http.StatusBadRequest, http.StatusNotFound:
			return http.StatusBadRequest
		case http.StatusUnauthorized, http.StatusForbidden:
			return http.StatusBadGateway
		case http.StatusRequestTimeout, http.StatusGatewayTimeout:
			return http.StatusGatewayTimeout
		default:
			if status >= http.StatusInternalServerError {
				return http.StatusBadGateway
			}
		}
	}

	return http.StatusBadGateway
}

func buildQuoteErrorMessage(err error) string {
	if gct.IsTimeout(err) {
		return "gct ticker request timed out"
	}

	if status, ok := gct.StatusCode(err); ok {
		if status == http.StatusUnauthorized || status == http.StatusForbidden {
			return "gct authentication failed"
		}
		return "gct ticker request failed with upstream status"
	}

	var requestError *gct.RequestError
	if errors.As(err, &requestError) {
		return "gct ticker request failed"
	}

	return "gct ticker request failed"
}

func writeJSON(w http.ResponseWriter, statusCode int, response any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(response)
}
