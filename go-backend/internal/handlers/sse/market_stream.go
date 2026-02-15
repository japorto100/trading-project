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

var streamAllowedExchanges = map[string]string{
	"binance":  "Binance",
	"kraken":   "Kraken",
	"coinbase": "Coinbase",
	"okx":      "OKX",
	"bybit":    "Bybit",
}

var streamAllowedAssetTypes = map[string]struct{}{
	"spot":    {},
	"margin":  {},
	"futures": {},
}

type streamTickerClient interface {
	GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error)
	OpenTickerStream(ctx context.Context, exchange string, pair gct.Pair, assetType string) (<-chan gct.Ticker, <-chan error, error)
}

type streamParams struct {
	Symbol      string
	Exchange    string
	GCTExchange string
	AssetType   string
	Pair        gct.Pair
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
			quoteTicker *time.Ticker
			pollingTick <-chan time.Time
		)
		defer func() {
			if quoteTicker != nil {
				quoteTicker.Stop()
			}
		}()

		tickerChannel, streamErrorChannel, streamError := client.OpenTickerStream(r.Context(), params.GCTExchange, params.Pair, params.AssetType)
		if streamError != nil {
			quoteTicker = time.NewTicker(2 * time.Second)
			pollingTick = quoteTicker.C
			_ = writeSSEEvent(w, "upstream_error", map[string]string{
				"message": "live stream unavailable, switched to polling",
			})
			flusher.Flush()
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
					Source:    "gct",
				}

				_ = writeSSEEvent(w, "quote", quote)
				flusher.Flush()
			case streamErr, ok := <-streamErrorChannel:
				if !ok {
					streamErrorChannel = nil
					continue
				}
				_ = writeSSEEvent(w, "upstream_error", map[string]string{
					"message": "live stream error: " + streamErr.Error(),
				})
				flusher.Flush()
				if pollingTick == nil {
					quoteTicker = time.NewTicker(2 * time.Second)
					pollingTick = quoteTicker.C
				}
			case <-pollingTick:
				ticker, tickerErr := client.GetTicker(r.Context(), params.GCTExchange, params.Pair, params.AssetType)
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
					Source:    "gct",
				}

				_ = writeSSEEvent(w, "quote", quote)
				flusher.Flush()
			}
		}
	}
}

func resolveStreamParams(r *http.Request) (streamParams, error) {
	symbol := streamValueOrDefault(r.URL.Query().Get("symbol"), "BTC/USDT")
	exchange := strings.ToLower(streamValueOrDefault(r.URL.Query().Get("exchange"), "binance"))
	assetType := strings.ToLower(streamValueOrDefault(r.URL.Query().Get("assetType"), "spot"))

	pair, ok := streamParseSymbol(symbol)
	if !ok {
		return streamParams{}, fmt.Errorf("invalid symbol format, expected BASE/QUOTE")
	}

	gctExchange, ok := streamAllowedExchanges[exchange]
	if !ok {
		return streamParams{}, fmt.Errorf("unsupported exchange")
	}

	if _, ok := streamAllowedAssetTypes[assetType]; !ok {
		return streamParams{}, fmt.Errorf("unsupported assetType")
	}

	return streamParams{
		Symbol:      strings.ToUpper(pair.Base + "/" + pair.Quote),
		Exchange:    exchange,
		GCTExchange: gctExchange,
		AssetType:   assetType,
		Pair:        pair,
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

func writeSSEEvent(w http.ResponseWriter, event string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, data)
	return err
}
