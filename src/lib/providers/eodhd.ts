import {
	type MarketDataProvider,
	type OHLCVData,
	type ProviderInfo,
	type QuoteData,
	type SymbolResult,
	TIMEFRAME_MAP,
	type TimeframeValue,
} from "./types";

function toEodhdSymbol(symbol: string): string {
	if (symbol.includes("/")) {
		return `${symbol.replace("/", "")}.FOREX`;
	}
	if (symbol.startsWith("^")) {
		return `${symbol.slice(1)}.INDX`;
	}
	return symbol;
}

function parseUnix(value: string): number {
	return Math.floor(new Date(value).getTime() / 1000);
}

export class EODHDProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "eodhd",
		displayName: "EODHD",
		supportedAssets: ["stock", "etf", "fx", "index", "commodity"],
		requiresAuth: true,
		rateLimit: { requests: 20, period: "day" },
		freePlan: true,
		documentation: "https://eodhd.com/financial-apis",
	};

	private apiKey: string;
	private baseUrl = "https://eodhd.com/api";

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.EODHD_API_KEY || "";
	}

	async isAvailable(): Promise<boolean> {
		if (!this.apiKey) return false;
		try {
			const response = await fetch(
				`${this.baseUrl}/real-time/AAPL.US?api_token=${this.apiKey}&fmt=json`,
			);
			if (!response.ok) return false;
			const data = await response.json();
			return typeof data?.close === "number" || typeof data?.close === "string";
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		if (!this.apiKey) throw new Error("EODHD API key missing");
		const normalized = toEodhdSymbol(symbol);
		const intraday = ["1m", "5m", "15m", "30m", "1H", "4H"].includes(timeframe);
		let url = "";

		if (intraday) {
			const interval = TIMEFRAME_MAP.eodhd[timeframe];
			url = `${this.baseUrl}/intraday/${encodeURIComponent(normalized)}?api_token=${this.apiKey}&fmt=json&interval=${interval}`;
		} else {
			url = `${this.baseUrl}/eod/${encodeURIComponent(normalized)}?api_token=${this.apiKey}&fmt=json&period=${TIMEFRAME_MAP.eodhd[timeframe]}`;
		}

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`EODHD OHLCV failed (${response.status})`);
		}
		const data = await response.json();
		if (!Array.isArray(data) || data.length === 0) {
			throw new Error("No EODHD OHLCV data available");
		}

		return data
			.slice(-limit)
			.map((item) => ({
				time: parseUnix(item.datetime || item.date),
				open: Number(item.open ?? item.close ?? 0),
				high: Number(item.high ?? item.close ?? 0),
				low: Number(item.low ?? item.close ?? 0),
				close: Number(item.close ?? 0),
				volume: Number(item.volume ?? 0),
			}))
			.filter((item: OHLCVData) => Number.isFinite(item.time) && Number.isFinite(item.close))
			.sort((a: OHLCVData, b: OHLCVData) => a.time - b.time);
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		if (!this.apiKey) return [];
		const response = await fetch(
			`${this.baseUrl}/search/${encodeURIComponent(query)}?api_token=${this.apiKey}&limit=20&fmt=json`,
		);
		if (!response.ok) return [];
		const data = await response.json();
		if (!Array.isArray(data)) return [];

		return data
			.slice(0, 20)
			.map((item) => ({
				symbol: item.Code || item.code || "",
				name: item.Name || item.name || item.Code || "",
				type: "stock" as const,
				exchange: item.Exchange || item.exchange,
				currency: item.Currency || item.currency,
			}))
			.filter((item: SymbolResult) => item.symbol.length > 0);
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		if (!this.apiKey) throw new Error("EODHD API key missing");
		const normalized = toEodhdSymbol(symbol);
		const response = await fetch(
			`${this.baseUrl}/real-time/${encodeURIComponent(normalized)}?api_token=${this.apiKey}&fmt=json`,
		);
		if (!response.ok) {
			throw new Error(`EODHD quote failed (${response.status})`);
		}
		const quote = await response.json();
		if (!quote || quote.code) {
			throw new Error(quote?.message || "No EODHD quote data available");
		}

		const price = Number(quote.close ?? 0);
		const previousClose = Number(quote.previousClose ?? quote.prev_close ?? price);
		const change = Number(quote.change ?? price - previousClose);
		const changePercent = Number.isFinite(Number(quote.change_p))
			? Number(quote.change_p)
			: previousClose !== 0
				? (change / previousClose) * 100
				: 0;

		return {
			symbol,
			price,
			change,
			changePercent,
			high: Number(quote.high ?? price),
			low: Number(quote.low ?? price),
			open: Number(quote.open ?? price),
			volume: Number(quote.volume ?? 0),
			timestamp: Number(quote.timestamp ?? Math.floor(Date.now() / 1000)),
		};
	}
}

export default EODHDProvider;
