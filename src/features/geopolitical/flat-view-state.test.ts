import { describe, expect, it } from "bun:test";
import {
	buildGeoFlatViewHandoffFromBounds,
	buildGeoFlatViewHandoffFromStoryPreset,
} from "@/features/geopolitical/flat-view-handoff";
import { buildGeoFlatViewStateFromHandoff } from "@/features/geopolitical/flat-view-state";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import { buildGeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import type { GeoEvent } from "@/lib/geopolitical/types";

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
	coordinates: [{ lat: 35.69, lng: 51.39 }],
	sources: [],
	assets: [],
	createdAt: "2026-03-12T07:00:00.000Z",
	updatedAt: "2026-03-12T07:00:00.000Z",
	createdBy: "system",
	updatedBy: "system",
	symbol: "missile",
};

describe("flat-view-state", () => {
	it("builds a deckgl/maplibre flat state from a story handoff", () => {
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
		const state = buildGeoFlatViewStateFromHandoff(handoff);

		expect(state.viewMode).toBe("flat");
		expect(state.renderer).toBe("deckgl-maplibre");
		expect(state.reason).toBe("story");
		expect(state.layerFamilies).toEqual(["geo-core", "conflict", "context"]);
		expect(state.layerHints).toEqual(["geo-core", "conflict", "context", "story"]);
		expect(state.pmtilesPreferred).toBeTrue();
		expect(state.basemapPolicy.mapLibreAllowed).toBeTrue();
		expect(state.temporal.viewRangeMs).toEqual([100, 220]);
		expect(state.temporal.filterRangeMs).toEqual([120, 200]);
		expect(state.temporal.selectedTimeMs).toBe(170);
	});

	it("deduplicates family hints and preserves explicit bounds handoffs", () => {
		const handoff = buildGeoFlatViewHandoffFromBounds({
			bounds: { south: 10, west: 20, north: 30, east: 40 },
			filterSnapshot: FILTER_SNAPSHOT,
			viewRangeMs: [1, 2],
			filterRangeMs: [3, 4],
			selectedTimeMs: 5,
			reason: "draw_area",
			layerHints: ["geo-core", "macro-state", "geo-core"],
		});
		const state = buildGeoFlatViewStateFromHandoff(handoff);

		expect(state.reason).toBe("draw_area");
		expect(state.bounds).toEqual({ south: 10, west: 20, north: 30, east: 40 });
		expect(state.layerFamilies).toEqual(["geo-core", "macro-state"]);
		expect(state.layerHints).toEqual(["geo-core", "macro-state", "geo-core"]);
		expect(state.pmtilesPreferred).toBeTrue();
	});
});
