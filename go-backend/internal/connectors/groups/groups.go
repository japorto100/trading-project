package groups

import "strings"

const (
	REST        = "rest"
	WS          = "ws"
	SDMX        = "sdmx"
	TimeSeries  = "timeseries"
	Bulk        = "bulk"
	RSS         = "rss"
	Diff        = "diff"
	Translation = "translation"
	Oracle      = "oracle"
	PythonIPC   = "pythonipc"
)

type Policy struct {
	Name               string  `json:"name"`
	MaxConcurrency     int     `json:"maxConcurrency,omitempty"`
	RateLimitPerSecond float64 `json:"rateLimitPerSecond,omitempty"`
	RateLimitBurst     int     `json:"rateLimitBurst,omitempty"`
	RetryProfile       string  `json:"retryProfile,omitempty"`
}

var legacyAliases = map[string]string{
	"g1_rest_api_standard":      REST,
	"g2_websocket_streams":      WS,
	"g3_sdmx":                   SDMX,
	"g4_centralbank_timeseries": TimeSeries,
	"g5_bulk_periodic":          Bulk,
	"g6_rss_atom":               RSS,
	"g7_diff_watchers":          Diff,
	"g8_translation_bridge":     Translation,
	"g9_oracle_cross_check":     Oracle,
	"g10_python_ipc":            PythonIPC,
}

func Normalize(value string) string {
	normalized := strings.ToLower(strings.TrimSpace(value))
	if mapped, ok := legacyAliases[normalized]; ok {
		return mapped
	}
	switch normalized {
	case "", REST, WS, SDMX, TimeSeries, Bulk, RSS, Diff, Translation, Oracle, PythonIPC:
		return normalized
	default:
		return normalized
	}
}

func All() []string {
	return []string{REST, WS, SDMX, TimeSeries, Bulk, RSS, Diff, Translation, Oracle, PythonIPC}
}
