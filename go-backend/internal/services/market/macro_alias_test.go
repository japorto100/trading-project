package market

import "testing"

func TestResolveMacroSeries_DefaultAliases(t *testing.T) {
	tests := []struct {
		exchange string
		symbol   string
		want     string
	}{
		{exchange: "FED", symbol: "POLICY_RATE", want: DefaultFedPolicySeries},
		{exchange: "FRED", symbol: "DEFAULT", want: DefaultFedPolicySeries},
		{exchange: "BOJ", symbol: "POLICY_RATE", want: DefaultBojPolicySeries},
		{exchange: "SNB", symbol: "DEFAULT", want: DefaultSnbPolicySeries},
		{exchange: "BOJ", symbol: "JPNCPI", want: "JPNCPI"},
	}

	for _, tc := range tests {
		got := ResolveMacroSeries(tc.exchange, tc.symbol)
		if got != tc.want {
			t.Fatalf("ResolveMacroSeries(%s,%s) = %s, want %s", tc.exchange, tc.symbol, got, tc.want)
		}
	}
}
