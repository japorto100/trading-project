package messaging

import "fmt"

const (
	// GeoEventNewSubject is the NATS subject for newly confirmed geopolitical events.
	GeoEventNewSubject = "geo.event.new"
)

// TickSubject returns the NATS subject for a market tick.
// Format: market.{SYMBOL}.tick  e.g. "market.BTC-USDT.tick"
func TickSubject(symbol string) string {
	return fmt.Sprintf("market.%s.tick", normalizeSubjectSymbol(symbol))
}

// CandleSubject returns the NATS subject for a candle update.
// Format: market.{SYMBOL}.ohlcv.{TIMEFRAME}  e.g. "market.BTC-USDT.ohlcv.1m"
func CandleSubject(symbol, timeframe string) string {
	return fmt.Sprintf("market.%s.ohlcv.%s", normalizeSubjectSymbol(symbol), timeframe)
}

// normalizeSubjectSymbol replaces "/" with "-" so subjects stay NATS-compatible.
// NATS subjects use "." as separator; "/" is not allowed.
func normalizeSubjectSymbol(symbol string) string {
	out := make([]byte, len(symbol))
	for i := range len(symbol) {
		if symbol[i] == '/' {
			out[i] = '-'
		} else {
			out[i] = symbol[i]
		}
	}
	return string(out)
}
