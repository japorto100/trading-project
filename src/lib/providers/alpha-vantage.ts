// Alpha Vantage API Provider
// Free Plan: 25 requests/day, 5 requests/minute
// Supports: Stocks, FX, Crypto, Indices

import {
	type MarketDataProvider,
	type OHLCVData,
	type ProviderInfo,
	type QuoteData,
	type SymbolResult,
	TIMEFRAME_MAP,
	type TimeframeValue,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asStringRecord(value: unknown): Record<string, string> {
	if (!value || typeof value !== "object") return {};
	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")]),
	);
}

function mapAlphaVantageType(value: string): SymbolResult["type"] {
	const normalized = value.toLowerCase();
	if (normalized.includes("crypto")) return "crypto";
	if (normalized.includes("currency") || normalized.includes("forex") || normalized.includes("fx"))
		return "fx";
	if (normalized.includes("etf")) return "etf";
	if (normalized.includes("index")) return "index";
	if (normalized.includes("future") || normalized.includes("commodity")) return "commodity";
	return "stock";
}

export class AlphaVantageProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "alphavantage",
		displayName: "Alpha Vantage",
		supportedAssets: ["stock", "fx", "crypto", "index"],
		requiresAuth: true,
		rateLimit: { requests: 25, period: "day" },
		freePlan: true,
		documentation: "https://www.alphavantage.co/documentation/",
	};

	private apiKey: string;
	private baseUrl = "https://www.alphavantage.co/query";

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.ALPHA_VANTAGE_API_KEY || "demo";
	}

	async isAvailable(): Promise<boolean> {
		try {
			const response = await fetch(
				`${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=${this.apiKey}`,
			);
			const data = await response.json();
			return !data["Error Message"] && !data.Note;
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		const [base, quote] = symbol.split("/");
		const isFX = quote && base?.length === 3;
		const isCrypto =
			quote && (quote === "USD" || quote === "EUR" || quote === "BTC") && base?.length > 3;

		let function_name: string;
		const params: Record<string, string> = {
			apikey: this.apiKey,
		};

		if (isCrypto) {
			function_name = "DIGITAL_CURRENCY_INTRADAY";
			params.symbol = base;
			params.market = quote;
			params.interval = TIMEFRAME_MAP.alphavantage[timeframe] || "5min";
		} else if (isFX) {
			function_name =
				timeframe === "1D" || timeframe === "1W" || timeframe === "1M" ? "FX_DAILY" : "FX_INTRADAY";
			params.from_symbol = base;
			params.to_symbol = quote;
			if (function_name === "FX_INTRADAY") {
				params.interval = TIMEFRAME_MAP.alphavantage[timeframe] || "5min";
			}
		} else {
			// Stock
			if (timeframe === "1D" || timeframe === "1W" || timeframe === "1M") {
				function_name = `TIME_SERIES_${timeframe === "1D" ? "DAILY" : timeframe === "1W" ? "WEEKLY" : "MONTHLY"}`;
			} else {
				function_name = "TIME_SERIES_INTRADAY";
				params.interval = TIMEFRAME_MAP.alphavantage[timeframe] || "5min";
			}
			params.symbol = symbol;
		}

		params.function = function_name;

		const queryString = new URLSearchParams(params).toString();
		const response = await fetch(`${this.baseUrl}?${queryString}`);
		const data = await response.json();

		if (data["Error Message"] || data.Note) {
			throw new Error(data["Error Message"] || data.Note);
		}

		// Parse response
		const timeSeriesKey = Object.keys(data).find((k) => k.includes("Time Series"));
		if (!timeSeriesKey) {
			throw new Error("No time series data found");
		}

		const timeSeries = asRecord(data[timeSeriesKey]) ?? {};
		const result: OHLCVData[] = [];

		for (const [timestamp, values] of Object.entries(timeSeries).slice(0, limit)) {
			const row = asStringRecord(values);
			const date = new Date(timestamp);
			result.push({
				time: Math.floor(date.getTime() / 1000),
				open: parseFloat(row["1. open"] || row["1a. open (USD)"] || "0"),
				high: parseFloat(row["2. high"] || row["2a. high (USD)"] || "0"),
				low: parseFloat(row["3. low"] || row["3a. low (USD)"] || "0"),
				close: parseFloat(row["4. close"] || row["4a. close (USD)"] || "0"),
				volume: parseFloat(row["5. volume"] || row["6. market cap (USD)"] || "0"),
			});
		}

		return result.reverse();
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		const params = new URLSearchParams({
			function: "SYMBOL_SEARCH",
			keywords: query,
			apikey: this.apiKey,
		});

		const response = await fetch(`${this.baseUrl}?${params}`);
		const data = await response.json();

		if (!data.bestMatches) return [];

		return data.bestMatches.slice(0, 20).map((match: unknown) => {
			const item = asStringRecord(match);
			return {
				symbol: item["1. symbol"],
				name: item["2. name"],
				type: mapAlphaVantageType(item["3. type"] ?? ""),
				exchange: item["4. region"],
				currency: item["8. currency"],
			};
		});
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		const [base, quote] = symbol.split("/");
		const isFX = quote && base?.length === 3;

		const params: Record<string, string> = {
			apikey: this.apiKey,
		};

		if (isFX) {
			params.function = "CURRENCY_EXCHANGE_RATE";
			params.from_currency = base;
			params.to_currency = quote;
		} else {
			params.function = "GLOBAL_QUOTE";
			params.symbol = symbol;
		}

		const response = await fetch(`${this.baseUrl}?${new URLSearchParams(params)}`);
		const data = await response.json();

		if (isFX) {
			const rate = data["Realtime Currency Exchange Rate"];
			if (!rate) throw new Error("No quote data found");

			return {
				symbol,
				price: parseFloat(rate["5. Exchange Rate"]),
				change: 0,
				changePercent: 0,
				high: parseFloat(rate["5. Exchange Rate"]),
				low: parseFloat(rate["5. Exchange Rate"]),
				open: parseFloat(rate["5. Exchange Rate"]),
				volume: 0,
				timestamp: Date.now(),
			};
		}

		const quoteData = data["Global Quote"];
		if (!quoteData) throw new Error("No quote data found");

		const price = parseFloat(quoteData["05. price"]);
		const prevClose = parseFloat(quoteData["08. previous close"]);

		return {
			symbol,
			price,
			change: price - prevClose,
			changePercent: ((price - prevClose) / prevClose) * 100,
			high: parseFloat(quoteData["03. high"]),
			low: parseFloat(quoteData["04. low"]),
			open: parseFloat(quoteData["02. open"]),
			volume: parseFloat(quoteData["06. volume"]),
			timestamp: Date.now(),
		};
	}
}

export default AlphaVantageProvider;
