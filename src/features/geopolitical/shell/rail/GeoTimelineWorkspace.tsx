"use client";

import type { GeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import { GeoPanelFrame } from "@/features/geopolitical/shell/panels/GeoPanelFrame";
import type { GeoReplayRangeMs } from "@/features/geopolitical/store";
import { MapTimelinePanel } from "@/features/geopolitical/timeline/MapTimelinePanel";
import type { GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";

interface GeoTimelineWorkspaceProps {
	timeline: GeoTimelineEntry[];
	events: GeoEvent[];
	selectedTimelineId: string | null;
	storyFocusPresets: GeoStoryFocusPreset[];
	activeStoryFocusPresetId: string | null;
	activeRegionId: string;
	timelineViewRangeMs: GeoReplayRangeMs | null;
	timelineSelectedTimeMs: number | null;
	activeReplayRangeMs: GeoReplayRangeMs | null;
	onTimelineViewRangeChange: (next: GeoReplayRangeMs | null) => void;
	onTimelineSelectedTimeChange: (next: number | null) => void;
	onActiveReplayRangeChange: (next: GeoReplayRangeMs | null) => void;
	onSelectEventFromTimeline?: (eventId: string) => void;
	onOpenFlatViewFromTimeline?: (eventId: string) => void;
	onTimelineReset?: () => void;
	onSelectedTimelineIdChange: (next: string | null) => void;
	onStoryFocusPresetsChange: (next: GeoStoryFocusPreset[]) => void;
	onActiveStoryFocusPresetIdChange: (next: string | null) => void;
	onActiveRegionIdChange: (next: string) => void;
}

export function GeoTimelineWorkspace({
	timeline,
	events,
	selectedTimelineId,
	storyFocusPresets,
	activeStoryFocusPresetId,
	activeRegionId,
	timelineViewRangeMs,
	timelineSelectedTimeMs,
	activeReplayRangeMs,
	onTimelineViewRangeChange,
	onTimelineSelectedTimeChange,
	onActiveReplayRangeChange,
	onSelectEventFromTimeline,
	onOpenFlatViewFromTimeline,
	onTimelineReset,
	onSelectedTimelineIdChange,
	onStoryFocusPresetsChange,
	onActiveStoryFocusPresetIdChange,
	onActiveRegionIdChange,
}: GeoTimelineWorkspaceProps) {
	return (
		<div className="p-3">
			{timeline.length === 0 ? (
				<GeoPanelFrame title="Timeline" description="No timeline entries available.">
					<div />
				</GeoPanelFrame>
			) : (
				<MapTimelinePanel
					timeline={timeline.slice(0, 80)}
					events={events}
					selectedTimelineId={selectedTimelineId}
					storyFocusPresets={storyFocusPresets}
					activeStoryFocusPresetId={activeStoryFocusPresetId}
					activeRegionId={activeRegionId}
					viewRangeMs={timelineViewRangeMs}
					selectedTimeMs={timelineSelectedTimeMs}
					activeReplayRangeMs={activeReplayRangeMs}
					onViewRangeChange={onTimelineViewRangeChange}
					onSelectedTimeChange={onTimelineSelectedTimeChange}
					onActiveReplayRangeChange={onActiveReplayRangeChange}
					onSelectEventFromTimeline={onSelectEventFromTimeline}
					onOpenFlatViewFromTimeline={onOpenFlatViewFromTimeline}
					onTimelineReset={onTimelineReset}
					onSelectedTimelineIdChange={onSelectedTimelineIdChange}
					onStoryFocusPresetsChange={onStoryFocusPresetsChange}
					onActiveStoryFocusPresetIdChange={onActiveStoryFocusPresetIdChange}
					onActiveRegionIdChange={onActiveRegionIdChange}
				/>
			)}
		</div>
	);
}
