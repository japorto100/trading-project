import type { GeoEvent, GeoSeverity } from "@/lib/geopolitical/types";

const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";
const DEFAULT_CACHE_MS = 60_000;
const ACLED_DASHBOARD_URL = "https://acleddata.com/dashboard/#/dashboard";
const GDELT_HOME_URL = "https://www.gdeltproject.org/";

export type ExternalGeopoliticalSource = "acled" | "gdelt";

interface GatewayEvent {
	id: string;
	url?: string;
	eventDate: string;
	country: string;
	region?: string;
	eventType: string;
	subEventType?: string;
	actor1?: string;
	actor2?: string;
	fatalities: number;
	location?: string;
	latitude?: number;
	longitude?: number;
	source?: string;
	notes?: string;
}

interface GatewayEventsResponse {
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
		items: GatewayEvent[];
	};
	error?: string;
}

export interface ExternalProxyFilters {
	source?: ExternalGeopoliticalSource;
	country?: string;
	region?: string;
	eventType?: string;
	subEventType?: string;
	from?: string;
	to?: string;
	page?: number;
	pageSize?: number;
	requestId?: string;
	userRole?: string;
}

export interface ExternalProxyMeta {
	source: ExternalGeopoliticalSource;
	page: number;
	pageSize: number;
	total: number;
	hasMore: boolean;
	filters: {
		country?: string;
		region?: string;
		eventType?: string;
		subEventType?: string;
		from?: string;
		to?: string;
	};
}

export interface ExternalProxyResult {
	events: GeoEvent[];
	meta: ExternalProxyMeta;
}

interface CacheEntry {
	expiresAt: number;
	value: ExternalProxyResult;
}

const cache = new Map<string, CacheEntry>();

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function normalizePage(raw?: number): number {
	if (!Number.isFinite(raw)) return 1;
	return clamp(Math.floor(raw ?? 1), 1, 200);
}

function normalizePageSize(raw?: number): number {
	if (!Number.isFinite(raw)) return 50;
	return clamp(Math.floor(raw ?? 50), 1, 200);
}

function normalizeDate(raw?: string): string | undefined {
	const trimmed = raw?.trim();
	if (!trimmed) return undefined;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
	return trimmed;
}

function normalizeText(raw?: string): string | undefined {
	const trimmed = raw?.trim();
	return trimmed ? trimmed : undefined;
}

function normalizeSource(raw?: string): ExternalGeopoliticalSource {
	const normalized = raw?.trim().toLowerCase();
	if (normalized === "gdelt") return "gdelt";
	return "acled";
}

function severityFromFatalities(fatalities: number): GeoSeverity {
	if (fatalities >= 100) return 5;
	if (fatalities >= 20) return 4;
	if (fatalities >= 5) return 3;
	if (fatalities >= 1) return 2;
	return 1;
}

function confidenceFromSource(source?: string): 0 | 1 | 2 | 3 | 4 {
	return source?.trim() ? 3 : 2;
}

function slugify(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function mapRegionToIds(region?: string): string[] {
	const normalized = region?.trim().toLowerCase() ?? "";
	if (!normalized) return [];

	if (normalized.includes("north america")) return ["north-america"];
	if (normalized.includes("south america") || normalized.includes("latin america")) {
		return ["south-america"];
	}
	if (normalized.includes("europe")) return ["europe"];
	if (normalized.includes("middle east") || normalized.includes("north africa")) return ["mena"];
	if (normalized.includes("sub-saharan")) return ["sub-saharan-africa"];
	if (normalized.includes("central asia")) return ["central-asia"];
	if (normalized.includes("south asia")) return ["south-asia"];
	if (normalized.includes("east asia")) return ["east-asia"];
	if (normalized.includes("southeast asia")) return ["southeast-asia"];
	if (normalized.includes("oceania") || normalized.includes("pacific")) return ["oceania"];
	if (normalized.includes("africa")) return ["sub-saharan-africa"];

	return [];
}

function buildEventTitle(item: GatewayEvent): string {
	const left = item.subEventType?.trim() || item.eventType.trim();
	const right = item.location?.trim() || item.country.trim() || "Unknown";
	return `${left}: ${right}`;
}

function toIsoDate(eventDate: string, fallbackIso: string): string {
	const normalized = normalizeDate(eventDate);
	if (!normalized) return fallbackIso;
	return `${normalized}T00:00:00.000Z`;
}

function buildCacheKey(input: {
	baseURL: string;
	source: ExternalGeopoliticalSource;
	country?: string;
	region?: string;
	eventType?: string;
	subEventType?: string;
	from?: string;
	to?: string;
	page: number;
	pageSize: number;
}): string {
	return JSON.stringify(input);
}

export async function fetchExternalEventsViaGateway(
	filters: ExternalProxyFilters,
): Promise<ExternalProxyResult> {
	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const source = normalizeSource(filters.source);
	const page = normalizePage(filters.page);
	const pageSize = normalizePageSize(filters.pageSize);
	const country = normalizeText(filters.country);
	const region = normalizeText(filters.region);
	const eventType = normalizeText(filters.eventType);
	const subEventType = normalizeText(filters.subEventType);
	const from = normalizeDate(filters.from);
	const to = normalizeDate(filters.to);
	const requestId = filters.requestId?.trim() || "";
	const userRole = filters.userRole?.trim() || "";

	const cacheTTL = clamp(
		Number(process.env.GEOPOLITICAL_ACLED_CACHE_MS || DEFAULT_CACHE_MS),
		0,
		10 * 60_000,
	);
	const cacheKey = buildCacheKey({
		baseURL: gatewayBaseURL,
		source,
		country,
		region,
		eventType,
		subEventType,
		from,
		to,
		page,
		pageSize,
	});

	const now = Date.now();
	if (cacheTTL > 0) {
		const existing = cache.get(cacheKey);
		if (existing && existing.expiresAt > now) {
			return existing.value;
		}
	}

	const fetchLimit = clamp(page * pageSize, 1, 500);
	const endpoint = new URL("/api/v1/geopolitical/events", gatewayBaseURL);
	endpoint.searchParams.set("source", source);
	endpoint.searchParams.set("limit", String(fetchLimit));
	if (country) endpoint.searchParams.set("country", country);
	if (region) endpoint.searchParams.set("region", region);
	if (eventType) endpoint.searchParams.set("eventType", eventType);
	if (subEventType) endpoint.searchParams.set("subEventType", subEventType);
	if (from) endpoint.searchParams.set("from", from);
	if (to) endpoint.searchParams.set("to", to);

	const headers: Record<string, string> = { Accept: "application/json" };
	if (requestId) headers["X-Request-ID"] = requestId;
	if (userRole) headers["X-User-Role"] = userRole;
	const response = await fetch(endpoint.toString(), {
		method: "GET",
		headers,
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error(`Go geopolitical gateway request failed (${response.status})`);
	}

	const payload = (await response.json()) as GatewayEventsResponse;
	if (!payload.success || !payload.data || !Array.isArray(payload.data.items)) {
		throw new Error(payload.error || "Invalid geopolitical gateway response");
	}

	const responseSource = normalizeSource(payload.data.source);
	const sourceLabel = responseSource === "acled" ? "ACLED" : "GDELT";
	const sourceLink = responseSource === "acled" ? ACLED_DASHBOARD_URL : GDELT_HOME_URL;
	const sourceTier = responseSource === "acled" ? "A" : "B";
	const sourceReliability = responseSource === "acled" ? 0.8 : 0.65;
	const generatedAt = new Date().toISOString();
	const mapped = payload.data.items.map((item, index) => {
		const eventIdRaw =
			item.id?.trim() || `${item.eventDate}-${item.country}-${item.eventType}-${index}`;
		const id = `${responseSource}:${eventIdRaw}`;
		const eventDateIso = toIsoDate(item.eventDate, generatedAt);
		const severity = severityFromFatalities(Number(item.fatalities || 0));
		const latitude = Number(item.latitude);
		const longitude = Number(item.longitude);
		const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
		const sourceURL = item.url?.trim() || sourceLink;
		const sourceTitle = item.source?.trim() || sourceLabel;

		return {
			id,
			title: buildEventTitle(item),
			symbol: responseSource,
			category: slugify(item.eventType || "geopolitical"),
			subcategory: item.subEventType ? slugify(item.subEventType) : undefined,
			status: "confirmed",
			severity,
			confidence: confidenceFromSource(item.source),
			countryCodes: [],
			regionIds: mapRegionToIds(item.region),
			coordinates: hasCoordinates ? [{ lat: latitude, lng: longitude }] : undefined,
			summary: item.notes?.trim() || undefined,
			analystNote: item.source?.trim()
				? `${sourceLabel} source: ${item.source.trim()}`
				: `${sourceLabel} source: unspecified`,
			sources: [
				{
					id: `${responseSource}-src-${eventIdRaw}-${index}`,
					provider: responseSource,
					url: sourceURL,
					title: sourceTitle,
					publishedAt: eventDateIso,
					fetchedAt: generatedAt,
					sourceTier,
					reliability: sourceReliability,
				},
			],
			assets: [],
			createdAt: eventDateIso,
			updatedAt: eventDateIso,
			validFrom: eventDateIso,
			createdBy: `${responseSource}-bridge`,
			updatedBy: `${responseSource}-bridge`,
			externalSource: responseSource,
			externalRegion: item.region?.trim() || undefined,
			externalEventType: item.eventType?.trim() || undefined,
			externalSubEventType: item.subEventType?.trim() || undefined,
			externalFatalities: Number(item.fatalities || 0),
		} satisfies GeoEvent;
	});

	const start = (page - 1) * pageSize;
	const paged = mapped.slice(start, start + pageSize);
	const total = mapped.length;
	const hasMore = start + pageSize < total || total >= fetchLimit;

	const result: ExternalProxyResult = {
		events: paged,
		meta: {
			source: responseSource,
			page,
			pageSize,
			total,
			hasMore,
			filters: {
				country,
				region,
				eventType,
				subEventType,
				from,
				to,
			},
		},
	};

	if (cacheTTL > 0) {
		cache.set(cacheKey, {
			expiresAt: now + cacheTTL,
			value: result,
		});
	}
	return result;
}

export async function fetchAcledEventsViaGateway(
	filters: Omit<ExternalProxyFilters, "source">,
): Promise<ExternalProxyResult> {
	return fetchExternalEventsViaGateway({
		...filters,
		source: "acled",
	});
}
