import type {
	MarketDataProvider,
	OHLCVData,
	ProviderInfo,
	QuoteData,
	SymbolResult,
	TimeframeValue,
} from "./types";

function parseDateToUnix(value: string): number {
	return Math.floor(new Date(value).getTime() / 1000);
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function timeframeToFrequency(timeframe: TimeframeValue): string {
	switch (timeframe) {
		case "1D":
			return "d";
		case "1W":
			return "w";
		case "1M":
			return "m";
		default:
			return "d";
	}
}

function limitToStartDate(limit: number, timeframe: TimeframeValue): string {
	const now = new Date();
	const daysPerBar = timeframe === "1M" ? 30 : timeframe === "1W" ? 7 : 1;
	const start = new Date(now.getTime() - Math.max(limit, 1) * daysPerBar * 24 * 60 * 60 * 1000);
	return start.toISOString().split("T")[0];
}

export class FREDProvider implements MarketDataProvider {
	readonly info: ProviderInfo = {
		name: "fred",
		displayName: "FRED (St. Louis Fed)",
		supportedAssets: ["index"],
		requiresAuth: true,
		rateLimit: { requests: 1000000, period: "day" },
		freePlan: true,
		documentation: "https://fred.stlouisfed.org/docs/api/fred/",
	};

	private apiKey: string;
	private baseUrl = "https://api.stlouisfed.org/fred";

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.FRED_API_KEY || "";
	}

	async isAvailable(): Promise<boolean> {
		if (!this.apiKey) return false;
		try {
			const url = `${this.baseUrl}/series/observations?series_id=DGS10&api_key=${this.apiKey}&file_type=json&limit=1`;
			const response = await fetch(url);
			return response.ok;
		} catch {
			return false;
		}
	}

	async fetchOHLCV(
		symbol: string,
		timeframe: TimeframeValue,
		limit: number = 300,
	): Promise<OHLCVData[]> {
		if (!this.apiKey) throw new Error("FRED API key missing");
		const frequency = timeframeToFrequency(timeframe);
		const observationStart = limitToStartDate(limit, timeframe);
		const url = `${this.baseUrl}/series/observations?series_id=${encodeURIComponent(symbol)}&api_key=${this.apiKey}&file_type=json&frequency=${frequency}&observation_start=${observationStart}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`FRED OHLCV failed (${response.status})`);
		}
		const data = await response.json();
		const rows = Array.isArray(data?.observations) ? data.observations : [];
		if (rows.length === 0) {
			throw new Error("No FRED observations available");
		}

		const candles: OHLCVData[] = rows
			.slice(-limit)
			.map((obs: unknown) => {
				const row = asRecord(obs);
				const value = Number(row?.value ?? 0);
				return {
					time: parseDateToUnix(String(row?.date ?? "")),
					open: value,
					high: value,
					low: value,
					close: value,
					volume: 0,
				};
			})
			.filter((item: OHLCVData) => Number.isFinite(item.time) && Number.isFinite(item.close));

		if (candles.length === 0) {
			throw new Error("FRED data contains no numeric observations");
		}

		return candles;
	}

	async searchSymbols(query: string): Promise<SymbolResult[]> {
		if (!this.apiKey) return [];
		const url = `${this.baseUrl}/series/search?search_text=${encodeURIComponent(query)}&api_key=${this.apiKey}&file_type=json&limit=20`;
		const response = await fetch(url);
		if (!response.ok) return [];
		const data = await response.json();
		const rows = Array.isArray(data?.seriess) ? data.seriess : [];

		return rows.slice(0, 20).map((item: unknown) => {
			const row = asRecord(item);
			return {
				symbol: String(row?.id ?? ""),
				name: String(row?.title ?? row?.id ?? ""),
				type: "index" as const,
				exchange: "FRED",
				currency: String(row?.units_short ?? ""),
			};
		});
	}

	async getQuote(symbol: string): Promise<QuoteData> {
		if (!this.apiKey) throw new Error("FRED API key missing");
		const url = `${this.baseUrl}/series/observations?series_id=${encodeURIComponent(symbol)}&api_key=${this.apiKey}&file_type=json&sort_order=desc&limit=2`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`FRED quote failed (${response.status})`);
		}
		const data = await response.json();
		const rows = Array.isArray(data?.observations) ? data.observations : [];
		if (rows.length === 0) {
			throw new Error("No FRED quote data available");
		}

		const latest = Number(rows[0].value);
		const previous = Number(rows[1]?.value ?? latest);
		const change = latest - previous;
		const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
		const ts = parseDateToUnix(rows[0].date);

		return {
			symbol,
			price: latest,
			change,
			changePercent,
			high: latest,
			low: latest,
			open: previous,
			volume: 0,
			timestamp: ts,
		};
	}
}

export default FREDProvider;
