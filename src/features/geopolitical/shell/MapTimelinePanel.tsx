import type { GeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import type { GeoReplayRangeMs } from "@/features/geopolitical/store";
import { TimelineStrip } from "@/features/geopolitical/TimelineStrip";
import type { GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";

interface MapTimelinePanelProps {
	timeline: GeoTimelineEntry[];
	events: GeoEvent[];
	selectedTimelineId: string | null;
	storyFocusPresets: GeoStoryFocusPreset[];
	activeStoryFocusPresetId: string | null;
	activeRegionId: string;
	viewRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
	activeReplayRangeMs: GeoReplayRangeMs | null;
	onViewRangeChange: (next: GeoReplayRangeMs | null) => void;
	onSelectedTimeChange: (next: number | null) => void;
	onActiveReplayRangeChange: (next: GeoReplayRangeMs | null) => void;
	onSelectEventFromTimeline?: (eventId: string) => void;
	onOpenFlatViewFromTimeline?: (eventId: string) => void;
	onTimelineReset?: () => void;
	onSelectedTimelineIdChange: (next: string | null) => void;
	onStoryFocusPresetsChange: (next: GeoStoryFocusPreset[]) => void;
	onActiveStoryFocusPresetIdChange: (next: string | null) => void;
	onActiveRegionIdChange: (next: string) => void;
}

export function MapTimelinePanel({
	timeline,
	events,
	selectedTimelineId,
	storyFocusPresets,
	activeStoryFocusPresetId,
	activeRegionId,
	viewRangeMs,
	selectedTimeMs,
	activeReplayRangeMs,
	onViewRangeChange,
	onSelectedTimeChange,
	onActiveReplayRangeChange,
	onSelectEventFromTimeline,
	onOpenFlatViewFromTimeline,
	onTimelineReset,
	onSelectedTimelineIdChange,
	onStoryFocusPresetsChange,
	onActiveStoryFocusPresetIdChange,
	onActiveRegionIdChange,
}: MapTimelinePanelProps) {
	return (
		<TimelineStrip
			timeline={timeline}
			events={events}
			selectedTimelineId={selectedTimelineId}
			storyFocusPresets={storyFocusPresets}
			activeStoryFocusPresetId={activeStoryFocusPresetId}
			activeRegionId={activeRegionId}
			viewRangeMs={viewRangeMs}
			selectedTimeMs={selectedTimeMs}
			activeReplayRangeMs={activeReplayRangeMs}
			onViewRangeChange={onViewRangeChange}
			onSelectedTimeChange={onSelectedTimeChange}
			onActiveReplayRangeChange={onActiveReplayRangeChange}
			onSelectEventFromTimeline={onSelectEventFromTimeline}
			onOpenFlatViewFromTimeline={onOpenFlatViewFromTimeline}
			onTimelineReset={onTimelineReset}
			onSelectedTimelineIdChange={onSelectedTimelineIdChange}
			onStoryFocusPresetsChange={onStoryFocusPresetsChange}
			onActiveStoryFocusPresetIdChange={onActiveStoryFocusPresetIdChange}
			onActiveRegionIdChange={onActiveRegionIdChange}
		/>
	);
}
