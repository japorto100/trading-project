import {
	symbol as d3Symbol,
	type SymbolType,
	symbolCircle,
	symbolCross,
	symbolDiamond,
	symbolStar,
	symbolTriangle,
	symbolWye,
} from "d3-shape";
import { getGeoCatalogEntry } from "@/lib/geopolitical/catalog";

export interface MarkerSymbolLegendEntry {
	symbol: string;
	label: string;
	shortCode: string;
}

export const MARKER_SYMBOL_LEGEND: MarkerSymbolLegendEntry[] = [
	{ symbol: "tank", label: "Conflict", shortCode: "CF" },
	{ symbol: "gavel", label: "Sanctions", shortCode: "SC" },
	{ symbol: "ship", label: "Shipping", shortCode: "SH" },
	{ symbol: "oil_drop", label: "Energy Shock", shortCode: "EN" },
	{ symbol: "microchip", label: "Export Controls", shortCode: "XC" },
	{ symbol: "ballot", label: "Election Shock", shortCode: "EL" },
	{ symbol: "percent", label: "Rates", shortCode: "RT" },
	{ symbol: "handshake_broken", label: "Trade Rupture", shortCode: "TR" },
	{ symbol: "briefcase", label: "Strategic M&A", shortCode: "MA" },
];

function getSymbolTypeByCatalog(symbol: string): SymbolType {
	switch (symbol) {
		case "tank":
			return symbolCross;
		case "gavel":
		case "microchip":
			return symbolWye;
		case "ship":
		case "ballot":
			return symbolTriangle;
		case "oil_drop":
		case "briefcase":
			return symbolDiamond;
		case "handshake_broken":
			return symbolStar;
		case "percent":
			return symbolCircle;
		default:
			return symbolCircle;
	}
}

export function getMarkerSymbolType(symbol: string): SymbolType {
	const normalized = symbol.trim().toLowerCase();
	if (!normalized) return symbolCircle;

	const entry = getGeoCatalogEntry(normalized);
	if (entry) {
		return getSymbolTypeByCatalog(entry.symbol);
	}

	if (normalized.includes("conflict")) return symbolCross;
	if (normalized.includes("sanction") || normalized.includes("export")) return symbolWye;
	if (normalized.includes("shipping")) return symbolTriangle;
	if (normalized.includes("energy") || normalized.includes("commodity")) return symbolDiamond;
	if (normalized.includes("election")) return symbolTriangle;
	if (normalized.includes("rates") || normalized.includes("policy")) return symbolCircle;
	if (normalized.includes("trade")) return symbolStar;
	if (normalized.includes("m&a") || normalized.includes("merger")) return symbolDiamond;
	return symbolCircle;
}

export function getMarkerSymbolPath(symbol: string, size = 95): string {
	const rawPath = d3Symbol().type(getMarkerSymbolType(symbol)).size(size)() ?? "";
	// Normalize numeric precision so SSR and client hydration use identical path strings.
	return rawPath.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (value) => {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) return value;
		if (Number.isInteger(parsed)) return String(parsed);
		return parsed.toFixed(6).replace(/\.?0+$/, "");
	});
}

export function getMarkerSymbolLabel(symbol: string): string {
	const entry = getGeoCatalogEntry(symbol.trim().toLowerCase());
	if (entry) return entry.label;
	if (!symbol.trim()) return "Unknown";
	return symbol
		.replace(/[_-]+/g, " ")
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}
