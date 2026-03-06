// Package protocol defines the canonical wire types shared across Go services.
// No imports from internal/ — safe to use anywhere in pkg/ and as a proto-adjacent layer.
package protocol

// Tick represents a single real-time price update from any exchange feed.
type Tick struct {
	Symbol    string  `json:"symbol"`
	Exchange  string  `json:"exchange"`
	AssetType string  `json:"assetType"`
	Last      float64 `json:"last"`
	Bid       float64 `json:"bid"`
	Ask       float64 `json:"ask"`
	Volume    float64 `json:"volume"`
	Timestamp int64   `json:"timestamp"` // Unix seconds
}

// OHLCV represents a completed or in-progress candlestick bar.
type OHLCV struct {
	Symbol    string  `json:"symbol"`
	Exchange  string  `json:"exchange"`
	Timeframe string  `json:"timeframe"`
	Open      float64 `json:"open"`
	High      float64 `json:"high"`
	Low       float64 `json:"low"`
	Close     float64 `json:"close"`
	Volume    float64 `json:"volume"`
	OpenTime  int64   `json:"openTime"`  // Unix seconds
	CloseTime int64   `json:"closeTime"` // Unix seconds
}
