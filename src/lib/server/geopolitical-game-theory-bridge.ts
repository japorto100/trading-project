const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";
const DEFAULT_CACHE_MS = 120_000;

interface GatewayGameTheoryItem {
	id: string;
	eventId: string;
	eventTitle: string;
	region: string;
	marketBias: "risk_on" | "risk_off" | "neutral" | string;
	impactScore: number;
	confidence: number;
	drivers: string[];
	symbols: string[];
	eventDate: string;
}

interface GatewayGameTheoryResponse {
	success: boolean;
	data?: {
		source: string;
		filters: {
			country?: string;
			region?: string;
			eventType?: string;
			subEventType?: string;
			startDate?: string;
			endDate?: string;
			limit: number;
		};
		summary: {
			analyzedEvents: number;
			avgImpactScore: number;
			riskOnCount: number;
			riskOffCount: number;
			neutralCount: number;
			topRegion?: string;
		};
		items: GatewayGameTheoryItem[];
	};
	error?: string;
}

export interface GameTheoryBridgeFilters {
	country?: string;
	region?: string;
	eventType?: string;
	subEventType?: string;
	from?: string;
	to?: string;
	limit?: number;
}

export interface GameTheoryBridgeResult {
	source: string;
	filters: {
		country?: string;
		region?: string;
		eventType?: string;
		subEventType?: string;
		from?: string;
		to?: string;
		limit: number;
	};
	summary: {
		analyzedEvents: number;
		avgImpactScore: number;
		riskOnCount: number;
		riskOffCount: number;
		neutralCount: number;
		topRegion?: string;
	};
	items: Array<{
		id: string;
		eventId: string;
		eventTitle: string;
		region: string;
		marketBias: "risk_on" | "risk_off" | "neutral";
		impactScore: number;
		confidence: number;
		drivers: string[];
		symbols: string[];
		eventDate: string;
	}>;
}

interface CacheEntry {
	expiresAt: number;
	value: GameTheoryBridgeResult;
}

const cache = new Map<string, CacheEntry>();

function normalizeText(raw?: string): string | undefined {
	const trimmed = raw?.trim();
	return trimmed ? trimmed : undefined;
}

function normalizeDate(raw?: string): string | undefined {
	const trimmed = raw?.trim();
	if (!trimmed) return undefined;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
	return trimmed;
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function normalizeLimit(raw?: number): number {
	if (!Number.isFinite(raw)) return 50;
	return clamp(Math.floor(raw ?? 50), 1, 500);
}

function normalizeBias(raw: string): "risk_on" | "risk_off" | "neutral" {
	const normalized = raw.trim().toLowerCase();
	if (normalized === "risk_on" || normalized === "risk_off") {
		return normalized;
	}
	return "neutral";
}

function cacheKey(input: {
	baseURL: string;
	country?: string;
	region?: string;
	eventType?: string;
	subEventType?: string;
	from?: string;
	to?: string;
	limit: number;
}): string {
	return JSON.stringify(input);
}

export async function fetchGeopoliticalGameTheoryViaGateway(
	filters: GameTheoryBridgeFilters,
): Promise<GameTheoryBridgeResult> {
	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const country = normalizeText(filters.country);
	const region = normalizeText(filters.region);
	const eventType = normalizeText(filters.eventType);
	const subEventType = normalizeText(filters.subEventType);
	const from = normalizeDate(filters.from);
	const to = normalizeDate(filters.to);
	const limit = normalizeLimit(filters.limit);

	const cacheTTL = clamp(
		Number(process.env.GEOPOLITICAL_GAMETHEORY_CACHE_MS || DEFAULT_CACHE_MS),
		0,
		30 * 60_000,
	);
	const key = cacheKey({
		baseURL: gatewayBaseURL,
		country,
		region,
		eventType,
		subEventType,
		from,
		to,
		limit,
	});

	const now = Date.now();
	if (cacheTTL > 0) {
		const existing = cache.get(key);
		if (existing && existing.expiresAt > now) {
			return existing.value;
		}
	}

	const endpoint = new URL("/api/v1/geopolitical/game-theory/impact", gatewayBaseURL);
	if (country) endpoint.searchParams.set("country", country);
	if (region) endpoint.searchParams.set("region", region);
	if (eventType) endpoint.searchParams.set("eventType", eventType);
	if (subEventType) endpoint.searchParams.set("subEventType", subEventType);
	if (from) endpoint.searchParams.set("from", from);
	if (to) endpoint.searchParams.set("to", to);
	endpoint.searchParams.set("limit", String(limit));

	const response = await fetch(endpoint.toString(), {
		method: "GET",
		headers: { Accept: "application/json" },
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error(`Go game-theory request failed (${response.status})`);
	}

	const payload = (await response.json()) as GatewayGameTheoryResponse;
	if (!payload.success || !payload.data || !Array.isArray(payload.data.items)) {
		throw new Error(payload.error || "Invalid game-theory gateway response");
	}

	const result: GameTheoryBridgeResult = {
		source: payload.data.source?.trim() || "acled+game_theory_heuristic_v1",
		filters: {
			country: country ?? (payload.data.filters.country?.trim() || undefined),
			region: region ?? (payload.data.filters.region?.trim() || undefined),
			eventType: eventType ?? (payload.data.filters.eventType?.trim() || undefined),
			subEventType: subEventType ?? (payload.data.filters.subEventType?.trim() || undefined),
			from: from ?? (payload.data.filters.startDate?.trim() || undefined),
			to: to ?? (payload.data.filters.endDate?.trim() || undefined),
			limit,
		},
		summary: {
			analyzedEvents: Number(payload.data.summary.analyzedEvents) || 0,
			avgImpactScore: Number(payload.data.summary.avgImpactScore) || 0,
			riskOnCount: Number(payload.data.summary.riskOnCount) || 0,
			riskOffCount: Number(payload.data.summary.riskOffCount) || 0,
			neutralCount: Number(payload.data.summary.neutralCount) || 0,
			topRegion: payload.data.summary.topRegion?.trim() || undefined,
		},
		items: payload.data.items
			.map((item) => ({
				id: item.id?.trim() || "",
				eventId: item.eventId?.trim() || "",
				eventTitle: item.eventTitle?.trim() || "",
				region: item.region?.trim() || "Global",
				marketBias: normalizeBias(item.marketBias || "neutral"),
				impactScore: clamp(Number(item.impactScore) || 0, 0, 1),
				confidence: clamp(Number(item.confidence) || 0, 0, 1),
				drivers: Array.isArray(item.drivers)
					? item.drivers
							.map((driver) => driver?.trim())
							.filter((driver): driver is string => Boolean(driver))
					: [],
				symbols: Array.isArray(item.symbols)
					? item.symbols
							.map((symbol) => symbol?.trim())
							.filter((symbol): symbol is string => Boolean(symbol))
					: [],
				eventDate: item.eventDate?.trim() || "",
			}))
			.filter((item) => item.id && item.eventId && item.eventTitle),
	};

	if (cacheTTL > 0) {
		cache.set(key, { expiresAt: now + cacheTTL, value: result });
	}

	return result;
}
