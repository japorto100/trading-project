package market

import "strings"

const (
	DefaultFedPolicySeries  = "FEDFUNDS"
	DefaultBojPolicySeries  = "IRSTCI01JPM156N"
	DefaultSnbPolicySeries  = "IR3TIB01CHM156N"
	DefaultBcbPolicySeries  = "BCB_SGS_432"
	DefaultBokPolicySeries  = "BOK_ECOS_722Y001_M_0101000"
	DefaultBcraPolicySeries = "BCRA_160"
	// TCMB policy alias intentionally deferred until a fixed EVDS3 series ID is standardized for this project.
	// Banxico policy alias intentionally deferred until a fixed series ID is standardized for this project.
	// RBI policy alias intentionally deferred; first DBIE connector slice starts with FX reserve time series.
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
	case "BCB":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return DefaultBcbPolicySeries
		}
		normalizedSymbol = strings.TrimPrefix(normalizedSymbol, "BCDATA.SGS.")
		normalizedSymbol = strings.TrimPrefix(normalizedSymbol, "SGS_")
		if strings.HasPrefix(normalizedSymbol, "BCB_SGS_") {
			return normalizedSymbol
		}
		allDigits := normalizedSymbol != ""
		for _, r := range normalizedSymbol {
			if r < '0' || r > '9' {
				allDigits = false
				break
			}
		}
		if allDigits {
			return "BCB_SGS_" + normalizedSymbol
		}
		return normalizedSymbol
	case "BANXICO":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return normalizedSymbol
		}
		normalizedSymbol = strings.TrimPrefix(normalizedSymbol, "BANXICO_")
		valid := normalizedSymbol != ""
		for _, r := range normalizedSymbol {
			if (r < 'A' || r > 'Z') && (r < '0' || r > '9') {
				valid = false
				break
			}
		}
		if valid {
			return "BANXICO_" + normalizedSymbol
		}
		return normalizedSymbol
	case "BOK":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return DefaultBokPolicySeries
		}
		normalizedSymbol = strings.TrimPrefix(normalizedSymbol, "BOK_ECOS_")
		parts := strings.Split(normalizedSymbol, "_")
		if len(parts) == 3 {
			valid := true
			for _, part := range parts {
				if part == "" {
					valid = false
					break
				}
				for _, r := range part {
					if (r < 'A' || r > 'Z') && (r < '0' || r > '9') {
						valid = false
						break
					}
				}
				if !valid {
					break
				}
			}
			if valid {
				return "BOK_ECOS_" + parts[0] + "_" + parts[1] + "_" + parts[2]
			}
		}
		return normalizedSymbol
	case "BCRA":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return DefaultBcraPolicySeries
		}
		normalizedSymbol = strings.TrimPrefix(normalizedSymbol, "BCRA_")
		allDigits := normalizedSymbol != ""
		for _, r := range normalizedSymbol {
			if r < '0' || r > '9' {
				allDigits = false
				break
			}
		}
		if allDigits {
			return "BCRA_" + normalizedSymbol
		}
		return normalizedSymbol
	case "TCMB":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return normalizedSymbol
		}
		normalizedSymbol = strings.TrimPrefix(normalizedSymbol, "TCMB_EVDS_")
		normalizedSymbol = strings.ReplaceAll(normalizedSymbol, ".", "_")
		valid := normalizedSymbol != ""
		for _, r := range normalizedSymbol {
			if (r < 'A' || r > 'Z') && (r < '0' || r > '9') && r != '_' {
				valid = false
				break
			}
		}
		if valid {
			return "TCMB_EVDS_" + normalizedSymbol
		}
		return normalizedSymbol
	case "RBI":
		if normalizedSymbol == "" || normalizedSymbol == "POLICY_RATE" || normalizedSymbol == "DEFAULT" {
			return normalizedSymbol
		}
		normalizedSymbol = strings.TrimPrefix(normalizedSymbol, "RBI_DBIE_")
		normalizedSymbol = strings.TrimPrefix(normalizedSymbol, "FXRES_")
		parts := strings.Split(normalizedSymbol, "_")
		if len(parts) < 3 {
			return normalizedSymbol
		}
		reserveCode := parts[0]
		currencyCode := parts[1]
		frequency := strings.Join(parts[2:], "_")
		if !isMacroAlphaNum(reserveCode) || !isMacroAlphaNum(currencyCode) || !isMacroAlphaNum(frequency) {
			return normalizedSymbol
		}
		switch frequency {
		case "W", "WK", "WEEK", "WEEKLY":
			frequency = "WEEKLY"
		case "M", "MON", "MONTH", "MONTHLY":
			frequency = "MONTHLY"
		case "D", "DAY", "DAILY":
			frequency = "DAILY"
		}
		return "RBI_DBIE_FXRES_" + reserveCode + "_" + currencyCode + "_" + frequency
	default:
		return normalizedSymbol
	}
}

func isMacroAlphaNum(value string) bool {
	if value == "" {
		return false
	}
	for _, r := range value {
		if (r < 'A' || r > 'Z') && (r < '0' || r > '9') {
			return false
		}
	}
	return true
}
