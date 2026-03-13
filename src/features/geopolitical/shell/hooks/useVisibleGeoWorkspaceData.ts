import { useEffect, useMemo } from "react";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import type { GeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import type { GeoContextItem, GeoGameTheoryItem } from "@/features/geopolitical/shell/types";
import type { GeoReplayRangeMs } from "@/features/geopolitical/store";
import { buildVisibleGeoWorkspaceData } from "@/features/geopolitical/visible-geo-workspace";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

interface UseVisibleGeoWorkspaceDataParams {
	events: GeoEvent[];
	candidates: GeoCandidate[];
	timeline: GeoTimelineEntry[];
	news: MarketNewsArticle[];
	contextItems: GeoContextItem[];
	gameTheoryItems: GeoGameTheoryItem[];
	replayRangeMs: GeoReplayRangeMs | null;
	filterSnapshot: GeoFilterStateSnapshot;
	selectedEventId: string | null;
	selectedTimelineId: string | null;
	activeStoryFocusPresetId: string | null;
	storyFocusPresets: GeoStoryFocusPreset[];
	onSelectedEventIdChange: (next: string | null) => void;
	onSelectedTimelineIdChange: (next: string | null) => void;
	onActiveStoryFocusPresetIdChange: (next: string | null) => void;
}

export function useVisibleGeoWorkspaceData({
	events,
	candidates,
	timeline,
	news,
	contextItems,
	gameTheoryItems,
	replayRangeMs,
	filterSnapshot,
	selectedEventId,
	selectedTimelineId,
	activeStoryFocusPresetId,
	storyFocusPresets,
	onSelectedEventIdChange,
	onSelectedTimelineIdChange,
	onActiveStoryFocusPresetIdChange,
}: UseVisibleGeoWorkspaceDataParams) {
	const visibleWorkspace = useMemo(
		() =>
			buildVisibleGeoWorkspaceData({
				events,
				candidates,
				timeline,
				news,
				contextItems,
				gameTheoryItems,
				replayRangeMs,
				filterSnapshot,
			}),
		[
			candidates,
			contextItems,
			events,
			filterSnapshot,
			gameTheoryItems,
			news,
			replayRangeMs,
			timeline,
		],
	);

	useEffect(() => {
		if (!selectedEventId) return;
		const selectedStillVisible = visibleWorkspace.visibleEvents.some(
			(event) => event.id === selectedEventId,
		);
		if (!selectedStillVisible) {
			onSelectedEventIdChange(null);
		}
	}, [onSelectedEventIdChange, selectedEventId, visibleWorkspace.visibleEvents]);

	useEffect(() => {
		if (!selectedTimelineId) return;
		const selectedStillVisible = visibleWorkspace.visibleTimeline.some(
			(entry) => entry.id === selectedTimelineId,
		);
		if (!selectedStillVisible) {
			onSelectedTimelineIdChange(null);
		}
	}, [onSelectedTimelineIdChange, selectedTimelineId, visibleWorkspace.visibleTimeline]);

	useEffect(() => {
		if (!activeStoryFocusPresetId) return;
		const presetStillVisible = storyFocusPresets.some(
			(preset) => preset.id === activeStoryFocusPresetId,
		);
		if (!presetStillVisible) {
			onActiveStoryFocusPresetIdChange(null);
		}
	}, [activeStoryFocusPresetId, onActiveStoryFocusPresetIdChange, storyFocusPresets]);

	return visibleWorkspace;
}
