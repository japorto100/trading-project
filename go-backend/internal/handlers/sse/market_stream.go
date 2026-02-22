package sse

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/contracts"
)

var streamSymbolPartPattern = regexp.MustCompile(`^[A-Z0-9]{2,20}$`)

type streamExchangeConfig struct {
	upstream          string
	source            string
	allowedAssetTypes map[string]struct{}
	defaultQuote      string
	symbolFormat      string
}

var streamAllowedExchanges = map[string]streamExchangeConfig{
	"binance": {
		upstream: "Binance",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
		defaultQuote: "USDT",
		symbolFormat: "pair",
	},
	"kraken": {
		upstream: "Kraken",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
		defaultQuote: "USD",
		symbolFormat: "pair",
	},
	"coinbase": {
		upstream: "Coinbase",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
		defaultQuote: "USD",
		symbolFormat: "pair",
	},
	"okx": {
		upstream: "OKX",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
		defaultQuote: "USDT",
		symbolFormat: "pair",
	},
	"bybit": {
		upstream: "Bybit",
		source:   "gct",
		allowedAssetTypes: map[string]struct{}{
			"spot":    {},
			"margin":  {},
			"futures": {},
		},
		defaultQuote: "USDT",
		symbolFormat: "pair",
	},
	"finnhub": {
		upstream: "FINNHUB",
		source:   "finnhub",
		allowedAssetTypes: map[string]struct{}{
			"equity": {},
		},
		defaultQuote: "USD",
		symbolFormat: "instrument_or_pair",
	},
}

type streamTickerClient interface {
	GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error)
	OpenTickerStream(ctx context.Context, exchange string, pair gct.Pair, assetType string) (<-chan gct.Ticker, <-chan error, error)
}

type streamParams struct {
	Symbol           string
	Exchange         string
	UpstreamExchange string
	AssetType        string
	Pair             gct.Pair
	Source           string
}

func MarketStreamHandler(client streamTickerClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params, err := resolveStreamParams(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "streaming unsupported", http.StatusInternalServerError)
			return
		}

		heartbeatTicker := time.NewTicker(15 * time.Second)
		defer heartbeatTicker.Stop()

		var (
			quoteTicker     *time.Ticker
			reconnectTicker *time.Ticker
			pollingTick     <-chan time.Time
			reconnectTick   <-chan time.Time
		)
		defer func() {
			if quoteTicker != nil {
				quoteTicker.Stop()
			}
			if reconnectTicker != nil {
				reconnectTicker.Stop()
			}
		}()

		reconnectAttempts := 0
		lastQuoteAt := ""

		emitStreamStatus := func(state string, message string) {
			_ = writeSSEEvent(w, "stream_status", map[string]any{
				"state":             state,
				"message":           message,
				"reconnectAttempts": reconnectAttempts,
				"lastQuoteAt":       lastQuoteAt,
			})
			flusher.Flush()
		}

		enablePolling := func(message string) {
			if quoteTicker == nil {
				quoteTicker = time.NewTicker(2 * time.Second)
				pollingTick = quoteTicker.C
			}
			if reconnectTicker == nil {
				reconnectTicker = time.NewTicker(10 * time.Second)
				reconnectTick = reconnectTicker.C
			}
			_ = writeSSEEvent(w, "upstream_error", map[string]string{
				"message": message,
			})
			flusher.Flush()
			emitStreamStatus("polling_fallback", message)
		}

		disablePolling := func() {
			if quoteTicker != nil {
				quoteTicker.Stop()
				quoteTicker = nil
				pollingTick = nil
			}
		}

		disableReconnect := func() {
			if reconnectTicker != nil {
				reconnectTicker.Stop()
				reconnectTicker = nil
				reconnectTick = nil
			}
		}

		tickerChannel, streamErrorChannel, streamError := client.OpenTickerStream(
			r.Context(),
			params.UpstreamExchange,
			params.Pair,
			params.AssetType,
		)
		if streamError != nil {
			enablePolling("live stream unavailable, switched to polling")
		} else {
			emitStreamStatus("live", "live stream connected")
		}
		_ = writeSSEEvent(w, "ready", map[string]string{
			"symbol":    params.Symbol,
			"exchange":  params.Exchange,
			"assetType": params.AssetType,
		})
		flusher.Flush()

		for {
			select {
			case <-r.Context().Done():
				return
			case <-heartbeatTicker.C:
				_ = writeSSEEvent(w, "heartbeat", map[string]string{
					"ts": time.Now().UTC().Format(time.RFC3339),
				})
				flusher.Flush()
			case tickerValue, ok := <-tickerChannel:
				if !ok {
					tickerChannel = nil
					streamErrorChannel = nil
					if pollingTick == nil {
						quoteTicker = time.NewTicker(2 * time.Second)
						pollingTick = quoteTicker.C
						_ = writeSSEEvent(w, "upstream_error", map[string]string{
							"message": "live stream closed, switched to polling",
						})
						flusher.Flush()
					}
					continue
				}

				timestamp := tickerValue.LastUpdated
				if timestamp == 0 {
					timestamp = time.Now().Unix()
				}

				quote := contracts.Quote{
					Symbol:    params.Symbol,
					Exchange:  params.Exchange,
					AssetType: params.AssetType,
					Last:      tickerValue.Last,
					Bid:       tickerValue.Bid,
					Ask:       tickerValue.Ask,
					High:      tickerValue.High,
					Low:       tickerValue.Low,
					Volume:    tickerValue.Volume,
					Timestamp: timestamp,
					Source:    params.Source,
				}
				lastQuoteAt = time.Unix(timestamp, 0).UTC().Format(time.RFC3339)

				_ = writeSSEEvent(w, "quote", quote)
				flusher.Flush()
			case streamErr, ok := <-streamErrorChannel:
				if !ok {
					streamErrorChannel = nil
					continue
				}
				enablePolling("live stream error: " + streamErr.Error())
			case <-pollingTick:
				ticker, tickerErr := client.GetTicker(r.Context(), params.UpstreamExchange, params.Pair, params.AssetType)
				if tickerErr != nil {
					_ = writeSSEEvent(w, "upstream_error", map[string]string{
						"message": "upstream quote unavailable",
					})
					flusher.Flush()
					continue
				}

				timestamp := ticker.LastUpdated
				if timestamp == 0 {
					timestamp = time.Now().Unix()
				}

				quote := contracts.Quote{
					Symbol:    params.Symbol,
					Exchange:  params.Exchange,
					AssetType: params.AssetType,
					Last:      ticker.Last,
					Bid:       ticker.Bid,
					Ask:       ticker.Ask,
					High:      ticker.High,
					Low:       ticker.Low,
					Volume:    ticker.Volume,
					Timestamp: timestamp,
					Source:    params.Source,
				}
				lastQuoteAt = time.Unix(timestamp, 0).UTC().Format(time.RFC3339)

				_ = writeSSEEvent(w, "quote", quote)
				flusher.Flush()
			case <-reconnectTick:
				reconnectAttempts++
				emitStreamStatus("reconnecting", "attempting live stream reconnect")
				nextTickerChannel, nextStreamErrorChannel, reconnectErr := client.OpenTickerStream(
					r.Context(),
					params.UpstreamExchange,
					params.Pair,
					params.AssetType,
				)
				if reconnectErr != nil {
					_ = writeSSEEvent(w, "upstream_error", map[string]string{
						"message": "live stream reconnect failed",
					})
					flusher.Flush()
					continue
				}

				tickerChannel = nextTickerChannel
				streamErrorChannel = nextStreamErrorChannel
				disablePolling()
				disableReconnect()
				emitStreamStatus("live", "live stream reconnected")
			}
		}
	}
}

func resolveStreamParams(r *http.Request) (streamParams, error) {
	symbol := streamValueOrDefault(r.URL.Query().Get("symbol"), "BTC/USDT")
	exchange := strings.ToLower(streamValueOrDefault(r.URL.Query().Get("exchange"), "binance"))
	assetType := strings.ToLower(streamValueOrDefault(r.URL.Query().Get("assetType"), "spot"))

	exchangeConfig, ok := streamAllowedExchanges[exchange]
	if !ok {
		return streamParams{}, fmt.Errorf("unsupported exchange")
	}
	pair, normalizedSymbol, ok := resolveStreamSymbol(symbol, exchangeConfig)
	if !ok {
		return streamParams{}, fmt.Errorf("invalid symbol format, expected BASE/QUOTE")
	}
	if _, ok := exchangeConfig.allowedAssetTypes[assetType]; !ok {
		return streamParams{}, fmt.Errorf("unsupported assetType")
	}

	return streamParams{
		Symbol:           normalizedSymbol,
		Exchange:         exchange,
		UpstreamExchange: exchangeConfig.upstream,
		AssetType:        assetType,
		Pair:             pair,
		Source:           exchangeConfig.source,
	}, nil
}

func streamValueOrDefault(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func streamParseSymbol(symbol string) (gct.Pair, bool) {
	normalized := strings.TrimSpace(strings.ToUpper(symbol))
	normalized = strings.ReplaceAll(normalized, "-", "/")
	normalized = strings.ReplaceAll(normalized, "_", "/")

	parts := strings.Split(normalized, "/")
	if len(parts) != 2 {
		return gct.Pair{}, false
	}
	if !streamSymbolPartPattern.MatchString(parts[0]) || !streamSymbolPartPattern.MatchString(parts[1]) {
		return gct.Pair{}, false
	}

	return gct.Pair{
		Base:  parts[0],
		Quote: parts[1],
	}, true
}

func streamParseInstrumentSymbol(symbol string) (string, bool) {
	normalized := strings.TrimSpace(strings.ToUpper(symbol))
	normalized = strings.ReplaceAll(normalized, "-", "")
	normalized = strings.ReplaceAll(normalized, "_", "")

	if !streamSymbolPartPattern.MatchString(normalized) {
		return "", false
	}
	return normalized, true
}

func resolveStreamSymbol(symbol string, config streamExchangeConfig) (gct.Pair, string, bool) {
	switch config.symbolFormat {
	case "instrument_or_pair":
		if pair, ok := streamParseSymbol(symbol); ok {
			return pair, strings.ToUpper(pair.Base + "/" + pair.Quote), true
		}
		instrument, ok := streamParseInstrumentSymbol(symbol)
		if !ok {
			return gct.Pair{}, "", false
		}
		quote := config.defaultQuote
		if quote == "" {
			quote = "USD"
		}
		return gct.Pair{Base: instrument, Quote: strings.ToUpper(quote)}, instrument, true
	default:
		pair, ok := streamParseSymbol(symbol)
		if !ok {
			return gct.Pair{}, "", false
		}
		return pair, strings.ToUpper(pair.Base + "/" + pair.Quote), true
	}
}

func writeSSEEvent(w http.ResponseWriter, event string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, data)
	return err
}
