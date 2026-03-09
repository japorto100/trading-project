package http

import (
	"context"
	"net/http"
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"
	"tradeviewfusion/go-backend/internal/handlers/marketparams"
)

type orderbookClient interface {
	GetOrderbook(ctx context.Context, target contracts.MarketTarget) (contracts.OrderbookSnapshot, error)
}

func OrderbookHandler(client orderbookClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, contracts.APIResponse[*contracts.OrderbookSnapshot]{
				Success: false,
				Error:   "orderbook client unavailable",
			})
			return
		}

		symbol := valueOrDefault(r.URL.Query().Get("symbol"), "BTC/USDT")
		exchange := strings.ToLower(valueOrDefault(r.URL.Query().Get("exchange"), "binance"))
		assetType := strings.ToLower(valueOrDefault(r.URL.Query().Get("assetType"), "spot"))

		resolved, err := marketparams.ResolveTarget(symbol, exchange, assetType, marketparams.DefaultExchangeConfigs, marketparams.ResolveOptions{})
		if err != nil {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.OrderbookSnapshot]{
				Success: false,
				Error:   err.Error(),
			})
			return
		}

		snapshot, err := client.GetOrderbook(r.Context(), resolved.Target)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, contracts.APIResponse[*contracts.OrderbookSnapshot]{
				Success: false,
				Error:   "gct orderbook request failed",
			})
			return
		}

		writeJSON(w, http.StatusOK, contracts.APIResponse[*contracts.OrderbookSnapshot]{
			Success: true,
			Data:    &snapshot,
		})
	}
}
