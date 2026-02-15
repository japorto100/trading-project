package market

import "strings"

const (
	DefaultFedPolicySeries = "FEDFUNDS"
	DefaultBojPolicySeries = "IRSTCI01JPM156N"
	DefaultSnbPolicySeries = "IR3TIB01CHM156N"
)

func ResolveMacroSeries(exchange, symbol string) string {
	normalizedExchange := strings.ToUpper(strings.TrimSpace(exchange))
	normalizedSymbol := strings.ToUpper(strings.TrimSpace(symbol))
	normalizedSymbol = strings.ReplaceAll(normalizedSymbol, "-", "_")
	normalizedSymbol = strings.ReplaceAll(normalizedSymbol, " ", "_")

	switch normalizedExchange {
	case "FED", "FRED":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return DefaultFedPolicySeries
		}
		return normalizedSymbol
	case "BOJ":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return DefaultBojPolicySeries
		}
		return normalizedSymbol
	case "SNB":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return DefaultSnbPolicySeries
		}
		return normalizedSymbol
	default:
		return normalizedSymbol
	}
}
