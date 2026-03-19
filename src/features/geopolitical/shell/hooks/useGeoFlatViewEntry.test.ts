import { describe, expect, it } from "bun:test";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import { buildGeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import {
	resolveGeoFlatViewEntryActionFromCurrentContext,
	resolveGeoFlatViewHandoffFromCurrentContext,
} from "@/features/geopolitical/shell/hooks/useGeoFlatViewEntry";
import type { GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

const FILTER_SNAPSHOT: GeoFilterStateSnapshot = {
	eventsSource: "acled",
	activeRegionId: "middle-east",
	searchQuery: "tehran",
	minSeverityFilter: 3,
	acledCountryFilter: "IR",
	acledRegionFilter: "middle-east",
	acledEventTypeFilter: "",
	acledSubEventTypeFilter: "",
	acledFromFilter: "",
	acledToFilter: "",
};

const EVENT: GeoEvent = {
	id: "evt-1",
	title: "Missile launch detected",
	category: "conflict",
	status: "confirmed",
	severity: 4,
	confidence: 3,
	countryCodes: ["IR"],
	regionIds: ["middle-east"],
	coordinates: [{ lat: 35.69, lng: 51.39 }],
	sources: [],
	assets: [],
	createdAt: "2026-03-12T07:00:00.000Z",
	updatedAt: "2026-03-12T07:00:00.000Z",
	createdBy: "system",
	updatedBy: "system",
	symbol: "missile",
};

const DRAWING: GeoDrawing = {
	id: "drawing-1",
	type: "polygon",
	points: [
		{ lat: 33.5, lng: 44.1 },
		{ lat: 34.2, lng: 45.4 },
		{ lat: 32.8, lng: 46.3 },
	],
	color: "#22d3ee",
	createdAt: "2026-03-12T07:00:00.000Z",
	updatedAt: "2026-03-12T07:00:00.000Z",
	createdBy: "system",
	updatedBy: "system",
};

function buildParams() {
	return {
		events: [EVENT],
		visibleEvents: [EVENT],
		drawings: [DRAWING],
		selectedEvent: null,
		selectedDrawingId: null,
		activeStoryFocusPreset: null,
		activeRegionId: "",
		filterSnapshot: FILTER_SNAPSHOT,
		timelineViewRangeMs: [100, 200] as [number, number],
		activeReplayRangeMs: [120, 180] as [number, number],
		timelineSelectedTimeMs: 150,
		mapBody: "earth" as const,
	};
}

describe("useGeoFlatViewEntry", () => {
	it("prefers an active story preset even without a selected event", () => {
		const preset = buildGeoStoryFocusPreset({
			id: "story-1",
			label: "Iran escalation",
			linkedEventId: "evt-1",
			selectedTimeMs: 170,
			viewRangeMs: [100, 220],
			filterRangeMs: [120, 200],
			regionId: "middle-east",
		});

		const handoff = resolveGeoFlatViewHandoffFromCurrentContext({
			...buildParams(),
			activeStoryFocusPreset: preset,
		});

		expect(handoff?.reason).toBe("story");
		expect(handoff?.focus).toEqual({
			kind: "event",
			id: "evt-1",
			regionId: "middle-east",
		});
		expect(handoff?.viewRangeMs).toEqual([100, 220]);
		expect(handoff?.filterRangeMs).toEqual([120, 200]);
	});

	it("keeps story handoff alive even when the linked event is missing", () => {
		const preset = buildGeoStoryFocusPreset({
			id: "story-2",
			label: "Detached story focus",
			linkedEventId: "evt-missing",
			selectedTimeMs: 180,
			viewRangeMs: [150, 240],
			filterRangeMs: [160, 220],
			regionId: "middle-east",
		});

		const handoff = resolveGeoFlatViewHandoffFromCurrentContext({
			...buildParams(),
			activeStoryFocusPreset: preset,
		});

		expect(handoff?.reason).toBe("story");
		expect(handoff?.focus).toEqual({
			kind: "event",
			id: "evt-missing",
			regionId: "middle-east",
		});
		expect(handoff?.bounds).toBeNull();
	});

	it("falls back to the selected drawing when no story or event is active", () => {
		const handoff = resolveGeoFlatViewHandoffFromCurrentContext({
			...buildParams(),
			selectedDrawingId: "drawing-1",
		});

		expect(handoff?.reason).toBe("draw_area");
		expect(handoff?.focus).toBeNull();
		expect(handoff?.bounds).not.toBeNull();
	});

	it("falls back to the active region when drawing handoff is unavailable", () => {
		const handoff = resolveGeoFlatViewHandoffFromCurrentContext({
			...buildParams(),
			drawings: [],
			activeRegionId: "middle-east",
		});

		expect(handoff?.reason).toBe("region");
		expect(handoff?.focus).toEqual({
			kind: "region",
			id: "middle-east",
			regionId: "middle-east",
		});
	});

	it("returns null when no current flat handoff context exists", () => {
		const handoff = resolveGeoFlatViewHandoffFromCurrentContext({
			...buildParams(),
			events: [],
			visibleEvents: [],
			drawings: [],
			timelineViewRangeMs: null,
			activeReplayRangeMs: null,
			timelineSelectedTimeMs: null,
		});

		expect(handoff).toBeNull();
	});

	it("reuses the existing flat state when no new handoff context exists", () => {
		const action = resolveGeoFlatViewEntryActionFromCurrentContext({
			...buildParams(),
			events: [],
			visibleEvents: [],
			drawings: [],
			timelineViewRangeMs: null,
			activeReplayRangeMs: null,
			timelineSelectedTimeMs: null,
			flatViewState: {
				viewMode: "flat",
				renderer: "deckgl-maplibre",
				mapBody: "earth",
				reason: "region",
				bounds: { south: 30, west: 40, north: 38, east: 54 },
				focus: { kind: "region", id: "middle-east", regionId: "middle-east" },
				filterSnapshot: FILTER_SNAPSHOT,
				layerFamilies: ["geo-core", "conflict"],
				layerHints: ["geo-core", "conflict", "macro-state"],
				temporal: {
					viewRangeMs: [100, 200],
					filterRangeMs: [120, 180],
					selectedTimeMs: 150,
				},
				basemapPolicy: {
					richness: "detailed",
					mapLibreAllowed: true,
					pmtilesAllowed: true,
					minimumFeatures: ["place", "water", "waterway"],
					optionalFeatures: ["roads"],
				},
				pmtilesPreferred: true,
			},
		});

		expect(action).toEqual({
			type: "reuse_existing_flat_state",
		});
	});

	it("returns a handoff action when current context resolves to a new flat handoff", () => {
		const action = resolveGeoFlatViewEntryActionFromCurrentContext({
			...buildParams(),
			selectedEvent: EVENT,
			flatViewState: null,
		});

		expect(action.type).toBe("handoff");
		if (action.type !== "handoff") {
			throw new Error("expected a handoff action");
		}
		expect(action.handoff.reason).toBe("event");
		expect(action.handoff.focus).toEqual({
			kind: "event",
			id: "evt-1",
			regionId: "middle-east",
		});
	});
});
