// Demo Data Provider
// Generates realistic market data for testing/demo purposes
// No API key required

import type {
	MarketDataProvider,
	OHLCVData,
	ProviderInfo,
	QuoteData,
	SymbolResult,
	TimeframeValue,
} from "./types";

// Seeded random number generator for reproducibility
function seededRandom(seed: number): () => number {
	return () => {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	};
}

// Predefined symbols with realistic base prices
const SYMBOL_CONFIG: Record<
	string,
	{
		name: string;
		type: SymbolResult["type"];
		basePrice: number;
		volatility: number;
		exchange?: string;
	}
> = {
	// Crypto
	"BTC/USD": { name: "Bitcoin", type: "crypto", basePrice: 67500, volatility: 0.03 },
	"ETH/USD": { name: "Ethereum", type: "crypto", basePrice: 3450, volatility: 0.035 },
	"SOL/USD": { name: "Solana", type: "crypto", basePrice: 178, volatility: 0.045 },
	"XRP/USD": { name: "Ripple", type: "crypto", basePrice: 0.52, volatility: 0.04 },
	"BNB/USD": { name: "Binance Coin", type: "crypto", basePrice: 580, volatility: 0.035 },
	"ADA/USD": { name: "Cardano", type: "crypto", basePrice: 0.45, volatility: 0.042 },
	"DOGE/USD": { name: "Dogecoin", type: "crypto", basePrice: 0.12, volatility: 0.05 },
	"DOT/USD": { name: "Polkadot", type: "crypto", basePrice: 7.2, volatility: 0.04 },

	// US Stocks
	AAPL: {
		name: "Apple Inc.",
		type: "stock",
		basePrice: 189,
		volatility: 0.015,
		exchange: "NASDAQ",
	},
	GOOGL: {
		name: "Alphabet Inc.",
		type: "stock",
		basePrice: 175,
		volatility: 0.018,
		exchange: "NASDAQ",
	},
	MSFT: { name: "Microsoft", type: "stock", basePrice: 420, volatility: 0.014, exchange: "NASDAQ" },
	TSLA: {
		name: "Tesla Inc.",
		type: "stock",
		basePrice: 248,
		volatility: 0.028,
		exchange: "NASDAQ",
	},
	NVDA: { name: "NVIDIA", type: "stock", basePrice: 880, volatility: 0.025, exchange: "NASDAQ" },
	AMZN: { name: "Amazon", type: "stock", basePrice: 185, volatility: 0.016, exchange: "NASDAQ" },
	META: {
		name: "Meta Platforms",
		type: "stock",
		basePrice: 505,
		volatility: 0.02,
		exchange: "NASDAQ",
	},
	JPM: {
		name: "JPMorgan Chase",
		type: "stock",
		basePrice: 198,
		volatility: 0.012,
		exchange: "NYSE",
	},
	V: { name: "Visa Inc.", type: "stock", basePrice: 280, volatility: 0.011, exchange: "NYSE" },
	JNJ: {
		name: "Johnson & Johnson",
		type: "stock",
		basePrice: 158,
		volatility: 0.01,
		exchange: "NYSE",
	},

	// European Stocks
	"NESN.SW": { name: "Nestlé", type: "stock", basePrice: 98, volatility: 0.01, exchange: "SIX" },
	"ROG.SW": { name: "Roche", type: "stock", basePrice: 235, volatility: 0.012, exchange: "SIX" },
	"NOVN.SW": { name: "Novartis", type: "stock", basePrice: 85, volatility: 0.011, exchange: "SIX" },
	SAP: { name: "SAP SE", type: "stock", basePrice: 175, volatility: 0.015, exchange: "XETRA" },
	ASML: {
		name: "ASML Holding",
		type: "stock",
		basePrice: 950,
		volatility: 0.022,
		exchange: "EURONEXT",
	},

	// Indices
	SPX: { name: "S&P 500", type: "index", basePrice: 5200, volatility: 0.008 },
	DJI: { name: "Dow Jones", type: "index", basePrice: 39000, volatility: 0.007 },
	IXIC: { name: "NASDAQ Composite", type: "index", basePrice: 16500, volatility: 0.01 },
	"SMI.SW": { name: "SMI", type: "index", basePrice: 11500, volatility: 0.008 },
	DAX: { name: "DAX", type: "index", basePrice: 18500, volatility: 0.009 },

	// Forex
	"EUR/USD": { name: "Euro/US Dollar", type: "fx", basePrice: 1.085, volatility: 0.003 },
	"GBP/USD": { name: "British Pound/US Dollar", type: "fx", basePrice: 1.27, volatility: 0.004 },
	"USD/CHF": { name: "US Dollar/Swiss Franc", type: "fx", basePrice: 0.88, volatility: 0.003 },
	"USD/JPY": { name: "US Dollar/Japanese Yen", type: "fx", basePrice: 155, volatility: 0.004 },
	"EUR/CHF": { name: "Euro/Swiss Franc", type: "fx", basePrice: 0.955, volatility: 0.002 },

	// Commodities
	"XAU/USD": { name: "Gold", type: "commodity", basePrice: 2350, volatility: 0.012 },
	"XAG/USD": { name: "Silver", type: "commodity", basePrice: 28, volatility: 0.02 },
	CL: { name: "Crude Oil WTI", type: "commodity", basePrice: 78, volatility: 0.025 },
};

export class DemoProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "demo",
		displayName: "Demo Data",
		supportedAssets: ["stock", "crypto", "fx", "index", "etf", "commodity"],
		requiresAuth: false,
		rateLimit: { requests: 999999, period: "day" },
		freePlan: true,
		documentation: "Internal demo data generator - no API key required",
	};

	async isAvailable(): Promise<boolean> {
		return true;
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		const config = SYMBOL_CONFIG[symbol] || {
			name: symbol,
			type: "stock" as const,
			basePrice: 100,
			volatility: 0.02,
		};

		const timeframeMs: Record<TimeframeValue, number> = {
			"1m": 60 * 1000,
			"3m": 3 * 60 * 1000,
			"5m": 5 * 60 * 1000,
			"15m": 15 * 60 * 1000,
			"30m": 30 * 60 * 1000,
			"1H": 60 * 60 * 1000,
			"2H": 2 * 60 * 60 * 1000,
			"4H": 4 * 60 * 60 * 1000,
			"1D": 24 * 60 * 60 * 1000,
			"1W": 7 * 24 * 60 * 60 * 1000,
			"1M": 30 * 24 * 60 * 60 * 1000,
		};

		const timeframeMsValue = timeframeMs[timeframe];

		// Create a seed based on symbol and timeframe for reproducibility
		let seed = 0;
		for (let i = 0; i < symbol.length; i++) {
			seed += symbol.charCodeAt(i);
		}
		seed += timeframe.charCodeAt(0);
		const random = seededRandom(seed);

		const candles: OHLCVData[] = [];
		let currentPrice = config.basePrice;
		let trend = 0;
		const now = Date.now();
		let currentTime = now - limit * timeframeMsValue;

		for (let i = 0; i < limit; i++) {
			// Random trend change
			if (random() < 0.1) {
				trend = (random() - 0.5) * 0.002;
			}

			// Price movement based on volatility and trend
			const change = (random() - 0.5 + trend) * config.volatility * currentPrice;
			const open = currentPrice;
			const close = currentPrice + change;

			// High and low with some randomness
			const range = Math.abs(change) + currentPrice * config.volatility * random() * 0.5;
			const high = Math.max(open, close) + range * random() * 0.5;
			const low = Math.min(open, close) - range * random() * 0.5;

			// Volume (higher on bigger moves)
			const baseVolume = config.type === "crypto" ? 1000000 : 5000000;
			const volume = baseVolume * (0.5 + random()) * (1 + Math.abs(change / currentPrice) * 10);

			candles.push({
				time: Math.floor(currentTime / 1000),
				open: parseFloat(open.toFixed(config.basePrice < 1 ? 4 : 2)),
				high: parseFloat(high.toFixed(config.basePrice < 1 ? 4 : 2)),
				low: parseFloat(low.toFixed(config.basePrice < 1 ? 4 : 2)),
				close: parseFloat(close.toFixed(config.basePrice < 1 ? 4 : 2)),
				volume: Math.floor(volume),
			});

			currentPrice = close;
			currentTime += timeframeMsValue;
		}

		return candles;
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		const q = query.toUpperCase();
		const results: SymbolResult[] = [];

		for (const [symbol, config] of Object.entries(SYMBOL_CONFIG)) {
			if (symbol.toUpperCase().includes(q) || config.name.toUpperCase().includes(q)) {
				results.push({
					symbol,
					name: config.name,
					type: config.type,
					exchange: config.exchange,
				});
			}
		}

		return results.slice(0, 20);
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		const _config = SYMBOL_CONFIG[symbol] || {
			name: symbol,
			type: "stock" as const,
			basePrice: 100,
			volatility: 0.02,
		};

		// Get latest candle data
		const candles = await this.fetchOHLCV(symbol, "1D", 2);
		const lastCandle = candles[candles.length - 1];
		const prevCandle = candles[candles.length - 2] || lastCandle;

		const change = lastCandle.close - prevCandle.close;
		const changePercent = prevCandle.close ? (change / prevCandle.close) * 100 : 0;

		return {
			symbol,
			price: lastCandle.close,
			change,
			changePercent,
			high: lastCandle.high,
			low: lastCandle.low,
			open: lastCandle.open,
			volume: lastCandle.volume,
			timestamp: lastCandle.time,
		};
	}
}

export default DemoProvider;
