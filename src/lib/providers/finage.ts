import {
	type MarketDataProvider,
	type OHLCVData,
	type ProviderInfo,
	type QuoteData,
	type SymbolResult,
	TIMEFRAME_MAP,
	type TimeframeValue,
} from "./types";

function normalizeFinageSymbol(symbol: string): string {
	const upper = symbol.trim().toUpperCase();
	if (upper.includes("/")) {
		return upper.replace("/", "");
	}
	return upper;
}

function parseUnixFromDate(value: string): number {
	return Math.floor(new Date(value).getTime() / 1000);
}

export class FinageProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "finage",
		displayName: "Finage",
		supportedAssets: ["stock", "etf", "fx", "crypto", "index"],
		requiresAuth: true,
		rateLimit: { requests: 60, period: "minute" },
		freePlan: true,
		documentation: "https://finage.co.uk/product/stocks",
	};

	private apiKey: string;
	private baseUrl: string;

	constructor(apiKey?: string, baseUrl?: string) {
		this.apiKey = apiKey || process.env.FINAGE_API_KEY || "";
		this.baseUrl = (
			baseUrl ||
			process.env.FINAGE_API_BASE_URL ||
			"https://api.finage.co.uk"
		).replace(/\/+$/, "");
	}

	async isAvailable(): Promise<boolean> {
		if (!this.apiKey) return false;
		try {
			const response = await fetch(`${this.baseUrl}/last/stock/AAPL?apikey=${this.apiKey}`);
			return response.ok;
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		if (!this.apiKey) throw new Error("Finage API key missing");
		const normalized = normalizeFinageSymbol(symbol);
		const interval = TIMEFRAME_MAP.finage[timeframe] || "1d";
		const url = `${this.baseUrl}/agg/stock/${encodeURIComponent(normalized)}/${encodeURIComponent(interval)}?limit=${Math.min(limit, 2000)}&apikey=${this.apiKey}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Finage OHLCV failed (${response.status})`);
		}
		const payload = await response.json();
		const rows = Array.isArray(payload) ? payload : payload?.data;
		if (!Array.isArray(rows) || rows.length === 0) {
			throw new Error("No Finage OHLCV data available");
		}

		return rows
			.slice(-limit)
			.map((item) => ({
				time: parseUnixFromDate(item.timestamp || item.date || item.time),
				open: Number(item.open ?? item.close ?? 0),
				high: Number(item.high ?? item.close ?? 0),
				low: Number(item.low ?? item.close ?? 0),
				close: Number(item.close ?? 0),
				volume: Number(item.volume ?? 0),
			}))
			.filter((item: OHLCVData) => Number.isFinite(item.time) && Number.isFinite(item.close));
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		if (!this.apiKey) return [];
		const response = await fetch(
			`${this.baseUrl}/search?query=${encodeURIComponent(query)}&limit=20&apikey=${this.apiKey}`,
		);
		if (!response.ok) return [];
		const payload = await response.json();
		const rows = Array.isArray(payload) ? payload : payload?.data;
		if (!Array.isArray(rows)) return [];

		return rows
			.slice(0, 20)
			.map((item) => ({
				symbol: item.symbol || item.ticker || "",
				name: item.name || item.symbol || item.ticker || "",
				type: (item.type || "stock") as SymbolResult["type"],
				exchange: item.exchange,
				currency: item.currency,
			}))
			.filter((item: SymbolResult) => item.symbol.length > 0);
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		if (!this.apiKey) throw new Error("Finage API key missing");
		const normalized = normalizeFinageSymbol(symbol);
		const response = await fetch(
			`${this.baseUrl}/last/stock/${encodeURIComponent(normalized)}?apikey=${this.apiKey}`,
		);
		if (!response.ok) {
			throw new Error(`Finage quote failed (${response.status})`);
		}
		const payload = await response.json();
		const quote = payload?.data || payload;
		const price = Number(quote?.price ?? quote?.last ?? 0);
		if (!Number.isFinite(price) || price <= 0) {
			throw new Error("No Finage quote data available");
		}

		const previous = Number(quote?.prevClose ?? quote?.open ?? price);
		const change = Number(quote?.change ?? price - previous);
		const changePercent = Number.isFinite(Number(quote?.changePercent))
			? Number(quote.changePercent)
			: previous !== 0
				? (change / previous) * 100
				: 0;

		return {
			symbol,
			price,
			change,
			changePercent,
			high: Number(quote?.high ?? price),
			low: Number(quote?.low ?? price),
			open: Number(quote?.open ?? price),
			volume: Number(quote?.volume ?? 0),
			timestamp: Number(quote?.timestamp ?? Math.floor(Date.now() / 1000)),
		};
	}
}

export default FinageProvider;



