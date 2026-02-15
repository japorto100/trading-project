import type {
	MarketDataProvider,
	OHLCVData,
	ProviderInfo,
	QuoteData,
	SymbolResult,
	TimeframeValue,
} from "./types";

function parseUnix(value: string): number {
	return Math.floor(new Date(value).getTime() / 1000);
}

function normalizeSymbol(symbol: string): string {
	return symbol.includes("/") ? symbol.replace("/", "") : symbol;
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export class MarketstackProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "marketstack",
		displayName: "Marketstack",
		supportedAssets: ["stock", "etf", "index"],
		requiresAuth: true,
		rateLimit: { requests: 100, period: "month" },
		freePlan: true,
		documentation: "https://marketstack.com/documentation",
	};

	private apiKey: string;
	private baseUrl = "https://api.marketstack.com/v1";

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.MARKETSTACK_API_KEY || "";
	}

	async isAvailable(): Promise<boolean> {
		if (!this.apiKey) return false;
		try {
			const response = await fetch(
				`${this.baseUrl}/eod/latest?access_key=${this.apiKey}&symbols=AAPL`,
			);
			if (!response.ok) return false;
			const data = await response.json();
			return Array.isArray(data?.data) && data.data.length > 0;
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		if (!this.apiKey) throw new Error("Marketstack API key missing");
		if (timeframe !== "1D" && timeframe !== "1W" && timeframe !== "1M") {
			throw new Error("Marketstack free endpoint supports daily-derived bars only");
		}

		const normalized = normalizeSymbol(symbol);
		const response = await fetch(
			`${this.baseUrl}/eod?access_key=${this.apiKey}&symbols=${encodeURIComponent(normalized)}&limit=${Math.min(limit, 1000)}&sort=DESC`,
		);
		if (!response.ok) throw new Error(`Marketstack OHLCV failed (${response.status})`);
		const payload = await response.json();
		const rows = Array.isArray(payload?.data) ? payload.data : [];

		return rows
			.slice(0, limit)
			.map((item: unknown) => {
				const row = asRecord(item);
				return {
					time: parseUnix(String(row?.date ?? "")),
					open: Number(row?.open ?? row?.close ?? 0),
					high: Number(row?.high ?? row?.close ?? 0),
					low: Number(row?.low ?? row?.close ?? 0),
					close: Number(row?.close ?? 0),
					volume: Number(row?.volume ?? 0),
				};
			})
			.filter((item: OHLCVData) => Number.isFinite(item.time) && Number.isFinite(item.close))
			.sort((a: OHLCVData, b: OHLCVData) => a.time - b.time);
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		if (!this.apiKey) return [];
		const response = await fetch(
			`${this.baseUrl}/tickers?access_key=${this.apiKey}&search=${encodeURIComponent(query)}&limit=20`,
		);
		if (!response.ok) return [];
		const payload = await response.json();
		const rows = Array.isArray(payload?.data) ? payload.data : [];
		return rows.slice(0, 20).map((item: unknown) => {
			const row = asRecord(item);
			const exchange = asRecord(row?.stock_exchange);
			return {
				symbol: String(row?.symbol ?? ""),
				name: String(row?.name ?? row?.symbol ?? ""),
				type: "stock" as const,
				exchange: String(exchange?.name ?? exchange?.acronym ?? ""),
				currency: String(exchange?.currency ?? ""),
			};
		});
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		if (!this.apiKey) throw new Error("Marketstack API key missing");
		const normalized = normalizeSymbol(symbol);
		const response = await fetch(
			`${this.baseUrl}/eod/latest?access_key=${this.apiKey}&symbols=${encodeURIComponent(normalized)}`,
		);
		if (!response.ok) throw new Error(`Marketstack quote failed (${response.status})`);
		const payload = await response.json();
		const row = Array.isArray(payload?.data) ? payload.data[0] : null;
		if (!row) throw new Error("No Marketstack quote data available");
		const price = Number(row.close ?? 0);
		const open = Number(row.open ?? price);
		const change = price - open;
		const changePercent = open !== 0 ? (change / open) * 100 : 0;
		return {
			symbol,
			price,
			change,
			changePercent,
			high: Number(row.high ?? price),
			low: Number(row.low ?? price),
			open,
			volume: Number(row.volume ?? 0),
			timestamp: Date.now(),
		};
	}
}

export default MarketstackProvider;
