import { useCallback } from "react";
import {
	buildGeoFlatViewHandoffFromClusterBounds,
	buildGeoFlatViewHandoffFromDrawing,
	buildGeoFlatViewHandoffFromEvent,
	buildGeoFlatViewHandoffFromRegionEvents,
	buildGeoFlatViewHandoffFromStoryPreset,
	type GeoFlatViewBounds,
} from "@/features/geopolitical/flat-view/flat-view-handoff";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view/flat-view-state";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import type { GeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import type { GeoMapBody, GeoReplayRangeMs } from "@/features/geopolitical/store";
import type { GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

interface UseGeoFlatViewEntryParams {
	events: GeoEvent[];
	visibleEvents: GeoEvent[];
	drawings: GeoDrawing[];
	selectedEvent: GeoEvent | null;
	selectedDrawingId: string | null;
	activeStoryFocusPreset: GeoStoryFocusPreset | null;
	activeRegionId: string;
	filterSnapshot: GeoFilterStateSnapshot;
	timelineViewRangeMs: GeoReplayRangeMs | null;
	activeReplayRangeMs: GeoReplayRangeMs | null;
	timelineSelectedTimeMs: number | null;
	mapBody: GeoMapBody;
	flatViewState: GeoFlatViewState | null;
	setPendingFlatViewHandoff: (handoff: ReturnType<typeof buildGeoFlatViewHandoffFromEvent>) => void;
	applyPendingFlatViewHandoff: () => void;
	setMapViewMode: (next: "globe" | "flat") => void;
}

interface ResolveGeoFlatViewHandoffFromCurrentContextParams {
	events: GeoEvent[];
	visibleEvents: GeoEvent[];
	drawings: GeoDrawing[];
	selectedEvent: GeoEvent | null;
	selectedDrawingId: string | null;
	activeStoryFocusPreset: GeoStoryFocusPreset | null;
	activeRegionId: string;
	filterSnapshot: GeoFilterStateSnapshot;
	timelineViewRangeMs: GeoReplayRangeMs | null;
	activeReplayRangeMs: GeoReplayRangeMs | null;
	timelineSelectedTimeMs: number | null;
	mapBody: GeoMapBody;
}

export type GeoFlatViewEntryAction =
	| {
			type: "handoff";
			handoff: ReturnType<typeof buildGeoFlatViewHandoffFromEvent>;
	  }
	| {
			type: "reuse_existing_flat_state";
	  }
	| {
			type: "none";
	  };

export function resolveGeoFlatViewHandoffFromCurrentContext({
	events,
	visibleEvents,
	drawings,
	selectedEvent,
	selectedDrawingId,
	activeStoryFocusPreset,
	activeRegionId,
	filterSnapshot,
	timelineViewRangeMs,
	activeReplayRangeMs,
	timelineSelectedTimeMs,
	mapBody,
}: ResolveGeoFlatViewHandoffFromCurrentContextParams) {
	if (activeStoryFocusPreset) {
		const storyEvent =
			activeStoryFocusPreset.linkedEventId !== null
				? (events.find((event) => event.id === activeStoryFocusPreset.linkedEventId) ?? null)
				: null;
		return buildGeoFlatViewHandoffFromStoryPreset({
			preset: activeStoryFocusPreset,
			filterSnapshot,
			event: storyEvent,
			mapBody,
		});
	}

	if (selectedEvent) {
		return buildGeoFlatViewHandoffFromEvent({
			event: selectedEvent,
			filterSnapshot,
			viewRangeMs: timelineViewRangeMs,
			filterRangeMs: activeReplayRangeMs,
			selectedTimeMs: timelineSelectedTimeMs,
			mapBody,
		});
	}

	if (selectedDrawingId) {
		const selectedDrawing = drawings.find((drawing) => drawing.id === selectedDrawingId) ?? null;
		if (selectedDrawing) {
			return buildGeoFlatViewHandoffFromDrawing({
				drawing: selectedDrawing,
				filterSnapshot,
				viewRangeMs: timelineViewRangeMs,
				filterRangeMs: activeReplayRangeMs,
				selectedTimeMs: timelineSelectedTimeMs,
				mapBody,
			});
		}
	}

	if (activeRegionId) {
		return buildGeoFlatViewHandoffFromRegionEvents({
			regionId: activeRegionId,
			events: visibleEvents,
			filterSnapshot,
			viewRangeMs: timelineViewRangeMs,
			filterRangeMs: activeReplayRangeMs,
			selectedTimeMs: timelineSelectedTimeMs,
			mapBody,
		});
	}

	return null;
}

export function resolveGeoFlatViewEntryActionFromCurrentContext(
	params: ResolveGeoFlatViewHandoffFromCurrentContextParams & {
		flatViewState: GeoFlatViewState | null;
	},
): GeoFlatViewEntryAction {
	const handoff = resolveGeoFlatViewHandoffFromCurrentContext(params);
	if (handoff) {
		return {
			type: "handoff",
			handoff,
		};
	}
	if (params.flatViewState) {
		return {
			type: "reuse_existing_flat_state",
		};
	}
	return {
		type: "none",
	};
}

export function useGeoFlatViewEntry({
	events,
	visibleEvents,
	drawings,
	selectedEvent,
	selectedDrawingId,
	activeStoryFocusPreset,
	activeRegionId,
	filterSnapshot,
	timelineViewRangeMs,
	activeReplayRangeMs,
	timelineSelectedTimeMs,
	mapBody,
	flatViewState,
	setPendingFlatViewHandoff,
	applyPendingFlatViewHandoff,
	setMapViewMode,
}: UseGeoFlatViewEntryParams) {
	const openFlatViewForEvent = useCallback(
		(event: GeoEvent) => {
			const handoff = buildGeoFlatViewHandoffFromEvent({
				event,
				filterSnapshot,
				viewRangeMs: timelineViewRangeMs,
				filterRangeMs: activeReplayRangeMs,
				selectedTimeMs: timelineSelectedTimeMs,
				mapBody,
			});
			setPendingFlatViewHandoff(handoff);
			applyPendingFlatViewHandoff();
		},
		[
			activeReplayRangeMs,
			applyPendingFlatViewHandoff,
			filterSnapshot,
			mapBody,
			setPendingFlatViewHandoff,
			timelineSelectedTimeMs,
			timelineViewRangeMs,
		],
	);

	const openFlatViewFromCurrentContext = useCallback(() => {
		const action = resolveGeoFlatViewEntryActionFromCurrentContext({
			events,
			visibleEvents,
			drawings,
			selectedEvent,
			selectedDrawingId,
			activeStoryFocusPreset,
			activeRegionId,
			filterSnapshot,
			timelineViewRangeMs,
			activeReplayRangeMs,
			timelineSelectedTimeMs,
			mapBody,
			flatViewState,
		});
		if (action.type === "handoff") {
			setPendingFlatViewHandoff(action.handoff);
			applyPendingFlatViewHandoff();
			return;
		}
		if (action.type === "reuse_existing_flat_state") {
			setMapViewMode("flat");
		}
	}, [
		activeRegionId,
		activeReplayRangeMs,
		activeStoryFocusPreset,
		applyPendingFlatViewHandoff,
		drawings,
		events,
		filterSnapshot,
		flatViewState,
		mapBody,
		selectedEvent,
		selectedDrawingId,
		setMapViewMode,
		setPendingFlatViewHandoff,
		timelineSelectedTimeMs,
		timelineViewRangeMs,
		visibleEvents,
	]);

	const openFlatViewForEventId = useCallback(
		(eventId: string) => {
			const nextEvent = events.find((event) => event.id === eventId) ?? null;
			if (!nextEvent) return;
			openFlatViewForEvent(nextEvent);
		},
		[events, openFlatViewForEvent],
	);

	const openFlatViewForRegion = useCallback(
		(regionId: string) => {
			const handoff = buildGeoFlatViewHandoffFromRegionEvents({
				regionId,
				events: visibleEvents,
				filterSnapshot,
				viewRangeMs: timelineViewRangeMs,
				filterRangeMs: activeReplayRangeMs,
				selectedTimeMs: timelineSelectedTimeMs,
				mapBody,
			});
			if (!handoff) return;
			setPendingFlatViewHandoff(handoff);
			applyPendingFlatViewHandoff();
		},
		[
			activeReplayRangeMs,
			applyPendingFlatViewHandoff,
			filterSnapshot,
			mapBody,
			setPendingFlatViewHandoff,
			timelineSelectedTimeMs,
			timelineViewRangeMs,
			visibleEvents,
		],
	);

	const openFlatViewForSelectedDrawing = useCallback(() => {
		if (!selectedDrawingId) return;
		const selectedDrawing = drawings.find((drawing) => drawing.id === selectedDrawingId) ?? null;
		if (!selectedDrawing) return;
		const handoff = buildGeoFlatViewHandoffFromDrawing({
			drawing: selectedDrawing,
			filterSnapshot,
			viewRangeMs: timelineViewRangeMs,
			filterRangeMs: activeReplayRangeMs,
			selectedTimeMs: timelineSelectedTimeMs,
			mapBody,
		});
		if (!handoff) return;
		setPendingFlatViewHandoff(handoff);
		applyPendingFlatViewHandoff();
	}, [
		activeReplayRangeMs,
		applyPendingFlatViewHandoff,
		drawings,
		filterSnapshot,
		mapBody,
		selectedDrawingId,
		setPendingFlatViewHandoff,
		timelineSelectedTimeMs,
		timelineViewRangeMs,
	]);

	const openFlatViewForClusterBounds = useCallback(
		(bounds: GeoFlatViewBounds) => {
			const handoff = buildGeoFlatViewHandoffFromClusterBounds({
				bounds,
				filterSnapshot,
				viewRangeMs: timelineViewRangeMs,
				filterRangeMs: activeReplayRangeMs,
				selectedTimeMs: timelineSelectedTimeMs,
				mapBody,
			});
			setPendingFlatViewHandoff(handoff);
			applyPendingFlatViewHandoff();
		},
		[
			activeReplayRangeMs,
			applyPendingFlatViewHandoff,
			filterSnapshot,
			mapBody,
			setPendingFlatViewHandoff,
			timelineSelectedTimeMs,
			timelineViewRangeMs,
		],
	);

	const backToGlobe = useCallback(() => {
		setMapViewMode("globe");
	}, [setMapViewMode]);

	return {
		canOpenFlatView:
			mapBody === "earth" &&
			(selectedEvent !== null ||
				activeStoryFocusPreset !== null ||
				activeRegionId.length > 0 ||
				selectedDrawingId !== null ||
				flatViewState !== null),
		openFlatViewFromCurrentContext,
		openFlatViewForEvent,
		openFlatViewForEventId,
		openFlatViewForRegion,
		openFlatViewForSelectedDrawing,
		openFlatViewForClusterBounds,
		backToGlobe,
	};
}
