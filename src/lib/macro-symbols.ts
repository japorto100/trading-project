/**
 * Macro symbol detection for routing to MacroPanel instead of quote flow.
 * Macro = economic indicators (policy rate, CPI, GDP, IMF IFS, FRED, etc.)
 */

const MACRO_PREFIXES = [
	"IMF_IFS_",
	"FED_",
	"BOJ_",
	"SNB_",
	"BCB_",
	"BANXICO_",
	"BOK_",
	"BCRA_",
	"TCMB_",
	"RBI_",
	"ECB_",
	"FRED_",
] as const;

const MACRO_SYMBOLS = new Set([
	"POLICY_RATE",
	"CPIAUCSL",
	"FEDFUNDS",
	"SF43718", // Banxico policy rate
]);

export function isMacroSymbol(symbol: string): boolean {
	const trimmed = symbol.trim();
	if (!trimmed) return false;
	const upper = trimmed.toUpperCase();

	if (MACRO_SYMBOLS.has(upper)) return true;

	for (const prefix of MACRO_PREFIXES) {
		if (upper.startsWith(prefix)) return true;
	}

	// IMF IFS format: IMF_IFS_M_111_FITB
	if (/^IMF_IFS_[A-Z0-9_]+$/i.test(trimmed)) return true;

	return false;
}
