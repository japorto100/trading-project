import type {
	MarketDataProvider,
	OHLCVData,
	ProviderInfo,
	QuoteData,
	SymbolResult,
	TimeframeValue,
} from "./types";

const INDEX_SYMBOL_MAP: Record<string, string> = {
	SPX: "I:SPX",
	NDX: "I:NDX",
	DJI: "I:DJI",
	IXIC: "I:IXIC",
};

function toPolygonTicker(symbol: string): string {
	const upper = symbol.trim().toUpperCase();
	if (INDEX_SYMBOL_MAP[upper]) return INDEX_SYMBOL_MAP[upper];
	if (upper.includes("/")) {
		const [base, quote] = upper.split("/");
		if (base.length === 3 && quote.length === 3) {
			return `C:${base}${quote}`;
		}
		return `X:${base}${quote}`;
	}
	return upper;
}

function timeframeToAgg(timeframe: TimeframeValue): { multiplier: number; timespan: string } {
	switch (timeframe) {
		case "1m":
			return { multiplier: 1, timespan: "minute" };
		case "3m":
			return { multiplier: 3, timespan: "minute" };
		case "5m":
			return { multiplier: 5, timespan: "minute" };
		case "15m":
			return { multiplier: 15, timespan: "minute" };
		case "30m":
			return { multiplier: 30, timespan: "minute" };
		case "1H":
			return { multiplier: 1, timespan: "hour" };
		case "2H":
			return { multiplier: 2, timespan: "hour" };
		case "4H":
			return { multiplier: 4, timespan: "hour" };
		case "1D":
			return { multiplier: 1, timespan: "day" };
		case "1W":
			return { multiplier: 1, timespan: "week" };
		case "1M":
			return { multiplier: 1, timespan: "month" };
		default:
			throw new Error(`Unsupported timeframe: ${timeframe}`);
	}
}

function formatDate(value: Date): string {
	const year = value.getUTCFullYear();
	const month = String(value.getUTCMonth() + 1).padStart(2, "0");
	const day = String(value.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function rangeFor(timeframe: TimeframeValue, limit: number): { from: string; to: string } {
	const now = new Date();
	const secondsByTf: Record<TimeframeValue, number> = {
		"1m": 60,
		"3m": 3 * 60,
		"5m": 5 * 60,
		"15m": 15 * 60,
		"30m": 30 * 60,
		"1H": 60 * 60,
		"2H": 2 * 60 * 60,
		"4H": 4 * 60 * 60,
		"1D": 24 * 60 * 60,
		"1W": 7 * 24 * 60 * 60,
		"1M": 30 * 24 * 60 * 60,
	};
	const from = new Date(now.getTime() - Math.max(limit, 1) * secondsByTf[timeframe] * 1000);
	return { from: formatDate(from), to: formatDate(now) };
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export class PolygonProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "polygon",
		displayName: "Polygon.io",
		supportedAssets: ["stock", "fx", "crypto", "index"],
		requiresAuth: true,
		rateLimit: { requests: 5, period: "minute" },
		freePlan: true,
		documentation: "https://polygon.io/docs",
	};

	private apiKey: string;
	private baseUrl = "https://api.polygon.io";

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.POLYGON_API_KEY || "";
	}

	async isAvailable(): Promise<boolean> {
		if (!this.apiKey) return false;
		try {
			const response = await fetch(`${this.baseUrl}/v2/last/trade/AAPL?apiKey=${this.apiKey}`);
			if (!response.ok) return false;
			const data = await response.json();
			return Boolean(data?.results?.p);
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		if (!this.apiKey) throw new Error("Polygon API key missing");
		const ticker = toPolygonTicker(symbol);
		const { multiplier, timespan } = timeframeToAgg(timeframe);
		const { from, to } = rangeFor(timeframe, limit + 30);
		const url = `${this.baseUrl}/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=${Math.min(limit * 2, 50000)}&apiKey=${this.apiKey}`;
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Polygon OHLCV failed (${response.status})`);
		const payload = await response.json();
		const rows = Array.isArray(payload?.results) ? payload.results : [];
		if (rows.length === 0) throw new Error("No Polygon OHLCV data available");
		return rows
			.slice(-limit)
			.map((item: unknown) => {
				const row = asRecord(item);
				return {
					time: Math.floor(Number(row?.t ?? 0) / 1000),
					open: Number(row?.o ?? 0),
					high: Number(row?.h ?? 0),
					low: Number(row?.l ?? 0),
					close: Number(row?.c ?? 0),
					volume: Number(row?.v ?? 0),
				};
			})
			.filter((item: OHLCVData) => Number.isFinite(item.time) && Number.isFinite(item.close));
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		if (!this.apiKey) return [];
		const response = await fetch(
			`${this.baseUrl}/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=20&apiKey=${this.apiKey}`,
		);
		if (!response.ok) return [];
		const payload = await response.json();
		const rows = Array.isArray(payload?.results) ? payload.results : [];
		return rows.slice(0, 20).map((item: unknown) => {
			const row = asRecord(item);
			return {
				symbol: String(row?.ticker ?? ""),
				name: String(row?.name ?? row?.ticker ?? ""),
				type: "stock" as const,
				exchange: String(row?.primary_exchange ?? ""),
				currency: "USD",
			};
		});
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		if (!this.apiKey) throw new Error("Polygon API key missing");
		const ticker = toPolygonTicker(symbol);
		const response = await fetch(
			`${this.baseUrl}/v2/last/trade/${encodeURIComponent(ticker)}?apiKey=${this.apiKey}`,
		);
		if (!response.ok) throw new Error(`Polygon quote failed (${response.status})`);
		const payload = await response.json();
		const trade = payload?.results;
		if (!trade) throw new Error("No Polygon quote data available");
		const price = Number(trade.p ?? 0);
		return {
			symbol,
			price,
			change: 0,
			changePercent: 0,
			high: price,
			low: price,
			open: price,
			volume: 0,
			timestamp: Number(trade.t ?? Date.now()),
		};
	}
}

export default PolygonProvider;
