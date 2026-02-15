import {
	getGeoCatalogEntry,
	isValidGeoCategory,
	isValidGeoSymbol,
} from "@/lib/geopolitical/catalog";
import type { GeoConfidence, GeoEventStatus, GeoSeverity } from "@/lib/geopolitical/types";

export interface CreateGeoEventInput {
	title: string;
	symbol: string;
	category: string;
	status: GeoEventStatus;
	severity: GeoSeverity;
	confidence: GeoConfidence;
	lat: number;
	lng: number;
	summary?: string;
	analystNote?: string;
	countryCodes: string[];
	regionIds: string[];
}

export interface UpdateGeoEventInput {
	title?: string;
	symbol?: string;
	category?: string;
	status?: GeoEventStatus;
	severity?: GeoSeverity;
	confidence?: GeoConfidence;
	lat?: number;
	lng?: number;
	summary?: string;
	analystNote?: string;
	countryCodes?: string[];
	regionIds?: string[];
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}
	return value as Record<string, unknown>;
}

function parseOptionalString(
	value: unknown,
	key: string,
	maxLength: number,
): ParseResult<string | undefined> {
	if (value === undefined) {
		return { ok: true, value: undefined };
	}
	if (typeof value !== "string") {
		return { ok: false, error: `${key} must be a string` };
	}
	const trimmed = value.trim();
	if (trimmed.length > maxLength) {
		return { ok: false, error: `${key} exceeds max length (${maxLength})` };
	}
	return { ok: true, value: trimmed.length > 0 ? trimmed : undefined };
}

function parseRequiredTitle(value: unknown): ParseResult<string> {
	if (typeof value !== "string") {
		return { ok: false, error: "title is required" };
	}
	const trimmed = value.trim();
	if (trimmed.length < 3) {
		return { ok: false, error: "title must be at least 3 characters" };
	}
	if (trimmed.length > 160) {
		return { ok: false, error: "title exceeds max length (160)" };
	}
	return { ok: true, value: trimmed };
}

function parseOptionalSeverity(value: unknown): ParseResult<GeoSeverity | undefined> {
	if (value === undefined) {
		return { ok: true, value: undefined };
	}
	const numeric = Number(value);
	if (!Number.isInteger(numeric) || numeric < 1 || numeric > 5) {
		return { ok: false, error: "severity must be an integer between 1 and 5" };
	}
	return { ok: true, value: numeric as GeoSeverity };
}

function parseOptionalConfidence(value: unknown): ParseResult<GeoConfidence | undefined> {
	if (value === undefined) {
		return { ok: true, value: undefined };
	}
	const numeric = Number(value);
	if (!Number.isInteger(numeric) || numeric < 0 || numeric > 4) {
		return { ok: false, error: "confidence must be an integer between 0 and 4" };
	}
	return { ok: true, value: numeric as GeoConfidence };
}

function parseOptionalStatus(value: unknown): ParseResult<GeoEventStatus | undefined> {
	if (value === undefined) {
		return { ok: true, value: undefined };
	}
	if (
		value !== "candidate" &&
		value !== "confirmed" &&
		value !== "persistent" &&
		value !== "archived"
	) {
		return { ok: false, error: "status is invalid" };
	}
	return { ok: true, value };
}

function parseOptionalCoordinates(
	latValue: unknown,
	lngValue: unknown,
): ParseResult<{ lat?: number; lng?: number }> {
	if (latValue === undefined && lngValue === undefined) {
		return { ok: true, value: {} };
	}

	if (latValue === undefined || lngValue === undefined) {
		return { ok: false, error: "lat and lng must be provided together" };
	}

	const lat = Number(latValue);
	const lng = Number(lngValue);
	if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
		return { ok: false, error: "lat must be a number between -90 and 90" };
	}
	if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
		return { ok: false, error: "lng must be a number between -180 and 180" };
	}

	return {
		ok: true,
		value: {
			lat: Number(lat.toFixed(6)),
			lng: Number(lng.toFixed(6)),
		},
	};
}

function parseStringArray(value: unknown, key: string): ParseResult<string[]> {
	if (value === undefined) {
		return { ok: true, value: [] };
	}
	if (!Array.isArray(value)) {
		return { ok: false, error: `${key} must be an array of strings` };
	}

	const cleaned = value
		.filter((entry): entry is string => typeof entry === "string")
		.map((entry) => entry.trim())
		.filter(Boolean);

	return { ok: true, value: [...new Set(cleaned)] };
}

export function parseCreateGeoEventInput(payload: unknown): ParseResult<CreateGeoEventInput> {
	const body = asRecord(payload);
	if (!body) {
		return { ok: false, error: "invalid request body" };
	}

	const title = parseRequiredTitle(body.title);
	if (!title.ok) return title;

	if (typeof body.symbol !== "string" || !isValidGeoSymbol(body.symbol)) {
		return { ok: false, error: "symbol is required and must exist in catalog" };
	}

	const symbol = body.symbol.trim();
	const inferredCategory = getGeoCatalogEntry(symbol)?.category;
	const category =
		typeof body.category === "string" && body.category.trim().length > 0
			? body.category.trim()
			: inferredCategory;

	if (!category || !isValidGeoCategory(category)) {
		return { ok: false, error: "category is invalid" };
	}

	const status = parseOptionalStatus(body.status);
	if (!status.ok) return status;

	const severity = parseOptionalSeverity(body.severity);
	if (!severity.ok) return severity;

	const confidence = parseOptionalConfidence(body.confidence);
	if (!confidence.ok) return confidence;

	const coordinates = parseOptionalCoordinates(body.lat, body.lng);
	if (
		!coordinates.ok ||
		coordinates.value.lat === undefined ||
		coordinates.value.lng === undefined
	) {
		return { ok: false, error: coordinates.ok ? "lat and lng are required" : coordinates.error };
	}

	const summary = parseOptionalString(body.summary, "summary", 4000);
	if (!summary.ok) return summary;

	const analystNote = parseOptionalString(body.analystNote, "analystNote", 4000);
	if (!analystNote.ok) return analystNote;

	const countryCodes = parseStringArray(body.countryCodes, "countryCodes");
	if (!countryCodes.ok) return countryCodes;

	const regionIds = parseStringArray(body.regionIds, "regionIds");
	if (!regionIds.ok) return regionIds;

	return {
		ok: true,
		value: {
			title: title.value,
			symbol,
			category,
			status: status.value ?? "confirmed",
			severity: severity.value ?? 2,
			confidence: confidence.value ?? 2,
			lat: coordinates.value.lat,
			lng: coordinates.value.lng,
			summary: summary.value,
			analystNote: analystNote.value,
			countryCodes: countryCodes.value,
			regionIds: regionIds.value,
		},
	};
}

export function parseUpdateGeoEventInput(payload: unknown): ParseResult<UpdateGeoEventInput> {
	const body = asRecord(payload);
	if (!body) {
		return { ok: false, error: "invalid request body" };
	}

	const title = parseOptionalString(body.title, "title", 160);
	if (!title.ok) return title;
	if (title.value !== undefined && title.value.length < 3) {
		return { ok: false, error: "title must be at least 3 characters" };
	}

	let symbol: string | undefined;
	if (body.symbol !== undefined) {
		if (typeof body.symbol !== "string" || !isValidGeoSymbol(body.symbol.trim())) {
			return { ok: false, error: "symbol is invalid" };
		}
		symbol = body.symbol.trim();
	}

	let category: string | undefined;
	if (body.category !== undefined) {
		if (typeof body.category !== "string" || !isValidGeoCategory(body.category.trim())) {
			return { ok: false, error: "category is invalid" };
		}
		category = body.category.trim();
	}

	if (!category && symbol) {
		category = getGeoCatalogEntry(symbol)?.category;
	}

	const status = parseOptionalStatus(body.status);
	if (!status.ok) return status;

	const severity = parseOptionalSeverity(body.severity);
	if (!severity.ok) return severity;

	const confidence = parseOptionalConfidence(body.confidence);
	if (!confidence.ok) return confidence;

	const coordinates = parseOptionalCoordinates(body.lat, body.lng);
	if (!coordinates.ok) return coordinates;

	const summary = parseOptionalString(body.summary, "summary", 4000);
	if (!summary.ok) return summary;

	const analystNote = parseOptionalString(body.analystNote, "analystNote", 4000);
	if (!analystNote.ok) return analystNote;

	const countryCodes = parseStringArray(body.countryCodes, "countryCodes");
	if (!countryCodes.ok) return countryCodes;

	const regionIds = parseStringArray(body.regionIds, "regionIds");
	if (!regionIds.ok) return regionIds;

	const value: UpdateGeoEventInput = {};
	if (title.value !== undefined) value.title = title.value;
	if (symbol !== undefined) value.symbol = symbol;
	if (category !== undefined) value.category = category;
	if (status.value !== undefined) value.status = status.value;
	if (severity.value !== undefined) value.severity = severity.value;
	if (confidence.value !== undefined) value.confidence = confidence.value;
	if (coordinates.value.lat !== undefined) value.lat = coordinates.value.lat;
	if (coordinates.value.lng !== undefined) value.lng = coordinates.value.lng;
	if (summary.value !== undefined) value.summary = summary.value;
	if (analystNote.value !== undefined) value.analystNote = analystNote.value;
	if (body.countryCodes !== undefined) value.countryCodes = countryCodes.value;
	if (body.regionIds !== undefined) value.regionIds = regionIds.value;

	if (Object.keys(value).length === 0) {
		return { ok: false, error: "no valid fields to update" };
	}

	return { ok: true, value };
}
