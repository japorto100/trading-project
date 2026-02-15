import type {
	MarketDataProvider,
	OHLCVData,
	OHLCVRequestOptions,
	ProviderInfo,
	QuoteData,
	SymbolResult,
	TimeframeValue,
} from "./types";

interface YFinanceBridgeOHLCVResponse {
	data?: OHLCVData[];
}

interface YFinanceBridgeQuoteResponse {
	data?: QuoteData;
}

interface YFinanceBridgeSearchResponse {
	data?: SymbolResult[];
}

export class YFinanceBridgeProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "yfinance",
		displayName: "yfinance Bridge (Unofficial Wrapper)",
		supportedAssets: ["stock", "etf", "fx", "crypto", "index", "commodity"],
		requiresAuth: false,
		rateLimit: { requests: 60, period: "minute" },
		freePlan: true,
		documentation: "https://ranaroussi.github.io/yfinance/",
	};

	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = (baseUrl || process.env.YFINANCE_BRIDGE_URL || "").replace(/\/+$/, "");
	}

	async isAvailable(): Promise<boolean> {
		if (!this.baseUrl) return false;
		try {
			const response = await fetch(`${this.baseUrl}/health`);
			return response.ok;
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
		options?: OHLCVRequestOptions,
	): Promise<OHLCVData[]> {
		if (!this.baseUrl) {
			throw new Error("YFINANCE_BRIDGE_URL is not configured");
		}

		const params = new URLSearchParams({
			symbol,
			timeframe,
			limit: String(limit),
		});
		if (options?.start !== undefined) {
			params.set("start", String(Math.floor(options.start)));
		}
		if (options?.end !== undefined) {
			params.set("end", String(Math.floor(options.end)));
		}
		const response = await fetch(`${this.baseUrl}/ohlcv?${params.toString()}`);
		if (!response.ok) {
			throw new Error(`yfinance bridge OHLCV failed (${response.status})`);
		}
		const payload = (await response.json()) as YFinanceBridgeOHLCVResponse | OHLCVData[];
		const rows = Array.isArray(payload) ? payload : payload.data || [];
		if (!Array.isArray(rows) || rows.length === 0) {
			throw new Error("No yfinance bridge OHLCV data available");
		}
		return rows;
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		if (!this.baseUrl) {
			throw new Error("YFINANCE_BRIDGE_URL is not configured");
		}

		const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
		if (!response.ok) {
			throw new Error(`yfinance bridge search failed (${response.status})`);
		}
		const payload = (await response.json()) as YFinanceBridgeSearchResponse | SymbolResult[];
		const rows = Array.isArray(payload) ? payload : payload.data || [];
		return Array.isArray(rows) ? rows : [];
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		if (!this.baseUrl) {
			throw new Error("YFINANCE_BRIDGE_URL is not configured");
		}

		const response = await fetch(`${this.baseUrl}/quote?symbol=${encodeURIComponent(symbol)}`);
		if (!response.ok) {
			throw new Error(`yfinance bridge quote failed (${response.status})`);
		}
		const payload = (await response.json()) as YFinanceBridgeQuoteResponse | QuoteData;
		const quote = (payload as YFinanceBridgeQuoteResponse).data ?? payload;
		if (!quote || typeof (quote as QuoteData).price !== "number") {
			throw new Error("Invalid yfinance bridge quote payload");
		}
		return quote as QuoteData;
	}
}

export default YFinanceBridgeProvider;
