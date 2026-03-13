import { describe, expect, it } from "bun:test";
import { buildGeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import { useGeoMapWorkspaceStore } from "@/features/geopolitical/store";

describe("geo map workspace store", () => {
	it("tracks overlay chrome visibility independently from data-layer toggles", () => {
		const state = useGeoMapWorkspaceStore.getState();

		expect(state.drawingMode).toBe("cursor");
		expect(state.mapViewMode).toBe("globe");
		expect(state.showFiltersToolbar).toBeTrue();
		expect(state.showBodyLayerLegend).toBeTrue();
		expect(state.showTimelinePanel).toBeTrue();
		expect(state.timelineViewRangeMs).toBeNull();

		state.setShowFiltersToolbar(false);
		state.setShowBodyLayerLegend(false);
		state.setShowTimelinePanel(false);

		const nextState = useGeoMapWorkspaceStore.getState();
		expect(nextState.showFiltersToolbar).toBeFalse();
		expect(nextState.showBodyLayerLegend).toBeFalse();
		expect(nextState.showTimelinePanel).toBeFalse();
		expect(nextState.showCandidateQueue).toBeTrue();
		expect(nextState.showRegionLayer).toBeTrue();
		expect(nextState.showHeatmap).toBeTrue();
		expect(nextState.showSoftSignals).toBeTrue();

		nextState.setShowFiltersToolbar(true);
		nextState.setShowBodyLayerLegend(true);
		nextState.setShowTimelinePanel(true);
	});

	it("tracks timeline view range independently from the active replay range", () => {
		const state = useGeoMapWorkspaceStore.getState();
		const viewRange: [number, number] = [100, 200];
		const replayRange: [number, number] = [125, 150];
		const selectedTime = 160;

		state.setTimelineViewRangeMs(viewRange);
		state.setTimelineSelectedTimeMs(selectedTime);
		state.setActiveReplayRangeMs(replayRange);

		const nextState = useGeoMapWorkspaceStore.getState();
		expect(nextState.timelineViewRangeMs).toEqual(viewRange);
		expect(nextState.timelineSelectedTimeMs).toBe(selectedTime);
		expect(nextState.activeReplayRangeMs).toEqual(replayRange);

		nextState.setTimelineViewRangeMs(null);
		nextState.setTimelineSelectedTimeMs(null);
		nextState.setActiveReplayRangeMs(null);
	});

	it("keeps timeline selection in shared workspace state", () => {
		const state = useGeoMapWorkspaceStore.getState();

		state.setSelectedTimelineId("timeline-1");
		expect(useGeoMapWorkspaceStore.getState().selectedTimelineId).toBe("timeline-1");

		state.clearSelection();
		expect(useGeoMapWorkspaceStore.getState().selectedTimelineId).toBeNull();
	});

	it("tracks reusable story focus presets in shared workspace state", () => {
		const state = useGeoMapWorkspaceStore.getState();
		const preset = buildGeoStoryFocusPreset({
			id: "story-1",
			label: "Story 1",
			linkedEventId: "event-1",
			selectedTimeMs: 100,
			viewRangeMs: [90, 110],
			filterRangeMs: [90, 110],
			regionId: "mena",
		});

		state.setStoryFocusPresets([preset]);
		expect(useGeoMapWorkspaceStore.getState().storyFocusPresets[0]?.label).toBe("Story 1");

		state.setStoryFocusPresets([]);
		expect(useGeoMapWorkspaceStore.getState().storyFocusPresets).toEqual([]);
	});

	it("tracks the active story focus preset and clears it with selection reset", () => {
		const state = useGeoMapWorkspaceStore.getState();

		state.setActiveStoryFocusPresetId("story-1");
		expect(useGeoMapWorkspaceStore.getState().activeStoryFocusPresetId).toBe("story-1");

		state.clearSelection();
		expect(useGeoMapWorkspaceStore.getState().activeStoryFocusPresetId).toBeNull();
	});

	it("tracks a pending flat view handoff and clears it on selection reset", () => {
		const handoff = {
			reason: "event" as const,
			mapBody: "earth" as const,
			bounds: { south: 10, west: 20, north: 30, east: 40 },
			viewRangeMs: [100, 200] as [number, number],
			filterRangeMs: [120, 180] as [number, number],
			selectedTimeMs: 150,
			filterSnapshot: {
				activeRegionId: "middle-east",
				searchQuery: "tehran",
				minSeverityFilter: 3,
				eventsSource: "acled" as const,
				acledCountryFilter: "IR",
				acledRegionFilter: "middle-east",
				acledEventTypeFilter: "",
				acledSubEventTypeFilter: "",
			},
			focus: { kind: "event" as const, id: "evt-1", regionId: "middle-east" },
			layerHints: ["geo-core", "conflict"] as const,
		};

		useGeoMapWorkspaceStore.getState().setPendingFlatViewHandoff(handoff);
		expect(useGeoMapWorkspaceStore.getState().pendingFlatViewHandoff).toEqual(handoff);

		useGeoMapWorkspaceStore.getState().clearSelection();
		expect(useGeoMapWorkspaceStore.getState().pendingFlatViewHandoff).toBeNull();
	});

	it("applies a pending flat handoff into explicit flat view state", () => {
		const handoff = {
			reason: "story" as const,
			mapBody: "earth" as const,
			bounds: { south: 10, west: 20, north: 30, east: 40 },
			viewRangeMs: [100, 200] as [number, number],
			filterRangeMs: [120, 180] as [number, number],
			selectedTimeMs: 150,
			filterSnapshot: {
				activeRegionId: "middle-east",
				searchQuery: "tehran",
				minSeverityFilter: 3,
				eventsSource: "acled" as const,
				acledCountryFilter: "IR",
				acledRegionFilter: "middle-east",
				acledEventTypeFilter: "",
				acledSubEventTypeFilter: "",
			},
			focus: { kind: "event" as const, id: "evt-1", regionId: "middle-east" },
			layerHints: ["geo-core", "conflict", "context", "story"] as const,
		};

		const state = useGeoMapWorkspaceStore.getState();
		state.setPendingFlatViewHandoff(handoff);
		state.applyPendingFlatViewHandoff();

		const nextState = useGeoMapWorkspaceStore.getState();
		expect(nextState.mapViewMode).toBe("flat");
		expect(nextState.pendingFlatViewHandoff).toBeNull();
		expect(nextState.flatViewState).not.toBeNull();
		expect(nextState.flatViewState?.renderer).toBe("deckgl-maplibre");
		expect(nextState.flatViewState?.layerFamilies).toEqual(["geo-core", "conflict", "context"]);

		nextState.setMapViewMode("globe");
		nextState.setFlatViewState(null);
	});
});
