import type { GeoReplayRangeMs } from "@/features/geopolitical/replay-window";
import {
	buildGeoTimelineSelectionFocus,
	type GeoTimelineSelectionFocus,
} from "@/features/geopolitical/timeline/timeline-focus";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface BuildGeoEventStoryFocusInput {
	event: GeoEvent;
	domainMs: GeoReplayRangeMs | null;
	viewRangeMs: GeoReplayRangeMs | null;
	activeRegionId: string;
	defaultWindowMs?: number;
}

export interface GeoEventStoryFocusState extends GeoTimelineSelectionFocus {
	regionIdToAdopt: string | null;
}

export interface GeoStoryFocusPreset {
	id: string;
	label: string;
	linkedEventId: string | null;
	selectedTimeMs: number;
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	regionId: string | null;
}

export function removeGeoStoryFocusPreset(
	presets: GeoStoryFocusPreset[],
	presetId: string,
): GeoStoryFocusPreset[] {
	return presets.filter((item) => item.id !== presetId);
}

export function buildGeoEventStoryFocusState({
	event,
	domainMs,
	viewRangeMs,
	activeRegionId,
	defaultWindowMs,
}: BuildGeoEventStoryFocusInput): GeoEventStoryFocusState | null {
	const timelineFocus = buildGeoTimelineSelectionFocus({
		event,
		domainMs,
		viewRangeMs,
		defaultWindowMs,
	});
	if (!timelineFocus) return null;

	return {
		...timelineFocus,
		regionIdToAdopt: activeRegionId ? null : timelineFocus.regionId,
	};
}

export function buildGeoStoryFocusPreset(params: {
	id: string;
	label: string;
	linkedEventId: string | null;
	selectedTimeMs: number;
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	regionId: string | null;
}): GeoStoryFocusPreset {
	return {
		...params,
		viewRangeMs: params.viewRangeMs ? [...params.viewRangeMs] : null,
		filterRangeMs: params.filterRangeMs ? [...params.filterRangeMs] : null,
	};
}

export function upsertGeoStoryFocusPreset(
	presets: GeoStoryFocusPreset[],
	preset: GeoStoryFocusPreset,
	maxItems = 5,
): GeoStoryFocusPreset[] {
	const next = [preset, ...presets.filter((item) => item.id !== preset.id)];
	return next.slice(0, maxItems);
}
