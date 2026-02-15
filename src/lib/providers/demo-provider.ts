// Demo Provider - Fallback with realistic market data
// No API key required - generates realistic demo data

import type { AssetType, MarketDataProvider, OHLCVData, QuoteData, SymbolResult } from "./types";

interface SymbolConfig {
	symbol: string;
	name: string;
	type: AssetType;
	basePrice: number;
	volatility: number;
	trend: number;
}

const DEMO_SYMBOLS: SymbolConfig[] = [
	// Crypto
	{
		symbol: "BTC/USD",
		name: "Bitcoin",
		type: "crypto",
		basePrice: 67500,
		volatility: 0.03,
		trend: 0.0001,
	},
	{
		symbol: "ETH/USD",
		name: "Ethereum",
		type: "crypto",
		basePrice: 3450,
		volatility: 0.035,
		trend: 0.00015,
	},
	{
		symbol: "SOL/USD",
		name: "Solana",
		type: "crypto",
		basePrice: 178,
		volatility: 0.045,
		trend: 0.0002,
	},
	{
		symbol: "XRP/USD",
		name: "Ripple",
		type: "crypto",
		basePrice: 0.52,
		volatility: 0.04,
		trend: 0.00005,
	},
	// Stocks
	{
		symbol: "AAPL",
		name: "Apple Inc.",
		type: "stock",
		basePrice: 189,
		volatility: 0.015,
		trend: 0.0001,
	},
	{
		symbol: "GOOGL",
		name: "Alphabet Inc.",
		type: "stock",
		basePrice: 175,
		volatility: 0.018,
		trend: 0.00008,
	},
	{
		symbol: "MSFT",
		name: "Microsoft",
		type: "stock",
		basePrice: 420,
		volatility: 0.014,
		trend: 0.00012,
	},
	{
		symbol: "TSLA",
		name: "Tesla Inc.",
		type: "stock",
		basePrice: 248,
		volatility: 0.028,
		trend: -0.00005,
	},
	{
		symbol: "NVDA",
		name: "NVIDIA",
		type: "stock",
		basePrice: 880,
		volatility: 0.025,
		trend: 0.0002,
	},
	{
		symbol: "AMZN",
		name: "Amazon",
		type: "stock",
		basePrice: 185,
		volatility: 0.016,
		trend: 0.0001,
	},
	// FX
	{
		symbol: "EUR/USD",
		name: "Euro/US Dollar",
		type: "fx",
		basePrice: 1.085,
		volatility: 0.003,
		trend: 0.00001,
	},
	{
		symbol: "GBP/USD",
		name: "British Pound/US Dollar",
		type: "fx",
		basePrice: 1.272,
		volatility: 0.004,
		trend: 0.00002,
	},
	{
		symbol: "USD/JPY",
		name: "US Dollar/Japanese Yen",
		type: "fx",
		basePrice: 154.5,
		volatility: 0.003,
		trend: -0.00001,
	},
	// Indices
	{
		symbol: "SPX",
		name: "S&P 500 Index",
		type: "index",
		basePrice: 5320,
		volatility: 0.008,
		trend: 0.00005,
	},
	{
		symbol: "DJI",
		name: "Dow Jones Industrial Average",
		type: "index",
		basePrice: 39500,
		volatility: 0.006,
		trend: 0.00003,
	},
	{
		symbol: "NDX",
		name: "Nasdaq 100 Index",
		type: "index",
		basePrice: 18600,
		volatility: 0.01,
		trend: 0.00008,
	},
];

export class DemoProvider implements MarketDataProvider {
	readonly info = {
		name: "demo",
		displayName: "Demo Data",
		supportedAssets: ["stock", "crypto", "fx", "index", "etf", "commodity"] as AssetType[],
		requiresAuth: false,
		rateLimit: { requests: 999999, period: "day" },
		freePlan: true,
		documentation: "Internal demo data generator",
	};
	readonly name = "demo";
	readonly supportedAssets: AssetType[] = ["stock", "crypto", "fx", "index"];
	readonly requiresAuth = false;
	readonly rateLimit = { requests: 1000, period: "day" };

	// Seeded random number generator for reproducible data
	private seededRandom(seed: number): () => number {
		return () => {
			seed = (seed * 9301 + 49297) % 233280;
			return seed / 233280;
		};
	}

	async isAvailable(): Promise<boolean> {
		return true;
	}

	private getSymbolConfig(symbol: string): SymbolConfig {
		return (
			DEMO_SYMBOLS.find((s) => s.symbol === symbol) || {
				symbol,
				name: symbol,
				type: "stock" as AssetType,
				basePrice: 100,
				volatility: 0.02,
				trend: 0,
			}
		);
	}

	private getTimeframeMs(timeframe: string): number {
		const mapping: Record<string, number> = {
			"1m": 60 * 1000,
			"5m": 5 * 60 * 1000,
			"15m": 15 * 60 * 1000,
			"30m": 30 * 60 * 1000,
			"1H": 60 * 60 * 1000,
			"4H": 4 * 60 * 60 * 1000,
			"1D": 24 * 60 * 60 * 1000,
			"1W": 7 * 24 * 60 * 60 * 1000,
		};
		return mapping[timeframe] || 60 * 60 * 1000;
	}

	async fetchOHLCV(symbol: string, timeframe: string, limit: number): Promise<OHLCVData[]> {
		const config = this.getSymbolConfig(symbol);
		const timeframeMs = this.getTimeframeMs(timeframe);

		// Create a seed based on symbol and timeframe for reproducibility
		const seedString = symbol + timeframe;
		let seed = 0;
		for (let i = 0; i < seedString.length; i++) {
			seed += seedString.charCodeAt(i);
		}
		const random = this.seededRandom(seed);

		const candles: OHLCVData[] = [];
		const now = Date.now();
		let currentPrice = config.basePrice;
		let currentTrend = config.trend;

		// Start from past
		let currentTime = now - limit * timeframeMs;

		for (let i = 0; i < limit; i++) {
			// Random trend change
			if (random() < 0.1) {
				currentTrend = (random() - 0.5) * 0.001;
			}

			// Price movement based on volatility and trend
			const change = (random() - 0.5 + currentTrend) * config.volatility * currentPrice;
			const open = currentPrice;
			const close = currentPrice + change;

			// High and low with some randomness
			const range = Math.abs(change) + currentPrice * config.volatility * random() * 0.5;
			const high = Math.max(open, close) + range * random() * 0.5;
			const low = Math.min(open, close) - range * random() * 0.5;

			// Volume (higher on bigger moves)
			const baseVolume =
				config.type === "crypto"
					? 1000000
					: config.type === "fx"
						? 500000
						: config.type === "index"
							? 200000
							: 5000000;
			const volume = baseVolume * (0.5 + random()) * (1 + Math.abs(change / currentPrice) * 10);

			candles.push({
				time: Math.floor(currentTime / 1000), // Unix timestamp in seconds
				open: parseFloat(open.toFixed(config.basePrice < 1 ? 4 : config.basePrice < 10 ? 3 : 2)),
				high: parseFloat(high.toFixed(config.basePrice < 1 ? 4 : config.basePrice < 10 ? 3 : 2)),
				low: parseFloat(low.toFixed(config.basePrice < 1 ? 4 : config.basePrice < 10 ? 3 : 2)),
				close: parseFloat(close.toFixed(config.basePrice < 1 ? 4 : config.basePrice < 10 ? 3 : 2)),
				volume: Math.floor(volume),
			});

			currentPrice = close;
			currentTime += timeframeMs;
		}

		return candles;
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		const queryLower = query.toLowerCase();

		const results = DEMO_SYMBOLS.filter(
			(s) =>
				s.symbol.toLowerCase().includes(queryLower) || s.name.toLowerCase().includes(queryLower),
		);

		return results.map((s) => ({
			symbol: s.symbol,
			name: s.name,
			type: s.type,
		}));
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		const _config = this.getSymbolConfig(symbol);

		// Get recent candles to calculate quote
		const candles = await this.fetchOHLCV(symbol, "1H", 24);
		const lastCandle = candles[candles.length - 1];
		const prevCandle = candles[candles.length - 2];

		const change = lastCandle.close - prevCandle.close;
		const changePercent = (change / prevCandle.close) * 100;

		const high24h = Math.max(...candles.map((c) => c.high));
		const low24h = Math.min(...candles.map((c) => c.low));
		const volume24h = candles.reduce((sum, c) => sum + c.volume, 0);

		return {
			symbol,
			price: lastCandle.close,
			change,
			changePercent,
			high: high24h,
			low: low24h,
			open: candles[0].open,
			volume: volume24h,
			timestamp: Date.now(),
		};
	}

	// Get all available symbols
	getAvailableSymbols(): SymbolResult[] {
		return DEMO_SYMBOLS.map((s) => ({
			symbol: s.symbol,
			name: s.name,
			type: s.type,
		}));
	}
}
