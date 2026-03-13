import { useCallback } from "react";
import {
	buildGeoFlatViewHandoffFromClusterBounds,
	buildGeoFlatViewHandoffFromDrawing,
	buildGeoFlatViewHandoffFromEvent,
	buildGeoFlatViewHandoffFromRegionEvents,
	buildGeoFlatViewHandoffFromStoryPreset,
	type GeoFlatViewBounds,
} from "@/features/geopolitical/flat-view-handoff";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view-state";
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
		const storyEvent =
			activeStoryFocusPreset?.linkedEventId !== null && activeStoryFocusPreset?.linkedEventId
				? (events.find((event) => event.id === activeStoryFocusPreset.linkedEventId) ?? null)
				: null;
		const focusEvent = selectedEvent ?? storyEvent;
		if (!focusEvent) {
			if (flatViewState) {
				setMapViewMode("flat");
			}
			return;
		}
		if (activeStoryFocusPreset && focusEvent.id === activeStoryFocusPreset.linkedEventId) {
			const handoff = buildGeoFlatViewHandoffFromStoryPreset({
				preset: activeStoryFocusPreset,
				filterSnapshot,
				event: focusEvent,
				mapBody,
			});
			setPendingFlatViewHandoff(handoff);
			applyPendingFlatViewHandoff();
			return;
		}
		openFlatViewForEvent(focusEvent);
	}, [
		activeStoryFocusPreset,
		applyPendingFlatViewHandoff,
		events,
		filterSnapshot,
		flatViewState,
		mapBody,
		openFlatViewForEvent,
		selectedEvent,
		setMapViewMode,
		setPendingFlatViewHandoff,
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
