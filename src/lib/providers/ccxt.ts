import type {
	MarketDataProvider,
	OHLCVData,
	ProviderInfo,
	QuoteData,
	SymbolResult,
	TimeframeValue,
} from "./types";

type CcxtTicker = {
	last?: number;
	open?: number;
	high?: number;
	low?: number;
	baseVolume?: number;
	quoteVolume?: number;
	percentage?: number;
	change?: number;
	timestamp?: number;
	datetime?: string;
};

type CcxtMarket = {
	symbol?: string;
	base?: string;
	quote?: string;
	active?: boolean;
};

type CcxtExchange = {
	id: string;
	markets?: Record<string, CcxtMarket>;
	has?: Record<string, boolean | "emulated">;
	loadMarkets: () => Promise<Record<string, CcxtMarket>>;
	fetchOHLCV: (
		symbol: string,
		timeframe?: string,
		since?: number,
		limit?: number,
	) => Promise<number[][]>;
	fetchTicker: (symbol: string) => Promise<CcxtTicker>;
	fetchTickers?: (symbols?: string[]) => Promise<Record<string, CcxtTicker>>;
};

function timeframeToCcxt(timeframe: TimeframeValue): string {
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
			return "1w";
		case "1M":
			return "1M";
	}
}

function normalizeSymbol(input: string): string {
	const cleaned = input.trim().toUpperCase();
	if (cleaned.includes("/")) return cleaned;
	if (cleaned.includes("-")) return cleaned.replace("-", "/");

	const knownQuotes = ["USDT", "USDC", "USD", "EUR", "BTC", "ETH"];
	for (const quote of knownQuotes) {
		if (cleaned.endsWith(quote) && cleaned.length > quote.length) {
			const base = cleaned.slice(0, -quote.length);
			if (base.length >= 2) return `${base}/${quote}`;
		}
	}
	return cleaned;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export class CCXTProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "ccxt",
		displayName: "CCXT (Crypto Fallback)",
		supportedAssets: ["crypto"],
		requiresAuth: false,
		rateLimit: { requests: 20, period: "minute" },
		freePlan: true,
		documentation: "https://docs.ccxt.com/",
	};

	private readonly exchangeId: string;
	private readonly apiKey: string;
	private readonly secret: string;
	private readonly password: string;
	private exchange: CcxtExchange | null = null;
	private marketsLoaded = false;

	constructor(input?: {
		exchangeId?: string;
		apiKey?: string;
		secret?: string;
		password?: string;
	}) {
		this.exchangeId = (input?.exchangeId || process.env.CCXT_DEFAULT_EXCHANGE || "binance")
			.trim()
			.toLowerCase();
		this.apiKey = input?.apiKey || process.env.CCXT_API_KEY || "";
		this.secret = input?.secret || process.env.CCXT_SECRET || "";
		this.password = input?.password || process.env.CCXT_PASSWORD || "";
	}

	private async resolveExchange(): Promise<CcxtExchange> {
		if (this.exchange) return this.exchange;

		const ccxtModule = (await import("ccxt")) as unknown as Record<string, unknown>;
		const exchangesValue = ccxtModule.exchanges;
		const exchangeIDs = Array.isArray(exchangesValue)
			? exchangesValue.filter((item): item is string => typeof item === "string")
			: isObject(exchangesValue)
				? Object.keys(exchangesValue)
				: [];

		if (!exchangeIDs.includes(this.exchangeId)) {
			throw new Error(`CCXT exchange not found: ${this.exchangeId}`);
		}

		const ctor = ccxtModule[this.exchangeId];
		if (typeof ctor !== "function") {
			throw new Error(`CCXT constructor missing for exchange: ${this.exchangeId}`);
		}

		const config: Record<string, unknown> = {
			enableRateLimit: true,
		};
		if (this.apiKey) config.apiKey = this.apiKey;
		if (this.secret) config.secret = this.secret;
		if (this.password) config.password = this.password;

		this.exchange = new (ctor as new (config: Record<string, unknown>) => CcxtExchange)(config);
		return this.exchange;
	}

	private async ensureMarketsLoaded(): Promise<CcxtExchange> {
		const exchange = await this.resolveExchange();
		if (!this.marketsLoaded) {
			await exchange.loadMarkets();
			this.marketsLoaded = true;
		}
		return exchange;
	}

	async isAvailable(): Promise<boolean> {
		try {
			await this.ensureMarketsLoaded();
			return true;
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		const exchange = await this.ensureMarketsLoaded();
		const normalized = normalizeSymbol(symbol);
		const interval = timeframeToCcxt(timeframe);
		const rows = await exchange.fetchOHLCV(normalized, interval, undefined, Math.min(limit, 1000));

		return rows
			.map((row) => {
				if (!Array.isArray(row)) return null;
				const [time, open, high, low, close, volume] = row;
				return {
					time: Math.floor(Number(time) / 1000),
					open: Number(open ?? 0),
					high: Number(high ?? 0),
					low: Number(low ?? 0),
					close: Number(close ?? 0),
					volume: Number(volume ?? 0),
				};
			})
			.filter((row): row is OHLCVData => {
				if (!row) return false;
				return Number.isFinite(row.time) && Number.isFinite(row.close);
			});
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		if (query.trim().length < 2) return [];

		const exchange = await this.ensureMarketsLoaded();
		const markets = exchange.markets || {};
		const needle = query.trim().toUpperCase();
		const results: SymbolResult[] = [];

		for (const market of Object.values(markets)) {
			if (!market || market.active === false) continue;
			const symbol = String(market.symbol || "");
			const base = String(market.base || "");
			const quote = String(market.quote || "");
			if (!symbol) continue;
			const haystack = `${symbol} ${base} ${quote}`.toUpperCase();
			if (!haystack.includes(needle)) continue;

			results.push({
				symbol,
				name: `${base}/${quote}`,
				type: "crypto",
				exchange: exchange.id.toUpperCase(),
				currency: quote || undefined,
			});
			if (results.length >= 20) break;
		}

		return results;
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		const exchange = await this.ensureMarketsLoaded();
		const normalized = normalizeSymbol(symbol);
		const ticker = await exchange.fetchTicker(normalized);

		const price = Number(ticker.last ?? 0);
		const open = Number(ticker.open ?? price);
		const high = Number(ticker.high ?? price);
		const low = Number(ticker.low ?? price);
		const changePercent = Number(ticker.percentage ?? 0);
		const change =
			typeof ticker.change === "number" && Number.isFinite(ticker.change)
				? ticker.change
				: (price * changePercent) / 100;
		const volume = Number(ticker.baseVolume ?? ticker.quoteVolume ?? 0);
		const timestamp =
			typeof ticker.timestamp === "number"
				? ticker.timestamp
				: ticker.datetime
					? Date.parse(ticker.datetime)
					: Date.now();

		if (!Number.isFinite(price) || price <= 0) {
			throw new Error(`No quote data available for ${normalized}`);
		}

		return {
			symbol: normalized,
			price,
			change: Number.isFinite(change) ? change : 0,
			changePercent: Number.isFinite(changePercent) ? changePercent : 0,
			high: Number.isFinite(high) ? high : price,
			low: Number.isFinite(low) ? low : price,
			open: Number.isFinite(open) ? open : price,
			volume: Number.isFinite(volume) ? volume : 0,
			timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
		};
	}
}

export function isCcxtEnabled(): boolean {
	const value = process.env.ENABLE_CCXT_FALLBACK || "";
	return value.trim().toLowerCase() === "true";
}

export function parseCcxtConfigFromEnv(): {
	exchangeId?: string;
	apiKey?: string;
	secret?: string;
	password?: string;
} {
	const config: {
		exchangeId?: string;
		apiKey?: string;
		secret?: string;
		password?: string;
	} = {};

	if (isObject(process.env)) {
		if (typeof process.env.CCXT_DEFAULT_EXCHANGE === "string") {
			config.exchangeId = process.env.CCXT_DEFAULT_EXCHANGE;
		}
		if (typeof process.env.CCXT_API_KEY === "string") {
			config.apiKey = process.env.CCXT_API_KEY;
		}
		if (typeof process.env.CCXT_SECRET === "string") {
			config.secret = process.env.CCXT_SECRET;
		}
		if (typeof process.env.CCXT_PASSWORD === "string") {
			config.password = process.env.CCXT_PASSWORD;
		}
	}

	return config;
}
