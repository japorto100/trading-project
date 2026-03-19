import type { GeoMapLayerFamily } from "@/features/geopolitical/layer-taxonomy";
import {
	type GeoReplayRangeMs,
	resolveGeoEventTimestampMs,
} from "@/features/geopolitical/replay-window";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface GeoFlatViewTimelineBucket {
	startMs: number;
	endMs: number;
	count: number;
	maxSeverity: number;
	strikeCount: number;
	targetCount: number;
	assetCount: number;
	heatIntensity: number;
	eventIds: string[];
	inFilterRange: boolean;
	containsSelectedTime: boolean;
}

export interface GeoFlatViewTimelineModel {
	conflictLayerActive: boolean;
	rangeMs: GeoReplayRangeMs | null;
	bucketSizeMs: number | null;
	selectedBucketIndex: number | null;
	buckets: GeoFlatViewTimelineBucket[];
}

function rangesOverlap(left: GeoReplayRangeMs, right: GeoReplayRangeMs): boolean {
	return left[0] <= right[1] && left[1] >= right[0];
}

function resolveTimelineRangeMs(
	events: GeoEvent[],
	viewRangeMs: GeoReplayRangeMs | null,
): GeoReplayRangeMs | null {
	if (viewRangeMs) return viewRangeMs;

	let minMs = Number.POSITIVE_INFINITY;
	let maxMs = Number.NEGATIVE_INFINITY;
	for (const event of events) {
		const timestampMs = resolveGeoEventTimestampMs(event);
		if (timestampMs === null) continue;
		minMs = Math.min(minMs, timestampMs);
		maxMs = Math.max(maxMs, timestampMs);
	}

	if (!Number.isFinite(minMs) || !Number.isFinite(maxMs)) return null;
	return [minMs, maxMs];
}

function resolveBucketSizeMs(rangeMs: GeoReplayRangeMs): number {
	const durationMs = Math.max(1, rangeMs[1] - rangeMs[0]);
	const rawBucketSizeMs = Math.ceil(durationMs / 12);
	const hourMs = 3_600_000;
	const dayMs = 24 * hourMs;

	if (rawBucketSizeMs <= hourMs) return hourMs;
	if (rawBucketSizeMs <= 6 * hourMs) return 6 * hourMs;
	if (rawBucketSizeMs <= 12 * hourMs) return 12 * hourMs;
	if (rawBucketSizeMs <= dayMs) return dayMs;
	return 3 * dayMs;
}

export function buildGeoFlatViewTimelineModel(params: {
	events: GeoEvent[];
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
	layerFamilies: GeoMapLayerFamily[];
}): GeoFlatViewTimelineModel {
	const conflictLayerActive = params.layerFamilies.includes("conflict");
	if (!conflictLayerActive) {
		return {
			conflictLayerActive,
			rangeMs: resolveTimelineRangeMs(params.events, params.viewRangeMs),
			bucketSizeMs: null,
			selectedBucketIndex: null,
			buckets: [],
		};
	}

	const rangeMs = resolveTimelineRangeMs(params.events, params.viewRangeMs);
	if (!rangeMs) {
		return {
			conflictLayerActive,
			rangeMs: null,
			bucketSizeMs: null,
			selectedBucketIndex: null,
			buckets: [],
		};
	}

	const bucketSizeMs = resolveBucketSizeMs(rangeMs);
	const bucketCount = Math.max(1, Math.ceil((rangeMs[1] - rangeMs[0] + 1) / bucketSizeMs));
	const buckets: GeoFlatViewTimelineBucket[] = Array.from({ length: bucketCount }, (_, index) => {
		const startMs = rangeMs[0] + index * bucketSizeMs;
		const endMs = Math.min(rangeMs[1], startMs + bucketSizeMs - 1);
		const bucketRange: GeoReplayRangeMs = [startMs, endMs];
		return {
			startMs,
			endMs,
			count: 0,
			maxSeverity: 0,
			strikeCount: 0,
			targetCount: 0,
			assetCount: 0,
			heatIntensity: 0,
			eventIds: [],
			inFilterRange: params.filterRangeMs
				? rangesOverlap(bucketRange, params.filterRangeMs)
				: false,
			containsSelectedTime:
				params.selectedTimeMs !== null &&
				params.selectedTimeMs >= startMs &&
				params.selectedTimeMs <= endMs,
		};
	});

	for (const event of params.events) {
		const timestampMs = resolveGeoEventTimestampMs(event);
		if (timestampMs === null || timestampMs < rangeMs[0] || timestampMs > rangeMs[1]) continue;
		const bucketIndex = Math.min(
			buckets.length - 1,
			Math.floor((timestampMs - rangeMs[0]) / bucketSizeMs),
		);
		const bucket = buckets[bucketIndex];
		if (!bucket) continue;
		const severity = Number(event.severity);
		bucket.count += 1;
		bucket.maxSeverity = Math.max(bucket.maxSeverity, severity);
		if (severity >= 4) {
			bucket.strikeCount += 1;
		}
		bucket.targetCount += Math.max(0, (event.coordinates?.length ?? 1) - 1);
		bucket.assetCount += event.assets.length;
		bucket.heatIntensity += severity;
		bucket.eventIds.push(event.id);
	}

	return {
		conflictLayerActive,
		rangeMs,
		bucketSizeMs,
		selectedBucketIndex: buckets.findIndex((bucket) => bucket.containsSelectedTime),
		buckets,
	};
}
