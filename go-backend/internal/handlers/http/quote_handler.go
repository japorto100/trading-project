package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/contracts"
)

var symbolPartPattern = regexp.MustCompile(`^[A-Z0-9]{2,20}$`)

type exchangeConfig struct {
	upstream          string
	source            string
	allowedAssetTypes map[string]struct{}
}

var allowedExchanges = map[string]exchangeConfig{
	"binance": {
		upstream: "Binance",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
	},
	"kraken": {
		upstream: "Kraken",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
	},
	"coinbase": {
		upstream: "Coinbase",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
	},
	"okx": {
		upstream: "OKX",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
	},
	"bybit": {
		upstream: "Bybit",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
	},
	"ecb": {
		upstream: "ECB",
		source:   "ecb",
		allowedAssetTypes: map[string]struct{}{
			"forex": {},
		},
	},
}

type quoteClient interface {
	GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error)
}

func QuoteHandler(client quoteClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		symbol := valueOrDefault(r.URL.Query().Get("symbol"), "BTC/USDT")
		exchange := strings.ToLower(valueOrDefault(r.URL.Query().Get("exchange"), "binance"))
		assetType := strings.ToLower(valueOrDefault(r.URL.Query().Get("assetType"), "spot"))

		pair, ok := parseSymbol(symbol)
		if !ok {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.Quote]{
				Success: false,
				Error:   "invalid symbol format, expected BASE/QUOTE",
			})
			return
		}
		exchangeCfg, ok := allowedExchanges[exchange]
		if !ok {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.Quote]{
				Success: false,
				Error:   "unsupported exchange",
			})
			return
		}
		if !isAllowed(exchangeCfg.allowedAssetTypes, assetType) {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.Quote]{
				Success: false,
				Error:   "unsupported assetType",
			})
			return
		}

		ticker, err := client.GetTicker(r.Context(), exchangeCfg.upstream, pair, assetType)
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
			Symbol:    strings.ToUpper(pair.Base + "/" + pair.Quote),
			Exchange:  exchange,
			AssetType: assetType,
			Last:      ticker.Last,
			Bid:       ticker.Bid,
			Ask:       ticker.Ask,
			High:      ticker.High,
			Low:       ticker.Low,
			Volume:    ticker.Volume,
			Timestamp: timestamp,
			Source:    exchangeCfg.source,
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

func parseSymbol(symbol string) (gct.Pair, bool) {
	normalized := strings.TrimSpace(strings.ToUpper(symbol))
	normalized = strings.ReplaceAll(normalized, "-", "/")
	normalized = strings.ReplaceAll(normalized, "_", "/")

	parts := strings.Split(normalized, "/")
	if len(parts) != 2 {
		return gct.Pair{}, false
	}
	if !symbolPartPattern.MatchString(parts[0]) || !symbolPartPattern.MatchString(parts[1]) {
		return gct.Pair{}, false
	}

	return gct.Pair{
		Base:  parts[0],
		Quote: parts[1],
	}, true
}

func isAllowed(allowed map[string]struct{}, value string) bool {
	_, ok := allowed[value]
	return ok
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
