import { describe, expect, it } from "bun:test";
import {
	buildGeoFlatViewBoundsFromCoordinates,
	buildGeoFlatViewHandoffFromBounds,
	buildGeoFlatViewHandoffFromClusterBounds,
	buildGeoFlatViewHandoffFromDrawing,
	buildGeoFlatViewHandoffFromEvent,
	buildGeoFlatViewHandoffFromRegionEvents,
	buildGeoFlatViewHandoffFromStoryPreset,
} from "@/features/geopolitical/flat-view-handoff";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import { buildGeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import type { GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

const FILTER_SNAPSHOT: GeoFilterStateSnapshot = {
	activeRegionId: "middle-east",
	searchQuery: "tehran",
	minSeverityFilter: 3,
	eventsSource: "acled",
	acledCountryFilter: "IR",
	acledRegionFilter: "middle-east",
	acledEventTypeFilter: "",
	acledSubEventTypeFilter: "",
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
	coordinates: [
		{ lat: 35.69, lng: 51.39 },
		{ lat: 33.31, lng: 44.36 },
	],
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

describe("geo flat view handoff", () => {
	it("builds padded bounds from coordinates", () => {
		const bounds = buildGeoFlatViewBoundsFromCoordinates(EVENT.coordinates ?? []);
		expect(bounds).not.toBeNull();
		expect(bounds?.south).toBeCloseTo(29.31, 6);
		expect(bounds?.west).toBeCloseTo(40.36, 6);
		expect(bounds?.north).toBeCloseTo(39.69, 6);
		expect(bounds?.east).toBeCloseTo(55.39, 6);
	});

	it("builds an event handoff with focus, filters and ranges", () => {
		const handoff = buildGeoFlatViewHandoffFromEvent({
			event: EVENT,
			filterSnapshot: FILTER_SNAPSHOT,
			viewRangeMs: [100, 200],
			filterRangeMs: [120, 180],
			selectedTimeMs: 150,
		});

		expect(handoff.reason).toBe("event");
		expect(handoff.mapBody).toBe("earth");
		expect(handoff.focus).toEqual({
			kind: "event",
			id: "evt-1",
			regionId: "middle-east",
		});
		expect(handoff.viewRangeMs).toEqual([100, 200]);
		expect(handoff.filterRangeMs).toEqual([120, 180]);
		expect(handoff.selectedTimeMs).toBe(150);
		expect(handoff.filterSnapshot).toEqual(FILTER_SNAPSHOT);
		expect(handoff.layerHints).toEqual(["geo-core", "conflict"]);
	});

	it("builds a story handoff from a reusable preset", () => {
		const preset = buildGeoStoryFocusPreset({
			id: "preset-1",
			label: "Iran escalation",
			linkedEventId: "evt-1",
			selectedTimeMs: 170,
			viewRangeMs: [100, 220],
			filterRangeMs: [120, 200],
			regionId: "middle-east",
		});
		const handoff = buildGeoFlatViewHandoffFromStoryPreset({
			preset,
			filterSnapshot: FILTER_SNAPSHOT,
			event: EVENT,
		});

		expect(handoff.reason).toBe("story");
		expect(handoff.focus).toEqual({
			kind: "event",
			id: "evt-1",
			regionId: "middle-east",
		});
		expect(handoff.viewRangeMs).toEqual([100, 220]);
		expect(handoff.filterRangeMs).toEqual([120, 200]);
		expect(handoff.layerHints).toEqual(["geo-core", "conflict", "context", "story"]);
	});

	it("builds a region handoff from visible region events", () => {
		const handoff = buildGeoFlatViewHandoffFromRegionEvents({
			regionId: "middle-east",
			events: [
				EVENT,
				{
					...EVENT,
					id: "evt-2",
					coordinates: [{ lat: 32.08, lng: 34.78 }],
				},
			],
			filterSnapshot: FILTER_SNAPSHOT,
			viewRangeMs: [100, 200],
			filterRangeMs: [120, 180],
			selectedTimeMs: 150,
		});

		expect(handoff).not.toBeNull();
		expect(handoff?.reason).toBe("region");
		expect(handoff?.focus).toEqual({
			kind: "region",
			id: "middle-east",
			regionId: "middle-east",
		});
		expect(handoff?.bounds).toEqual({
			south: 28.08,
			west: 30.78,
			north: 39.69,
			east: 55.39,
		});
		expect(handoff?.layerHints).toEqual(["geo-core", "conflict", "macro-state"]);
	});

	it("builds a draw-area handoff from a selected drawing", () => {
		const handoff = buildGeoFlatViewHandoffFromDrawing({
			drawing: DRAWING,
			filterSnapshot: FILTER_SNAPSHOT,
			viewRangeMs: [100, 200],
			filterRangeMs: [120, 180],
			selectedTimeMs: 150,
		});

		expect(handoff).not.toBeNull();
		expect(handoff?.reason).toBe("draw_area");
		expect(handoff?.focus).toBeNull();
		expect(handoff?.bounds?.south).toBeCloseTo(28.8, 6);
		expect(handoff?.bounds?.west).toBeCloseTo(40.1, 6);
		expect(handoff?.bounds?.north).toBeCloseTo(38.2, 6);
		expect(handoff?.bounds?.east).toBeCloseTo(50.3, 6);
		expect(handoff?.layerHints).toEqual(["geo-core", "conflict", "macro-state"]);
	});

	it("builds a cluster handoff from cluster bounds", () => {
		const handoff = buildGeoFlatViewHandoffFromClusterBounds({
			bounds: { south: 30, west: 40, north: 36, east: 52 },
			filterSnapshot: FILTER_SNAPSHOT,
			viewRangeMs: [100, 200],
			filterRangeMs: [120, 180],
			selectedTimeMs: 150,
		});

		expect(handoff.reason).toBe("cluster");
		expect(handoff.focus).toBeNull();
		expect(handoff.bounds).toEqual({ south: 30, west: 40, north: 36, east: 52 });
		expect(handoff.layerHints).toEqual(["geo-core", "conflict", "macro-state"]);
	});

	it("ignores text drawings for flat handoff", () => {
		const handoff = buildGeoFlatViewHandoffFromDrawing({
			drawing: { ...DRAWING, id: "drawing-text", type: "text" },
			filterSnapshot: FILTER_SNAPSHOT,
			viewRangeMs: [100, 200],
			filterRangeMs: [120, 180],
			selectedTimeMs: 150,
		});

		expect(handoff).toBeNull();
	});

	it("builds a manual bounds handoff without mutating inputs", () => {
		const inputBounds = { south: 10, west: 20, north: 30, east: 40 };
		const handoff = buildGeoFlatViewHandoffFromBounds({
			bounds: inputBounds,
			filterSnapshot: FILTER_SNAPSHOT,
			viewRangeMs: [1, 2],
			filterRangeMs: [3, 4],
			selectedTimeMs: 5,
			reason: "draw_area",
			layerHints: ["geo-core", "macro-state"],
		});

		expect(handoff.reason).toBe("draw_area");
		expect(handoff.bounds).toEqual(inputBounds);
		expect(handoff.layerHints).toEqual(["geo-core", "macro-state"]);
		expect(handoff.bounds).not.toBe(inputBounds);
	});
});
