const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";
const DEFAULT_CACHE_MS = 300_000;

export type GeopoliticalContextSource = "all" | "cfr" | "crisiswatch";

interface GatewayContextItem {
	id: string;
	source: string;
	title: string;
	url: string;
	summary?: string;
	publishedAt?: string;
	region?: string;
}

interface GatewayContextResponse {
	success: boolean;
	data?: {
		source: string;
		filters: {
			source: string;
			query?: string;
			region?: string;
			limit: number;
		};
		items: GatewayContextItem[];
	};
	error?: string;
}

export interface ContextBridgeFilters {
	source?: GeopoliticalContextSource;
	q?: string;
	region?: string;
	limit?: number;
	requestId?: string;
	userRole?: string;
}

export interface ContextBridgeResult {
	source: GeopoliticalContextSource;
	filters: {
		source: GeopoliticalContextSource;
		q?: string;
		region?: string;
		limit: number;
	};
	items: GatewayContextItem[];
}

interface CacheEntry {
	expiresAt: number;
	value: ContextBridgeResult;
}

const cache = new Map<string, CacheEntry>();

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function normalizeSource(raw?: string): GeopoliticalContextSource {
	const normalized = raw?.trim().toLowerCase();
	if (normalized === "cfr" || normalized === "crisiswatch") {
		return normalized;
	}
	return "all";
}

function normalizeText(raw?: string): string | undefined {
	const trimmed = raw?.trim();
	return trimmed ? trimmed : undefined;
}

function normalizeLimit(raw?: number): number {
	if (!Number.isFinite(raw)) return 12;
	return clamp(Math.floor(raw ?? 12), 1, 100);
}

function buildCacheKey(input: {
	baseURL: string;
	source: GeopoliticalContextSource;
	q?: string;
	region?: string;
	limit: number;
}): string {
	return JSON.stringify(input);
}

export async function fetchGeopoliticalContextViaGateway(
	filters: ContextBridgeFilters,
): Promise<ContextBridgeResult> {
	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const source = normalizeSource(filters.source);
	const q = normalizeText(filters.q);
	const region = normalizeText(filters.region);
	const limit = normalizeLimit(filters.limit);
	const requestId = filters.requestId?.trim() || "";
	const userRole = filters.userRole?.trim() || "";

	const cacheTTL = clamp(
		Number(process.env.GEOPOLITICAL_CONTEXT_CACHE_MS || DEFAULT_CACHE_MS),
		0,
		30 * 60_000,
	);
	const cacheKey = buildCacheKey({
		baseURL: gatewayBaseURL,
		source,
		q,
		region,
		limit,
	});

	const now = Date.now();
	if (cacheTTL > 0) {
		const existing = cache.get(cacheKey);
		if (existing && existing.expiresAt > now) {
			return existing.value;
		}
	}

	const endpoint = new URL("/api/v1/geopolitical/context", gatewayBaseURL);
	endpoint.searchParams.set("source", source);
	endpoint.searchParams.set("limit", String(limit));
	if (q) endpoint.searchParams.set("q", q);
	if (region) endpoint.searchParams.set("region", region);

	const headers: Record<string, string> = { Accept: "application/json" };
	if (requestId) headers["X-Request-ID"] = requestId;
	if (userRole) headers["X-User-Role"] = userRole;
	const response = await fetch(endpoint.toString(), {
		method: "GET",
		headers,
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error(`Go geopolitical context request failed (${response.status})`);
	}

	const payload = (await response.json()) as GatewayContextResponse;
	if (!payload.success || !payload.data || !Array.isArray(payload.data.items)) {
		throw new Error(payload.error || "Invalid geopolitical context gateway response");
	}

	const result: ContextBridgeResult = {
		source,
		filters: {
			source,
			q,
			region,
			limit,
		},
		items: payload.data.items
			.map((item) => ({
				id: item.id?.trim() || "",
				source: item.source?.trim().toLowerCase() || "unknown",
				title: item.title?.trim() || "",
				url: item.url?.trim() || "",
				summary: item.summary?.trim() || undefined,
				publishedAt: item.publishedAt?.trim() || undefined,
				region: item.region?.trim() || undefined,
			}))
			.filter((item) => item.id && item.title && item.url),
	};

	if (cacheTTL > 0) {
		cache.set(cacheKey, {
			expiresAt: now + cacheTTL,
			value: result,
		});
	}

	return result;
}
