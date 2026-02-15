// Market Data Provider Index
// Exports all providers and a unified provider manager

export { AlphaVantageProvider } from "./alpha-vantage";
export { CCXTProvider } from "./ccxt";
export { CoinMarketCapProvider } from "./coinmarketcap";
export { DemoProvider } from "./demo";
export { ECBProvider } from "./ecb";
export { EODHDProvider } from "./eodhd";
export { FinageProvider } from "./finage";
export { FinnhubProvider } from "./finnhub";
export { FMPProvider } from "./fmp";
export { FREDProvider } from "./fred";
export { MarketstackProvider } from "./marketstack";
export { PolygonProvider } from "./polygon";
export { TwelveDataProvider } from "./twelve-data";
export * from "./types";
export { YahooUnofficialProvider } from "./yahoo-unofficial";
export { YFinanceBridgeProvider } from "./yfinance-bridge";

import { AlphaVantageProvider } from "./alpha-vantage";
import { CCXTProvider, isCcxtEnabled, parseCcxtConfigFromEnv } from "./ccxt";
import { CoinMarketCapProvider } from "./coinmarketcap";
import { DemoProvider } from "./demo";
import { ECBProvider } from "./ecb";
import { EODHDProvider } from "./eodhd";
import { FinageProvider } from "./finage";
import { FinnhubProvider } from "./finnhub";
import { FMPProvider } from "./fmp";
import { FREDProvider } from "./fred";
import { MarketstackProvider } from "./marketstack";
import { PolygonProvider } from "./polygon";
import { TwelveDataProvider } from "./twelve-data";
import type {
	MarketDataProvider,
	OHLCVData,
	OHLCVRequestOptions,
	QuoteData,
	SymbolResult,
	TimeframeValue,
} from "./types";
import { YahooUnofficialProvider } from "./yahoo-unofficial";
import { YFinanceBridgeProvider } from "./yfinance-bridge";

// Provider Priority Configuration
const DEFAULT_PRIORITY = [
	"twelvedata",
	"finnhub",
	"alphavantage",
	"polygon",
	"fmp",
	"eodhd",
	"marketstack",
	"ccxt",
	"coinmarketcap",
	"finage",
	"yahoo",
	"yfinance",
	"fred",
	"ecb",
	"demo",
];

export interface ProviderConfig {
	priority: string[];
	apiKeys: Record<string, string>;
	timeoutMs: number;
	circuitFailureThreshold: number;
	circuitOpenMs: number;
	quotesConcurrency: number;
}

interface ProviderRuntimeState {
	windowStartMs: number;
	requestCount: number;
	consecutiveFailures: number;
	openUntilMs: number;
}

function periodToMs(period: string): number {
	switch (period.toLowerCase()) {
		case "minute":
			return 60 * 1000;
		case "hour":
			return 60 * 60 * 1000;
		case "day":
			return 24 * 60 * 60 * 1000;
		case "month":
			return 30 * 24 * 60 * 60 * 1000;
		default:
			return 60 * 1000;
	}
}

export class ProviderManager {
	private providers: Map<string, MarketDataProvider> = new Map();
	private priority: string[];
	private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
	private providerState: Map<string, ProviderRuntimeState> = new Map();
	private cacheTTL = 60000; // 1 minute cache
	private timeoutMs: number;
	private circuitFailureThreshold: number;
	private circuitOpenMs: number;
	private quotesConcurrency: number;

	constructor(config?: Partial<ProviderConfig>) {
		const envPriority = process.env.DEFAULT_PROVIDER?.split(",")
			.map((item) => item.trim().toLowerCase())
			.filter(Boolean);
		this.priority =
			config?.priority || (envPriority && envPriority.length > 0 ? envPriority : DEFAULT_PRIORITY);
		this.timeoutMs = config?.timeoutMs ?? Number(process.env.PROVIDER_TIMEOUT_MS || 7000);
		this.circuitFailureThreshold =
			config?.circuitFailureThreshold ??
			Number(process.env.PROVIDER_CIRCUIT_FAILURE_THRESHOLD || 3);
		this.circuitOpenMs =
			config?.circuitOpenMs ?? Number(process.env.PROVIDER_CIRCUIT_OPEN_MS || 60000);
		this.quotesConcurrency = Math.max(
			1,
			config?.quotesConcurrency ?? Number(process.env.PROVIDER_QUOTES_CONCURRENCY || 6),
		);

		// Initialize providers with API keys
		const apiKeys = config?.apiKeys || {};

		this.providers.set("alphavantage", new AlphaVantageProvider(apiKeys.alphavantage));
		this.providers.set("finnhub", new FinnhubProvider(apiKeys.finnhub));
		this.providers.set("twelvedata", new TwelveDataProvider(apiKeys.twelvedata));
		this.providers.set("polygon", new PolygonProvider(apiKeys.polygon));
		this.providers.set("fmp", new FMPProvider(apiKeys.fmp));
		this.providers.set("eodhd", new EODHDProvider(apiKeys.eodhd));
		this.providers.set("marketstack", new MarketstackProvider(apiKeys.marketstack));
		if (isCcxtEnabled()) {
			this.providers.set("ccxt", new CCXTProvider(parseCcxtConfigFromEnv()));
		}
		this.providers.set("coinmarketcap", new CoinMarketCapProvider(apiKeys.coinmarketcap));
		this.providers.set("finage", new FinageProvider(apiKeys.finage));
		this.providers.set("yahoo", new YahooUnofficialProvider());
		this.providers.set("yfinance", new YFinanceBridgeProvider(apiKeys.yfinance));
		this.providers.set("fred", new FREDProvider(apiKeys.fred));
		this.providers.set("ecb", new ECBProvider());
		this.providers.set("demo", new DemoProvider());

		for (const key of this.providers.keys()) {
			this.providerState.set(key, {
				windowStartMs: Date.now(),
				requestCount: 0,
				consecutiveFailures: 0,
				openUntilMs: 0,
			});
		}
	}

	getProvider(name: string): MarketDataProvider | undefined {
		return this.providers.get(name);
	}

	getAllProviders(): { name: string; provider: MarketDataProvider }[] {
		return Array.from(this.providers.entries()).map(([name, provider]) => ({ name, provider }));
	}

	async getAvailableProviders(): Promise<string[]> {
		const available: string[] = [];

		for (const [name, provider] of this.providers) {
			if (this.isCircuitOpen(name)) {
				continue;
			}
			try {
				if (
					await this.withTimeout(
						provider.isAvailable(),
						this.timeoutMs,
						`${name} availability timeout`,
					)
				) {
					this.markProviderSuccess(name);
					available.push(name);
				} else {
					this.markProviderFailure(name);
				}
			} catch {
				this.markProviderFailure(name);
			}
		}

		return available;
	}

	private getCached<T>(key: string): T | null {
		const cached = this.cache.get(key);
		if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
			return cached.data as T;
		}
		return null;
	}

	private setCache(key: string, data: unknown): void {
		this.cache.set(key, { data, timestamp: Date.now() });
	}

	private getProviderRateInfo(name: string): { requests: number; periodMs: number } | null {
		const provider = this.providers.get(name);
		if (!provider) return null;
		const requests = provider.info.rateLimit.requests;
		const periodMs = periodToMs(provider.info.rateLimit.period);
		if (
			!Number.isFinite(requests) ||
			requests <= 0 ||
			!Number.isFinite(periodMs) ||
			periodMs <= 0
		) {
			return null;
		}
		return { requests, periodMs };
	}

	private isCircuitOpen(name: string): boolean {
		const state = this.providerState.get(name);
		if (!state) return false;
		return state.openUntilMs > Date.now();
	}

	private isRateLimited(name: string): boolean {
		const state = this.providerState.get(name);
		const info = this.getProviderRateInfo(name);
		if (!state || !info) return false;

		const now = Date.now();
		if (now - state.windowStartMs >= info.periodMs) {
			state.windowStartMs = now;
			state.requestCount = 0;
		}

		return state.requestCount >= info.requests;
	}

	private consumeRate(name: string): void {
		const state = this.providerState.get(name);
		const info = this.getProviderRateInfo(name);
		if (!state || !info) return;
		const now = Date.now();
		if (now - state.windowStartMs >= info.periodMs) {
			state.windowStartMs = now;
			state.requestCount = 0;
		}
		state.requestCount += 1;
	}

	private markProviderSuccess(name: string): void {
		const state = this.providerState.get(name);
		if (!state) return;
		state.consecutiveFailures = 0;
		state.openUntilMs = 0;
	}

	private markProviderFailure(name: string): void {
		const state = this.providerState.get(name);
		if (!state) return;
		state.consecutiveFailures += 1;
		if (state.consecutiveFailures >= this.circuitFailureThreshold) {
			state.openUntilMs = Date.now() + this.circuitOpenMs;
		}
	}

	private async withTimeout<T>(
		promise: Promise<T>,
		timeoutMs: number,
		errorMessage: string,
	): Promise<T> {
		let timer: ReturnType<typeof setTimeout> | null = null;
		const timeoutPromise = new Promise<never>((_, reject) => {
			timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
		});
		try {
			const result = await Promise.race([promise, timeoutPromise]);
			return result as T;
		} finally {
			if (timer) clearTimeout(timer);
		}
	}

	private async executeProviderCall<T>(
		providerName: string,
		call: () => Promise<T>,
		operationLabel: string,
	): Promise<T> {
		if (this.isCircuitOpen(providerName)) {
			throw new Error(`${providerName} circuit open`);
		}
		if (this.isRateLimited(providerName)) {
			throw new Error(`${providerName} local rate-limit reached`);
		}

		this.consumeRate(providerName);
		try {
			const result = await this.withTimeout(
				call(),
				this.timeoutMs,
				`${providerName} ${operationLabel} timeout`,
			);
			this.markProviderSuccess(providerName);
			return result;
		} catch (error) {
			this.markProviderFailure(providerName);
			throw error;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
		options?: OHLCVRequestOptions,
	): Promise<{ data: OHLCVData[]; provider: string }> {
		const startKey = options?.start ?? "";
		const endKey = options?.end ?? "";
		const cacheKey = `ohlcv:${symbol}:${timeframe}:${limit}:${startKey}:${endKey}`;
		const cached = this.getCached<{ data: OHLCVData[]; provider: string }>(cacheKey);
		if (cached) return cached;

		const errors: string[] = [];

		for (const providerName of this.priority) {
			const provider = this.providers.get(providerName);
			if (!provider) continue;

			try {
				const data = await this.executeProviderCall(
					providerName,
					() => provider.fetchOHLCV(symbol, timeframe, limit, options),
					"ohlcv",
				);
				if (data && data.length > 0) {
					const result = { data, provider: providerName };
					this.setCache(cacheKey, result);
					return result;
				}
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : "unknown error";
				errors.push(`${providerName}: ${message}`);
			}
		}

		throw new Error(`All providers failed for ${symbol}: ${errors.join("; ")}`);
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		const cacheKey = `search:${query}`;
		const cached = this.getCached<SymbolResult[]>(cacheKey);
		if (cached) return cached;

		const results: SymbolResult[] = [];
		const seen = new Set<string>();

		for (const providerName of this.priority) {
			const provider = this.providers.get(providerName);
			if (!provider) continue;

			try {
				const symbols = await this.executeProviderCall(
					providerName,
					() => provider.searchSymbols(query),
					"search",
				);
				for (const s of symbols) {
					const key = `${s.symbol}:${s.type}`;
					if (!seen.has(key)) {
						seen.add(key);
						results.push({ ...s, exchange: s.exchange || providerName.toUpperCase() });
					}
				}
			} catch {
				// Continue with next provider
			}
		}

		this.setCache(cacheKey, results);
		return results;
	}

	async getQuote(symbol: string): Promise<{ data: QuoteData; provider: string }> {
		const cacheKey = `quote:${symbol}`;
		const cached = this.getCached<{ data: QuoteData; provider: string }>(cacheKey);
		if (cached) return cached;

		const errors: string[] = [];

		for (const providerName of this.priority) {
			const provider = this.providers.get(providerName);
			if (!provider) continue;

			try {
				const data = await this.executeProviderCall(
					providerName,
					() => provider.getQuote(symbol),
					"quote",
				);
				const result = { data, provider: providerName };
				this.setCache(cacheKey, result);
				return result;
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : "unknown error";
				errors.push(`${providerName}: ${message}`);
			}
		}

		throw new Error(`All providers failed for ${symbol}: ${errors.join("; ")}`);
	}

	// Get quotes for multiple symbols
	async getQuotes(symbols: string[]): Promise<Map<string, QuoteData>> {
		const results = new Map<string, QuoteData>();

		const queue = [...symbols];
		const workers = Array.from(
			{ length: Math.min(this.quotesConcurrency, queue.length) },
			async () => {
				while (queue.length > 0) {
					const symbol = queue.shift();
					if (!symbol) continue;
					try {
						const { data } = await this.getQuote(symbol);
						results.set(symbol, data);
					} catch {
						// Skip failed symbols
					}
				}
			},
		);

		await Promise.all(workers);

		return results;
	}

	// Get provider info
	getProviderInfo(): Record<string, { info: unknown; available: boolean | null }> {
		const info: Record<string, { info: unknown; available: boolean | null }> = {};

		for (const [name, provider] of this.providers) {
			info[name] = {
				info: provider.info,
				available: null, // Will be checked async
			};
		}

		return info;
	}
}

// Singleton instance
let managerInstance: ProviderManager | null = null;

export function getProviderManager(config?: Partial<ProviderConfig>): ProviderManager {
	if (!managerInstance) {
		managerInstance = new ProviderManager(config);
	}
	return managerInstance;
}

export function resetProviderManager(): void {
	managerInstance = null;
}
