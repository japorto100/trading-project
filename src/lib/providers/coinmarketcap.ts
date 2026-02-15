import type {
	MarketDataProvider,
	OHLCVData,
	ProviderInfo,
	QuoteData,
	SymbolResult,
	TimeframeValue,
} from "./types";

function toCmcSymbol(input: string): string {
	const upper = input.trim().toUpperCase();
	if (upper.includes("/")) return upper.split("/")[0];
	if (upper.includes("-")) return upper.split("-")[0];
	return upper;
}

function timeframeToInterval(timeframe: TimeframeValue): string {
	switch (timeframe) {
		case "1m":
			return "1m";
		case "5m":
			return "5m";
		case "15m":
			return "15m";
		case "30m":
			return "30m";
		case "1H":
			return "1h";
		case "4H":
			return "4h";
		case "1D":
			return "1d";
		case "1W":
			return "7d";
		case "1M":
			return "30d";
	}
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export class CoinMarketCapProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "coinmarketcap",
		displayName: "CoinMarketCap",
		supportedAssets: ["crypto"],
		requiresAuth: true,
		rateLimit: { requests: 30, period: "minute" },
		freePlan: true,
		documentation: "https://coinmarketcap.com/api/documentation/v1/",
	};

	private apiKey: string;
	private baseUrl = "https://pro-api.coinmarketcap.com/v1";

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.COINMARKETCAP_API_KEY || "";
	}

	async isAvailable(): Promise<boolean> {
		if (!this.apiKey) return false;
		try {
			const response = await fetch(`${this.baseUrl}/cryptocurrency/quotes/latest?symbol=BTC`, {
				headers: { "X-CMC_PRO_API_KEY": this.apiKey },
			});
			if (!response.ok) return false;
			const data = await response.json();
			return Boolean(data?.data?.BTC?.quote?.USD?.price);
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		if (!this.apiKey) throw new Error("CoinMarketCap API key missing");
		const cmcSymbol = toCmcSymbol(symbol);
		const interval = timeframeToInterval(timeframe);
		const response = await fetch(
			`${this.baseUrl}/cryptocurrency/ohlcv/historical?symbol=${encodeURIComponent(cmcSymbol)}&convert=USD&time_period=${interval}&count=${Math.min(limit, 500)}`,
			{ headers: { "X-CMC_PRO_API_KEY": this.apiKey } },
		);
		if (!response.ok) throw new Error(`CoinMarketCap OHLCV failed (${response.status})`);
		const payload = await response.json();
		const rows = Array.isArray(payload?.data?.quotes) ? payload.data.quotes : [];
		return rows
			.slice(-limit)
			.map((entry: unknown) => {
				const entryRecord = asRecord(entry);
				const quoteContainer = asRecord(entryRecord?.quote);
				const quote = asRecord(quoteContainer?.USD);
				const close = Number(quote?.close ?? 0);
				return {
					time: Math.floor(
						new Date(
							String(entryRecord?.time_close ?? entryRecord?.timestamp ?? Date.now()),
						).getTime() / 1000,
					),
					open: Number(quote?.open ?? close),
					high: Number(quote?.high ?? close),
					low: Number(quote?.low ?? close),
					close,
					volume: Number(quote?.volume ?? 0),
				};
			})
			.filter((row: OHLCVData) => Number.isFinite(row.time) && Number.isFinite(row.close))
			.sort((a: OHLCVData, b: OHLCVData) => a.time - b.time);
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		if (!this.apiKey) return [];
		const response = await fetch(
			`${this.baseUrl}/cryptocurrency/map?symbol=${encodeURIComponent(query)}&limit=20`,
			{ headers: { "X-CMC_PRO_API_KEY": this.apiKey } },
		);
		if (!response.ok) return [];
		const payload = await response.json();
		const rows = Array.isArray(payload?.data) ? payload.data : [];
		return rows.slice(0, 20).map((item: unknown) => {
			const record = asRecord(item);
			return {
				symbol: `${String(record?.symbol ?? "")}/USD`,
				name: String(record?.name ?? record?.symbol ?? ""),
				type: "crypto" as const,
				exchange: "CMC",
				currency: "USD",
			};
		});
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		if (!this.apiKey) throw new Error("CoinMarketCap API key missing");
		const cmcSymbol = toCmcSymbol(symbol);
		const response = await fetch(
			`${this.baseUrl}/cryptocurrency/quotes/latest?symbol=${encodeURIComponent(cmcSymbol)}&convert=USD`,
			{ headers: { "X-CMC_PRO_API_KEY": this.apiKey } },
		);
		if (!response.ok) throw new Error(`CoinMarketCap quote failed (${response.status})`);
		const payload = await response.json();
		const quote = payload?.data?.[cmcSymbol]?.quote?.USD;
		if (!quote) throw new Error("No CoinMarketCap quote data available");

		const price = Number(quote.price ?? 0);
		const changePercent = Number(quote.percent_change_24h ?? 0);
		const change = (price * changePercent) / 100;

		return {
			symbol,
			price,
			change,
			changePercent,
			high: Number(quote.high_24h ?? price),
			low: Number(quote.low_24h ?? price),
			open: Number(quote.open_24h ?? price),
			volume: Number(quote.volume_24h ?? 0),
			timestamp: Date.now(),
		};
	}
}

export default CoinMarketCapProvider;
