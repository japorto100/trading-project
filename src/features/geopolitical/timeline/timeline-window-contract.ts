import type { GeoReplayRangeMs } from "@/features/geopolitical/store";

type GeoTimelineWindowMode = "neutral" | "view_only" | "filter_only" | "linked" | "independent";

export interface GeoTimelineWindowRelationship {
	hasViewWindow: boolean;
	hasFilterWindow: boolean;
	windowsAligned: boolean;
	mode: GeoTimelineWindowMode;
}

function isSameRange(left: GeoReplayRangeMs | null, right: GeoReplayRangeMs | null): boolean {
	if (left === right) return true;
	if (!left || !right) return false;
	return left[0] === right[0] && left[1] === right[1];
}

export function copyGeoReplayRangeMs(rangeMs: GeoReplayRangeMs | null): GeoReplayRangeMs | null {
	if (!rangeMs) return null;
	return [rangeMs[0], rangeMs[1]];
}

export function getGeoTimelineWindowRelationship(
	viewRangeMs: GeoReplayRangeMs | null,
	filterRangeMs: GeoReplayRangeMs | null,
): GeoTimelineWindowRelationship {
	const hasViewWindow = Boolean(viewRangeMs);
	const hasFilterWindow = Boolean(filterRangeMs);
	const windowsAligned = isSameRange(viewRangeMs, filterRangeMs);

	if (!hasViewWindow && !hasFilterWindow) {
		return { hasViewWindow, hasFilterWindow, windowsAligned, mode: "neutral" };
	}
	if (hasViewWindow && !hasFilterWindow) {
		return { hasViewWindow, hasFilterWindow, windowsAligned, mode: "view_only" };
	}
	if (!hasViewWindow && hasFilterWindow) {
		return { hasViewWindow, hasFilterWindow, windowsAligned, mode: "filter_only" };
	}
	return {
		hasViewWindow,
		hasFilterWindow,
		windowsAligned,
		mode: windowsAligned ? "linked" : "independent",
	};
}
