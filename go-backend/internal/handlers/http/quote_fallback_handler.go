package http

import (
	"context"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/yahoo"
	"tradeviewfusion/go-backend/internal/contracts"
)

type fallbackQuoteClient interface {
	GetQuote(ctx context.Context, symbol string) (yahoo.Quote, error)
}

func FinanceBridgeQuoteFallbackHandler(client fallbackQuoteClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, contracts.APIResponse[*contracts.Quote]{
				Success: false,
				Error:   "fallback quote client unavailable",
			})
			return
		}

		symbol := strings.TrimSpace(r.URL.Query().Get("symbol"))
		if symbol == "" {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.Quote]{
				Success: false,
				Error:   "symbol parameter is required",
			})
			return
		}
		assetType := strings.TrimSpace(r.URL.Query().Get("assetType"))
		if assetType == "" {
			assetType = "unknown"
		}

		quote, err := client.GetQuote(r.Context(), symbol)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, contracts.APIResponse[*contracts.Quote]{
				Success: false,
				Error:   "fallback quote request failed",
			})
			return
		}

		timestamp := quote.Timestamp
		if timestamp == 0 {
			timestamp = time.Now().Unix()
		}

		writeJSON(w, http.StatusOK, contracts.APIResponse[*contracts.Quote]{
			Success: true,
			Data: &contracts.Quote{
				Symbol:    strings.TrimSpace(quote.Symbol),
				Exchange:  "yahoo",
				AssetType: assetType,
				Last:      quote.Price,
				Bid:       0,
				Ask:       0,
				High:      quote.High,
				Low:       quote.Low,
				Volume:    quote.Volume,
				Timestamp: timestamp,
				Source:    "yahoo",
			},
		})
	}
}
