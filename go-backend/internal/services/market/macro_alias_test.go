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
		{exchange: "BCB", symbol: "POLICY_RATE", want: DefaultBcbPolicySeries},
		{exchange: "BCB", symbol: "432", want: "BCB_SGS_432"},
		{exchange: "BCB", symbol: "sgs_11", want: "BCB_SGS_11"},
		{exchange: "BANXICO", symbol: "SF43718", want: "BANXICO_SF43718"},
		{exchange: "BANXICO", symbol: "banxico_sf61745", want: "BANXICO_SF61745"},
		{exchange: "BOK", symbol: "POLICY_RATE", want: DefaultBokPolicySeries},
		{exchange: "BOK", symbol: "722Y001_M_0101000", want: "BOK_ECOS_722Y001_M_0101000"},
		{exchange: "BCRA", symbol: "POLICY_RATE", want: DefaultBcraPolicySeries},
		{exchange: "BCRA", symbol: "160", want: "BCRA_160"},
		{exchange: "TCMB", symbol: "TP_AB_TOPLAM", want: "TCMB_EVDS_TP_AB_TOPLAM"},
		{exchange: "TCMB", symbol: "TCMB_EVDS_TP.AB.TOPLAM", want: "TCMB_EVDS_TP_AB_TOPLAM"},
		{exchange: "RBI", symbol: "FXRES_TR_USD_W", want: "RBI_DBIE_FXRES_TR_USD_WEEKLY"},
		{exchange: "RBI", symbol: "RBI_DBIE_FXRES_TR_USD_MONTHLY", want: "RBI_DBIE_FXRES_TR_USD_MONTHLY"},
		{exchange: "BOJ", symbol: "JPNCPI", want: "JPNCPI"},
	}

	for _, tc := range tests {
		got := ResolveMacroSeries(tc.exchange, tc.symbol)
		if got != tc.want {
			t.Fatalf("ResolveMacroSeries(%s,%s) = %s, want %s", tc.exchange, tc.symbol, got, tc.want)
		}
	}
}
