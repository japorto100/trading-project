package sse

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/contracts"
	"tradeviewfusion/go-backend/internal/handlers/marketparams"
	"tradeviewfusion/go-backend/internal/messaging"
	marketstreaming "tradeviewfusion/go-backend/internal/services/market/streaming"
)

var marketStreamSnapshotStore = marketstreaming.NewSnapshotStore()
var marketStreamBuilders sync.Map

type streamTickerClient interface {
	GetTickerTarget(ctx context.Context, target contracts.MarketTarget) (gct.Ticker, error)
	OpenTickerStreamTarget(ctx context.Context, target contracts.MarketTarget) (<-chan gct.Ticker, <-chan error, error)
}

type streamParams struct {
	Symbol           string
	Exchange         string
	UpstreamExchange string
	AssetType        string
	Pair             gct.Pair
	Target           contracts.MarketTarget
	Source           string
	Timeframe        string
	AlertRules       []marketstreaming.AlertRule
}

func MarketStreamHandler(client streamTickerClient, natsPub messaging.Publisher) http.HandlerFunc {
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
		var candleBuilder *marketstreaming.CandleBuilder
		var alertEngine *marketstreaming.AlertEngine
		if params.Timeframe != "" {
			builder, builderErr := getOrCreateStreamCandleBuilder(params)
			if builderErr != nil {
				http.Error(w, "invalid timeframe", http.StatusBadRequest)
				return
			}
			candleBuilder = builder
		}
		if len(params.AlertRules) > 0 {
			alertEngine = marketstreaming.NewAlertEngine()
		}
		snapshotKey := marketstreaming.SnapshotKey{
			Symbol:    params.Symbol,
			Exchange:  params.Exchange,
			AssetType: params.AssetType,
			Timeframe: params.Timeframe,
		}

		emitStreamStatus := func(state string, message string) {
			_ = writeSSEEvent(w, "stream_status", map[string]any{
				"state":              state,
				"message":            message,
				"reconnectAttempts":  reconnectAttempts,
				"lastQuoteAt":        lastQuoteAt,
				"timeframe":          params.Timeframe,
				"reconnectBackoffMs": 10000,
			})
			flusher.Flush()
		}

		emitSnapshot := func() {
			snapshot, ok := marketStreamSnapshotStore.Get(snapshotKey)
			if !ok {
				return
			}
			_ = writeSSEEvent(w, "snapshot", snapshot)
			flusher.Flush()
		}

		emitQuoteAndDerived := func(quote contracts.Quote) {
			lastQuoteAt = time.Unix(quote.Timestamp, 0).UTC().Format(time.RFC3339)
			marketStreamSnapshotStore.UpsertQuote(snapshotKey, quote)
			_ = writeSSEEvent(w, "quote", quote)
			if natsPub != nil {
				if b, err := json.Marshal(quote); err == nil {
					go func() { _ = natsPub.PublishTick(r.Context(), quote.Symbol, b) }()
				}
			}
			if candleBuilder != nil {
				res := candleBuilder.ApplyTick(marketstreaming.Tick{
					Symbol:    quote.Symbol,
					Exchange:  quote.Exchange,
					AssetType: quote.AssetType,
					Source:    quote.Source,
					Timestamp: quote.Timestamp,
					Last:      quote.Last,
					Bid:       quote.Bid,
					Ask:       quote.Ask,
					High:      quote.High,
					Low:       quote.Low,
					Volume:    quote.Volume,
				})
				if res.Changed && !res.Dropped {
					history := candleBuilder.Snapshot(8)
					marketStreamSnapshotStore.UpsertCandle(snapshotKey, res.Candle, history)
					candlePayload := map[string]any{
						"symbol":       params.Symbol,
						"exchange":     params.Exchange,
						"assetType":    params.AssetType,
						"timeframe":    params.Timeframe,
						"candle":       res.Candle,
						"outOfOrder":   res.OutOfOrder,
						"wasNewCandle": res.WasNewCandle,
						"emittedAt":    time.Now().UTC().Format(time.RFC3339Nano),
					}
					_ = writeSSEEvent(w, "candle", candlePayload)
					if natsPub != nil {
						if b, err := json.Marshal(candlePayload); err == nil {
							go func() { _ = natsPub.PublishCandle(r.Context(), params.Symbol, params.Timeframe, b) }()
						}
					}
				}
			}
			if alertEngine != nil {
				alertEvents := alertEngine.EvaluateQuote(
					params.Symbol,
					quote.Last,
					params.AlertRules,
					time.Unix(quote.Timestamp, 0),
				)
				for _, alertEvent := range alertEvents {
					_ = writeSSEEvent(w, "alert", alertEvent)
				}
			}
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

		tickerChannel, streamErrorChannel, streamError := client.OpenTickerStreamTarget(r.Context(), params.Target)
		if streamError != nil {
			enablePolling("live stream unavailable, switched to polling")
		} else {
			emitStreamStatus("live", "live stream connected")
		}
		readyPayload := map[string]string{
			"symbol":    params.Symbol,
			"exchange":  params.Exchange,
			"assetType": params.AssetType,
		}
		if params.Timeframe != "" {
			readyPayload["timeframe"] = params.Timeframe
		}
		_ = writeSSEEvent(w, "ready", readyPayload)
		flusher.Flush()
		emitSnapshot()

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
				emitQuoteAndDerived(quote)
			case streamErr, ok := <-streamErrorChannel:
				if !ok {
					streamErrorChannel = nil
					continue
				}
				enablePolling("live stream error: " + streamErr.Error())
			case <-pollingTick:
				ticker, tickerErr := client.GetTickerTarget(r.Context(), params.Target)
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
				emitQuoteAndDerived(quote)
			case <-reconnectTick:
				reconnectAttempts++
				emitStreamStatus("reconnecting", "attempting live stream reconnect")
				nextTickerChannel, nextStreamErrorChannel, reconnectErr := client.OpenTickerStreamTarget(r.Context(), params.Target)
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
				emitSnapshot()
			}
		}
	}
}

func resolveStreamParams(r *http.Request) (streamParams, error) {
	symbol := streamValueOrDefault(r.URL.Query().Get("symbol"), "BTC/USDT")
	exchange := strings.ToLower(streamValueOrDefault(r.URL.Query().Get("exchange"), "binance"))
	assetType := strings.ToLower(streamValueOrDefault(r.URL.Query().Get("assetType"), "spot"))
	timeframeRaw := strings.TrimSpace(r.URL.Query().Get("timeframe"))

	resolved, err := marketparams.ResolveTarget(symbol, exchange, assetType, marketparams.StreamExchangeConfigs, marketparams.ResolveOptions{
		ResolveAutoExchange: resolveAutoStreamExchange,
	})
	if err != nil {
		return streamParams{}, fmt.Errorf("resolve stream target %s/%s/%s: %w", symbol, exchange, assetType, err)
	}

	params := streamParams{
		Symbol:           resolved.Symbol,
		Exchange:         resolved.Exchange,
		UpstreamExchange: resolved.UpstreamExchange,
		AssetType:        resolved.AssetType,
		Pair:             currency.NewPair(currency.NewCode(resolved.Pair.Base), currency.NewCode(resolved.Pair.Quote)),
		Target:           resolved.Target,
		Source:           resolved.Source,
	}
	if timeframeRaw != "" {
		timeframe, err := marketstreaming.ParseTimeframe(timeframeRaw)
		if err != nil {
			return streamParams{}, fmt.Errorf("unsupported timeframe")
		}
		params.Timeframe = timeframe.Label
	}
	if rawAlertRules := strings.TrimSpace(r.URL.Query().Get("alertRules")); rawAlertRules != "" {
		alertRules, err := parseStreamAlertRules(rawAlertRules)
		if err != nil {
			return streamParams{}, fmt.Errorf("invalid alertRules")
		}
		params.AlertRules = alertRules
	}
	return params, nil
}

func resolveAutoStreamExchange(assetType string) (string, marketparams.ExchangeConfig, error) {
	if assetType == "equity" {
		cfg, ok := marketparams.StreamExchangeConfigs["finnhub"]
		if !ok {
			return "", marketparams.ExchangeConfig{}, fmt.Errorf("auto exchange resolution failed for equity")
		}
		return "finnhub", cfg, nil
	}

	candidate := strings.ToLower(strings.TrimSpace(os.Getenv("GCT_STREAM_AUTO_EXCHANGE")))
	if candidate == "" {
		candidate = strings.ToLower(strings.TrimSpace(os.Getenv("GCT_EXCHANGE")))
	}
	if candidate == "" {
		candidate = "kraken"
	}

	cfg, ok := marketparams.StreamExchangeConfigs[candidate]
	if !ok || candidate == "auto" || candidate == "finnhub" {
		return "", marketparams.ExchangeConfig{}, fmt.Errorf("unsupported auto crypto exchange")
	}
	return candidate, cfg, nil
}

func streamValueOrDefault(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func writeSSEEvent(w http.ResponseWriter, event string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal sse event %s payload: %w", event, err)
	}
	_, err = fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, data)
	if err != nil {
		return fmt.Errorf("write sse event %s: %w", event, err)
	}
	return nil
}

func getOrCreateStreamCandleBuilder(params streamParams) (*marketstreaming.CandleBuilder, error) {
	if strings.TrimSpace(params.Timeframe) == "" {
		return nil, nil
	}
	key := strings.Join([]string{
		strings.ToUpper(strings.TrimSpace(params.Symbol)),
		strings.ToLower(strings.TrimSpace(params.Exchange)),
		strings.ToLower(strings.TrimSpace(params.AssetType)),
		params.Timeframe,
	}, "|")
	if existing, ok := marketStreamBuilders.Load(key); ok {
		builder, ok := existing.(*marketstreaming.CandleBuilder)
		if !ok {
			return nil, fmt.Errorf("stream candle builder type mismatch")
		}
		return builder, nil
	}
	builder, err := marketstreaming.NewCandleBuilder(params.Timeframe, marketstreaming.CandleBuilderOptions{
		MaxCandles:           512,
		MaxOutOfOrderBuckets: 4,
	})
	if err != nil {
		return nil, fmt.Errorf("create candle builder for timeframe %s: %w", params.Timeframe, err)
	}
	actual, loaded := marketStreamBuilders.LoadOrStore(key, builder)
	if loaded {
		typed, ok := actual.(*marketstreaming.CandleBuilder)
		if !ok {
			return nil, fmt.Errorf("stream candle builder type mismatch")
		}
		return typed, nil
	}
	return builder, nil
}

type streamAlertRulePayload struct {
	ID        string  `json:"id"`
	Symbol    string  `json:"symbol"`
	Condition string  `json:"condition"`
	Target    float64 `json:"target"`
	Message   string  `json:"message"`
	Enabled   bool    `json:"enabled"`
}

func parseStreamAlertRules(raw string) ([]marketstreaming.AlertRule, error) {
	var payload []streamAlertRulePayload
	if err := json.Unmarshal([]byte(raw), &payload); err != nil {
		return nil, fmt.Errorf("decode stream alert rules: %w", err)
	}
	if len(payload) == 0 {
		return nil, nil
	}
	out := make([]marketstreaming.AlertRule, 0, len(payload))
	for _, rule := range payload {
		symbol := strings.TrimSpace(strings.ToUpper(rule.Symbol))
		id := strings.TrimSpace(rule.ID)
		if id == "" || symbol == "" {
			continue
		}
		condition := marketstreaming.AlertCondition(strings.TrimSpace(rule.Condition))
		switch condition {
		case marketstreaming.AlertAbove, marketstreaming.AlertBelow, marketstreaming.AlertCrossesUp, marketstreaming.AlertCrossesDown:
		default:
			continue
		}
		out = append(out, marketstreaming.AlertRule{
			ID:        id,
			Symbol:    symbol,
			Condition: condition,
			Target:    rule.Target,
			Message:   strings.TrimSpace(rule.Message),
			Enabled:   rule.Enabled,
		})
	}
	return out, nil
}
