import {
	type MarketDataProvider,
	type OHLCVData,
	type OHLCVRequestOptions,
	type ProviderInfo,
	type QuoteData,
	type SymbolResult,
	TIMEFRAME_MAP,
	type TimeframeValue,
} from "./types";

const INDEX_SYMBOL_MAP: Record<string, string> = {
	SPX: "^GSPC",
	NDX: "^NDX",
	DJI: "^DJI",
	IXIC: "^IXIC",
	DAX: "^GDAXI",
	FTSE: "^FTSE",
	N225: "^N225",
	HSI: "^HSI",
};

function toYahooSymbol(symbol: string): string {
	const trimmed = symbol.trim().toUpperCase();
	if (!trimmed) return trimmed;

	if (INDEX_SYMBOL_MAP[trimmed]) {
		return INDEX_SYMBOL_MAP[trimmed];
	}

	const slashIndex = trimmed.indexOf("/");
	if (slashIndex > 0) {
		const base = trimmed.slice(0, slashIndex);
		const quote = trimmed.slice(slashIndex + 1);
		if (base && quote) {
			if (base.length === 3 && quote.length === 3) {
				return `${base}${quote}=X`;
			}
			return `${base}-${quote}`;
		}
	}

	return trimmed;
}

function yahooRangeFor(timeframe: TimeframeValue, limit: number): string {
	const secondsByTimeframe: Record<TimeframeValue, number> = {
		"1m": 60,
		"5m": 300,
		"15m": 900,
		"30m": 1800,
		"1H": 3600,
		"4H": 14400,
		"1D": 86400,
		"1W": 604800,
		"1M": 2592000,
	};

	const totalSeconds = Math.max(1, limit) * secondsByTimeframe[timeframe];

	if (totalSeconds <= 86400) return "1d";
	if (totalSeconds <= 86400 * 5) return "5d";
	if (totalSeconds <= 86400 * 30) return "1mo";
	if (totalSeconds <= 86400 * 90) return "3mo";
	if (totalSeconds <= 86400 * 180) return "6mo";
	if (totalSeconds <= 86400 * 365) return "1y";
	if (totalSeconds <= 86400 * 365 * 2) return "2y";
	if (totalSeconds <= 86400 * 365 * 5) return "5y";
	return "max";
}

function mapYahooQuoteType(type: string): SymbolResult["type"] {
	const value = type.toUpperCase();
	if (value.includes("CRYPTO")) return "crypto";
	if (value.includes("CURRENCY")) return "fx";
	if (value.includes("ETF")) return "etf";
	if (value.includes("INDEX")) return "index";
	if (value.includes("FUTURE") || value.includes("COMMOD")) return "commodity";
	return "stock";
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export class YahooUnofficialProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "yahoo",
		displayName: "Yahoo Finance (Unofficial)",
		supportedAssets: ["stock", "etf", "fx", "crypto", "index", "commodity"],
		requiresAuth: false,
		rateLimit: { requests: 100, period: "minute" },
		freePlan: true,
		documentation: "https://query1.finance.yahoo.com (unofficial endpoints)",
	};

	private chartBaseUrl =
		process.env.YAHOO_CHART_BASE_URL || "https://query1.finance.yahoo.com/v8/finance/chart";
	private quoteBaseUrl =
		process.env.YAHOO_QUOTE_BASE_URL || "https://query1.finance.yahoo.com/v7/finance/quote";
	private searchBaseUrl =
		process.env.YAHOO_SEARCH_BASE_URL || "https://query1.finance.yahoo.com/v1/finance/search";
	private headers = {
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
		Accept: "application/json",
	};

	async isAvailable(): Promise<boolean> {
		try {
			const response = await fetch(`${this.quoteBaseUrl}?symbols=AAPL`, {
				headers: this.headers,
			});
			if (!response.ok) return false;
			const data = await response.json();
			return Array.isArray(data?.quoteResponse?.result);
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
		const yahooSymbol = toYahooSymbol(symbol);
		const interval = TIMEFRAME_MAP.yahoo[timeframe] || "1d";
		const params = new URLSearchParams({ interval, includePrePost: "false", events: "div,splits" });

		if (options?.start !== undefined) {
			params.set("period1", String(Math.floor(options.start)));
			params.set("period2", String(Math.floor(options.end ?? Math.floor(Date.now() / 1000))));
		} else {
			params.set("range", yahooRangeFor(timeframe, limit));
		}

		const response = await fetch(
			`${this.chartBaseUrl}/${encodeURIComponent(yahooSymbol)}?${params.toString()}`,
			{
				headers: this.headers,
			},
		);
		const data = await response.json();
		const result = data?.chart?.result?.[0];
		const error = data?.chart?.error;
		if (error) {
			throw new Error(error.description || error.code || "Yahoo chart error");
		}
		if (!result?.timestamp || !result?.indicators?.quote?.[0]) {
			throw new Error("No Yahoo OHLCV data available");
		}

		const quote = result.indicators.quote[0];
		const rows: OHLCVData[] = [];

		for (let i = 0; i < result.timestamp.length; i++) {
			const ts = result.timestamp[i];
			const open = Number(quote.open?.[i]);
			const high = Number(quote.high?.[i]);
			const low = Number(quote.low?.[i]);
			const close = Number(quote.close?.[i]);
			const volume = Number(quote.volume?.[i] ?? 0);

			if (
				!Number.isFinite(ts) ||
				!Number.isFinite(open) ||
				!Number.isFinite(high) ||
				!Number.isFinite(low) ||
				!Number.isFinite(close)
			) {
				continue;
			}

			rows.push({
				time: ts,
				open,
				high,
				low,
				close,
				volume: Number.isFinite(volume) ? volume : 0,
			});
		}

		if (rows.length === 0) {
			throw new Error("Yahoo returned only invalid candles");
		}

		return rows.slice(-limit);
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		const params = new URLSearchParams({
			q: query,
			quotesCount: "20",
			newsCount: "0",
		});
		const response = await fetch(`${this.searchBaseUrl}?${params.toString()}`, {
			headers: this.headers,
		});
		const data = await response.json();
		const quotes = Array.isArray(data?.quotes) ? data.quotes : [];

		return quotes
			.filter((item: unknown) => {
				const row = asRecord(item);
				return typeof row?.symbol === "string" && row.symbol.length > 0;
			})
			.slice(0, 20)
			.map((item: unknown) => {
				const row = asRecord(item);
				return {
					symbol: String(row?.symbol ?? ""),
					name: String(row?.shortname ?? row?.longname ?? row?.symbol ?? ""),
					type: mapYahooQuoteType(String(row?.quoteType ?? "")),
					exchange: String(row?.exchange ?? row?.exchDisp ?? ""),
					currency: row?.currency ? String(row.currency) : undefined,
				};
			});
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		const yahooSymbol = toYahooSymbol(symbol);
		const response = await fetch(
			`${this.quoteBaseUrl}?symbols=${encodeURIComponent(yahooSymbol)}`,
			{
				headers: this.headers,
			},
		);
		const data = await response.json();
		const quote = data?.quoteResponse?.result?.[0];
		if (!quote) {
			throw new Error("No Yahoo quote data available");
		}

		const price = Number(quote.regularMarketPrice ?? quote.postMarketPrice ?? quote.preMarketPrice);
		if (!Number.isFinite(price)) {
			throw new Error("Invalid Yahoo quote payload");
		}

		return {
			symbol,
			price,
			change: Number(quote.regularMarketChange ?? 0),
			changePercent: Number(quote.regularMarketChangePercent ?? 0),
			high: Number(quote.regularMarketDayHigh ?? price),
			low: Number(quote.regularMarketDayLow ?? price),
			open: Number(quote.regularMarketOpen ?? price),
			volume: Number(quote.regularMarketVolume ?? 0),
			timestamp: Number(quote.regularMarketTime ?? Math.floor(Date.now() / 1000)),
		};
	}
}

export default YahooUnofficialProvider;
