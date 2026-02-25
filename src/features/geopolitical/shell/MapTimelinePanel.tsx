import { TimelineStrip } from "@/features/geopolitical/TimelineStrip";
import type { GeoTimelineEntry } from "@/lib/geopolitical/types";

interface MapTimelinePanelProps {
	timeline: GeoTimelineEntry[];
}

export function MapTimelinePanel({ timeline }: MapTimelinePanelProps) {
	return <TimelineStrip timeline={timeline} />;
}
