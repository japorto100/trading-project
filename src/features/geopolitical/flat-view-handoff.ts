import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import type { GeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import {
	buildGeoMapLayerHintsForHandoff,
	type GeoMapLayerHint,
} from "@/features/geopolitical/layer-taxonomy";
import type { GeoReplayRangeMs } from "@/features/geopolitical/replay-window";
import type { GeoMapBody } from "@/features/geopolitical/store";
import type { GeoCoordinate, GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

export type GeoFlatViewHandoffReason =
	| "region"
	| "event"
	| "cluster"
	| "story"
	| "draw_area"
	| "manual";

export type GeoFlatViewFocusKind =
	| "event"
	| "timeline"
	| "candidate"
	| "context"
	| "news"
	| "region";

export interface GeoFlatViewBounds {
	south: number;
	west: number;
	north: number;
	east: number;
}

export interface GeoFlatViewFocus {
	kind: GeoFlatViewFocusKind;
	id: string;
	linkedEventId?: string;
	regionId?: string | null;
}

export interface GeoFlatViewHandoff {
	reason: GeoFlatViewHandoffReason;
	mapBody: GeoMapBody;
	bounds: GeoFlatViewBounds | null;
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
	filterSnapshot: GeoFilterStateSnapshot;
	focus: GeoFlatViewFocus | null;
	layerHints: GeoMapLayerHint[];
}

function clampLatitude(value: number): number {
	return Math.max(-90, Math.min(90, value));
}

function normalizeLongitude(value: number): number {
	if (!Number.isFinite(value)) return value;
	let next = value;
	while (next > 180) next -= 360;
	while (next < -180) next += 360;
	return next;
}

export function buildGeoFlatViewBoundsFromCoordinates(
	coordinates: GeoCoordinate[],
	paddingDegrees = 4,
): GeoFlatViewBounds | null {
	const validPoints = coordinates.filter(
		(point) => Number.isFinite(point.lat) && Number.isFinite(point.lng),
	);
	if (validPoints.length === 0) return null;

	const latitudes = validPoints.map((point) => point.lat);
	const longitudes = validPoints.map((point) => normalizeLongitude(point.lng));
	const minLatitude = Math.min(...latitudes);
	const maxLatitude = Math.max(...latitudes);
	const minLongitude = Math.min(...longitudes);
	const maxLongitude = Math.max(...longitudes);

	return {
		south: clampLatitude(minLatitude - paddingDegrees),
		west: normalizeLongitude(minLongitude - paddingDegrees),
		north: clampLatitude(maxLatitude + paddingDegrees),
		east: normalizeLongitude(maxLongitude + paddingDegrees),
	};
}

export function buildGeoFlatViewHandoffFromEvent(params: {
	event: GeoEvent;
	filterSnapshot: GeoFilterStateSnapshot;
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
	mapBody?: GeoMapBody;
	reason?: Extract<GeoFlatViewHandoffReason, "event" | "story">;
}): GeoFlatViewHandoff {
	const { event, filterSnapshot, viewRangeMs, filterRangeMs, selectedTimeMs } = params;

	return {
		reason: params.reason ?? "event",
		mapBody: params.mapBody ?? "earth",
		bounds: buildGeoFlatViewBoundsFromCoordinates(event.coordinates ?? []),
		viewRangeMs: viewRangeMs ? [...viewRangeMs] : null,
		filterRangeMs: filterRangeMs ? [...filterRangeMs] : null,
		selectedTimeMs,
		filterSnapshot: { ...filterSnapshot },
		focus: {
			kind: "event",
			id: event.id,
			regionId: event.regionIds.find((value) => value.trim()) ?? null,
		},
		layerHints: buildGeoMapLayerHintsForHandoff({ reason: params.reason ?? "event" }),
	};
}

export function buildGeoFlatViewHandoffFromStoryPreset(params: {
	preset: GeoStoryFocusPreset;
	filterSnapshot: GeoFilterStateSnapshot;
	event?: GeoEvent | null;
	mapBody?: GeoMapBody;
}): GeoFlatViewHandoff {
	const { preset, filterSnapshot, event } = params;

	return {
		reason: "story",
		mapBody: params.mapBody ?? "earth",
		bounds: event ? buildGeoFlatViewBoundsFromCoordinates(event.coordinates ?? []) : null,
		viewRangeMs: preset.viewRangeMs ? [...preset.viewRangeMs] : null,
		filterRangeMs: preset.filterRangeMs ? [...preset.filterRangeMs] : null,
		selectedTimeMs: preset.selectedTimeMs,
		filterSnapshot: { ...filterSnapshot },
		focus:
			preset.linkedEventId !== null
				? {
						kind: "event",
						id: preset.linkedEventId,
						regionId: preset.regionId,
					}
				: null,
		layerHints: buildGeoMapLayerHintsForHandoff({ reason: "story", includeStoryHint: true }),
	};
}

export function buildGeoFlatViewHandoffFromRegionEvents(params: {
	regionId: string;
	events: GeoEvent[];
	filterSnapshot: GeoFilterStateSnapshot;
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
	mapBody?: GeoMapBody;
}): GeoFlatViewHandoff | null {
	const regionEvents = params.events.filter((event) => event.regionIds.includes(params.regionId));
	if (regionEvents.length === 0) return null;
	const bounds = buildGeoFlatViewBoundsFromCoordinates(
		regionEvents.flatMap((event) => event.coordinates ?? []),
	);
	return {
		reason: "region",
		mapBody: params.mapBody ?? "earth",
		bounds,
		viewRangeMs: params.viewRangeMs ? [...params.viewRangeMs] : null,
		filterRangeMs: params.filterRangeMs ? [...params.filterRangeMs] : null,
		selectedTimeMs: params.selectedTimeMs,
		filterSnapshot: { ...params.filterSnapshot },
		focus: {
			kind: "region",
			id: params.regionId,
			regionId: params.regionId,
		},
		layerHints: buildGeoMapLayerHintsForHandoff({ reason: "region" }),
	};
}

export function buildGeoFlatViewHandoffFromBounds(params: {
	bounds: GeoFlatViewBounds;
	filterSnapshot: GeoFilterStateSnapshot;
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
	mapBody?: GeoMapBody;
	reason?: Extract<GeoFlatViewHandoffReason, "region" | "cluster" | "draw_area" | "manual">;
	layerHints?: GeoMapLayerHint[];
	focus?: GeoFlatViewFocus | null;
}): GeoFlatViewHandoff {
	const reason = params.reason ?? "manual";
	return {
		reason,
		mapBody: params.mapBody ?? "earth",
		bounds: { ...params.bounds },
		viewRangeMs: params.viewRangeMs ? [...params.viewRangeMs] : null,
		filterRangeMs: params.filterRangeMs ? [...params.filterRangeMs] : null,
		selectedTimeMs: params.selectedTimeMs,
		filterSnapshot: { ...params.filterSnapshot },
		focus: params.focus ?? null,
		layerHints: params.layerHints
			? [...params.layerHints]
			: buildGeoMapLayerHintsForHandoff({ reason }),
	};
}

export function buildGeoFlatViewHandoffFromClusterBounds(params: {
	bounds: GeoFlatViewBounds;
	filterSnapshot: GeoFilterStateSnapshot;
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
	mapBody?: GeoMapBody;
}): GeoFlatViewHandoff {
	return buildGeoFlatViewHandoffFromBounds({
		bounds: params.bounds,
		filterSnapshot: params.filterSnapshot,
		viewRangeMs: params.viewRangeMs,
		filterRangeMs: params.filterRangeMs,
		selectedTimeMs: params.selectedTimeMs,
		mapBody: params.mapBody,
		reason: "cluster",
		focus: null,
	});
}

export function buildGeoFlatViewHandoffFromDrawing(params: {
	drawing: GeoDrawing;
	filterSnapshot: GeoFilterStateSnapshot;
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
	mapBody?: GeoMapBody;
}): GeoFlatViewHandoff | null {
	if (params.drawing.type === "text") return null;
	const bounds = buildGeoFlatViewBoundsFromCoordinates(params.drawing.points);
	if (!bounds) return null;
	return buildGeoFlatViewHandoffFromBounds({
		bounds,
		filterSnapshot: params.filterSnapshot,
		viewRangeMs: params.viewRangeMs,
		filterRangeMs: params.filterRangeMs,
		selectedTimeMs: params.selectedTimeMs,
		mapBody: params.mapBody,
		reason: "draw_area",
		focus: null,
	});
}
