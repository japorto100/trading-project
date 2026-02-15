export interface GeoSymbolCatalogEntry {
	symbol: string;
	label: string;
	category: string;
	description: string;
	shortCode: string;
}

export const GEO_SYMBOL_CATALOG: GeoSymbolCatalogEntry[] = [
	{
		symbol: "tank",
		label: "Conflict",
		category: "war_armed_conflict",
		description: "War or armed conflict escalation",
		shortCode: "CF",
	},
	{
		symbol: "gavel",
		label: "Sanctions",
		category: "sanctions_export_controls",
		description: "Sanctions, legal action, export controls",
		shortCode: "SC",
	},
	{
		symbol: "ship",
		label: "Shipping",
		category: "shipping_chokepoint_risk",
		description: "Shipping lanes and chokepoint disruptions",
		shortCode: "SH",
	},
	{
		symbol: "oil_drop",
		label: "Energy Shock",
		category: "commodity_shock",
		description: "Oil, gas, and commodity supply risks",
		shortCode: "EN",
	},
	{
		symbol: "microchip",
		label: "Export Controls",
		category: "trade_war_tariff_regime",
		description: "Semiconductor and strategic tech controls",
		shortCode: "XC",
	},
	{
		symbol: "ballot",
		label: "Election Shock",
		category: "regime_change_election_shock",
		description: "Election outcome or regime transition shock",
		shortCode: "EL",
	},
	{
		symbol: "percent",
		label: "Rates",
		category: "monetary_policy_rates",
		description: "Central bank and policy-rate decisions",
		shortCode: "RT",
	},
	{
		symbol: "handshake_broken",
		label: "Trade Rupture",
		category: "trade_war_tariff_regime",
		description: "Trade restrictions and bilateral rupture",
		shortCode: "TR",
	},
	{
		symbol: "briefcase",
		label: "Strategic M&A",
		category: "strategic_mna_takeover",
		description: "Strategic mergers, acquisitions, and takeovers",
		shortCode: "MA",
	},
];

const SYMBOL_SET = new Set(GEO_SYMBOL_CATALOG.map((entry) => entry.symbol));
const CATEGORY_SET = new Set(GEO_SYMBOL_CATALOG.map((entry) => entry.category));

export function isValidGeoSymbol(value: string): boolean {
	return SYMBOL_SET.has(value);
}

export function isValidGeoCategory(value: string): boolean {
	return CATEGORY_SET.has(value);
}

export function getGeoCatalogEntry(symbol: string): GeoSymbolCatalogEntry | undefined {
	return GEO_SYMBOL_CATALOG.find((entry) => entry.symbol === symbol);
}
