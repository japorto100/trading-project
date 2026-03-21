import type { GeoAssetLink, GeoEvent, GeoSourceRef } from "@/lib/geopolitical/types";
import type { CreateGeoEventInput, UpdateGeoEventInput } from "@/lib/geopolitical/validation";
import { getGatewayBaseURL } from "@/lib/server/gateway";

type GeoEventsResponse = {
	success?: boolean;
	source?: string;
	events?: GeoEvent[];
	event?: GeoEvent;
	error?: string;
};

function localEventsBaseURL(): string {
	return new URL("/api/v1/geopolitical/local-events", getGatewayBaseURL()).toString();
}

async function readJSON(response: Response): Promise<GeoEventsResponse> {
	return (await response.json().catch(() => ({}))) as GeoEventsResponse;
}

function ensureEventShape(event: GeoEvent): GeoEvent {
	return {
		...event,
		countryCodes: Array.isArray(event.countryCodes) ? event.countryCodes : [],
		regionIds: Array.isArray(event.regionIds) ? event.regionIds : [],
		coordinates: Array.isArray(event.coordinates) ? event.coordinates : undefined,
		sources: Array.isArray(event.sources) ? (event.sources as GeoSourceRef[]) : [],
		assets: Array.isArray(event.assets) ? (event.assets as GeoAssetLink[]) : [],
	};
}

async function requestLocalEvents<T extends GeoEventsResponse>(
	pathname: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${localEventsBaseURL()}${pathname}`, {
		cache: "no-store",
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});
	const payload = (await readJSON(response)) as T;
	if (!response.ok) {
		throw new Error(
			payload.error || `Local geopolitical gateway request failed (${response.status})`,
		);
	}
	return payload;
}

async function requestLocalEventsOrNull<T extends GeoEventsResponse>(
	pathname: string,
	init?: RequestInit,
): Promise<T | null> {
	const response = await fetch(`${localEventsBaseURL()}${pathname}`, {
		cache: "no-store",
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});
	const payload = (await readJSON(response)) as T;
	if (response.status === 404) {
		return null;
	}
	if (!response.ok) {
		throw new Error(
			payload.error || `Local geopolitical gateway request failed (${response.status})`,
		);
	}
	return payload;
}

export async function listGeoEvents(filters?: {
	status?: GeoEvent["status"];
	category?: string;
	regionId?: string;
	minSeverity?: number;
	q?: string;
}): Promise<GeoEvent[]> {
	const params = new URLSearchParams();
	if (filters?.status) params.set("status", filters.status);
	if (filters?.category) params.set("category", filters.category);
	if (filters?.regionId) params.set("regionId", filters.regionId);
	const minSeverity = filters?.minSeverity;
	if (Number.isFinite(minSeverity)) params.set("minSeverity", String(minSeverity));
	if (filters?.q?.trim()) params.set("q", filters.q.trim());
	const payload = await requestLocalEvents<GeoEventsResponse>(params.size > 0 ? `?${params}` : "");
	return Array.isArray(payload.events) ? payload.events.map(ensureEventShape) : [];
}

export async function getGeoEvent(eventId: string): Promise<GeoEvent | null> {
	const payload = await requestLocalEventsOrNull<GeoEventsResponse>(
		`/${encodeURIComponent(eventId)}`,
	);
	if (!payload) return null;
	return payload.event ? ensureEventShape(payload.event) : null;
}

export async function createGeoEvent(input: CreateGeoEventInput, actor: string): Promise<GeoEvent> {
	const payload = await requestLocalEvents<GeoEventsResponse>("", {
		method: "POST",
		headers: { "X-Geo-Actor": actor },
		body: JSON.stringify(input),
	});
	if (!payload.event) {
		throw new Error("Local geopolitical gateway did not return an event");
	}
	return ensureEventShape(payload.event);
}

export async function updateGeoEvent(
	eventId: string,
	input: UpdateGeoEventInput,
	actor: string,
): Promise<GeoEvent | null> {
	const payload = await requestLocalEventsOrNull<GeoEventsResponse>(
		`/${encodeURIComponent(eventId)}`,
		{
			method: "PATCH",
			headers: { "X-Geo-Actor": actor },
			body: JSON.stringify(input),
		},
	);
	if (!payload) return null;
	return payload.event ? ensureEventShape(payload.event) : null;
}

export async function addGeoEventSource(
	eventId: string,
	source: GeoSourceRef,
	actor: string,
): Promise<GeoEvent | null> {
	const payload = await requestLocalEventsOrNull<GeoEventsResponse>(
		`/${encodeURIComponent(eventId)}/sources`,
		{
			method: "POST",
			headers: { "X-Geo-Actor": actor },
			body: JSON.stringify(source),
		},
	);
	if (!payload) return null;
	return payload.event ? ensureEventShape(payload.event) : null;
}

export async function addGeoEventAsset(
	eventId: string,
	asset: GeoAssetLink,
	actor: string,
): Promise<GeoEvent | null> {
	const payload = await requestLocalEventsOrNull<GeoEventsResponse>(
		`/${encodeURIComponent(eventId)}/assets`,
		{
			method: "POST",
			headers: { "X-Geo-Actor": actor },
			body: JSON.stringify(asset),
		},
	);
	if (!payload) return null;
	return payload.event ? ensureEventShape(payload.event) : null;
}

export async function archiveGeoEvent(eventId: string, actor: string): Promise<GeoEvent | null> {
	const payload = await requestLocalEventsOrNull<GeoEventsResponse>(
		`/${encodeURIComponent(eventId)}/archive`,
		{
			method: "POST",
			headers: { "X-Geo-Actor": actor },
		},
	);
	if (!payload) return null;
	return payload.event ? ensureEventShape(payload.event) : null;
}

export async function deleteGeoEvent(eventId: string): Promise<boolean> {
	const payload = await requestLocalEventsOrNull<GeoEventsResponse>(
		`/${encodeURIComponent(eventId)}`,
		{
			method: "DELETE",
		},
	);
	if (!payload) return false;
	return true;
}
