import {
	type MarketDataProvider,
	type OHLCVData,
	type ProviderInfo,
	type QuoteData,
	type SymbolResult,
	TIMEFRAME_MAP,
	type TimeframeValue,
} from "./types";

function parseDateToUnix(value: string): number {
	return Math.floor(new Date(value).getTime() / 1000);
}

function toFmpSymbol(symbol: string): string {
	return symbol.includes("/") ? symbol.replace("/", "") : symbol;
}

export class FMPProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "fmp",
		displayName: "Financial Modeling Prep",
		supportedAssets: ["stock", "etf", "index"],
		requiresAuth: true,
		rateLimit: { requests: 250, period: "day" },
		freePlan: true,
		documentation: "https://site.financialmodelingprep.com/developer/docs",
	};

	private apiKey: string;
	private baseUrl = "https://financialmodelingprep.com/api/v3";

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.FMP_API_KEY || "";
	}

	async isAvailable(): Promise<boolean> {
		if (!this.apiKey) return false;
		try {
			const response = await fetch(`${this.baseUrl}/quote/AAPL?apikey=${this.apiKey}`);
			if (!response.ok) return false;
			const data = await response.json();
			return Array.isArray(data);
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		if (!this.apiKey) throw new Error("FMP API key missing");
		const fmpSymbol = toFmpSymbol(symbol);
		const tf = TIMEFRAME_MAP.fmp[timeframe];
		let url = "";

		if (["1m", "5m", "15m", "30m", "1H", "4H"].includes(timeframe)) {
			url = `${this.baseUrl}/historical-chart/${tf}/${encodeURIComponent(fmpSymbol)}?apikey=${this.apiKey}`;
		} else {
			url = `${this.baseUrl}/historical-price-full/${encodeURIComponent(fmpSymbol)}?serietype=line&apikey=${this.apiKey}`;
		}

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`FMP OHLCV failed (${response.status})`);
		}
		const data = await response.json();

		const rows = Array.isArray(data) ? data : data?.historical;
		if (!Array.isArray(rows) || rows.length === 0) {
			throw new Error("No FMP OHLCV data available");
		}

		return rows
			.slice(0, limit)
			.map((item) => ({
				time: parseDateToUnix(item.date),
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
			`${this.baseUrl}/search?query=${encodeURIComponent(query)}&limit=20&exchange=NASDAQ&apikey=${this.apiKey}`,
		);
		if (!response.ok) return [];
		const data = await response.json();
		if (!Array.isArray(data)) return [];

		return data.slice(0, 20).map((item) => ({
			symbol: item.symbol,
			name: item.name || item.symbol,
			type: "stock" as const,
			exchange: item.exchangeShortName || item.exchange,
			currency: item.currency,
		}));
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		if (!this.apiKey) throw new Error("FMP API key missing");
		const fmpSymbol = toFmpSymbol(symbol);
		const response = await fetch(
			`${this.baseUrl}/quote/${encodeURIComponent(fmpSymbol)}?apikey=${this.apiKey}`,
		);
		if (!response.ok) {
			throw new Error(`FMP quote failed (${response.status})`);
		}
		const data = await response.json();
		const quote = Array.isArray(data) ? data[0] : null;
		if (!quote) {
			throw new Error("No FMP quote data available");
		}

		const price = Number(quote.price ?? 0);
		const previousClose = Number(quote.previousClose ?? price);
		const change = Number.isFinite(quote.change) ? Number(quote.change) : price - previousClose;
		const changePercent = Number.isFinite(quote.changesPercentage)
			? Number(quote.changesPercentage)
			: previousClose !== 0
				? (change / previousClose) * 100
				: 0;

		return {
			symbol,
			price,
			change,
			changePercent,
			high: Number(quote.dayHigh ?? price),
			low: Number(quote.dayLow ?? price),
			open: Number(quote.open ?? price),
			volume: Number(quote.volume ?? 0),
			timestamp: Math.floor(Date.now() / 1000),
		};
	}
}

export default FMPProvider;
