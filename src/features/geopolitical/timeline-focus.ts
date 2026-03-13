import {
	type GeoReplayRangeMs,
	resolveGeoEventTimestampMs,
} from "@/features/geopolitical/replay-window";
import type { GeoEvent } from "@/lib/geopolitical/types";

interface BuildGeoTimelineSelectionFocusInput {
	event: GeoEvent;
	domainMs: GeoReplayRangeMs | null;
	viewRangeMs: GeoReplayRangeMs | null;
	defaultWindowMs?: number;
}

export interface GeoTimelineSelectionFocus {
	selectedTimeMs: number;
	viewRangeMs: GeoReplayRangeMs | null;
	regionId: string | null;
}

interface BuildGeoTimelineTimeFocusInput {
	selectedTimeMs: number;
	domainMs: GeoReplayRangeMs | null;
	viewRangeMs: GeoReplayRangeMs | null;
	defaultWindowMs?: number;
}

function clampRangeToDomain(
	rangeMs: GeoReplayRangeMs,
	domainMs: GeoReplayRangeMs | null,
): GeoReplayRangeMs {
	if (!domainMs) return rangeMs;
	const [domainStartMs, domainEndMs] = domainMs;
	const domainMin = Math.min(domainStartMs, domainEndMs);
	const domainMax = Math.max(domainStartMs, domainEndMs);
	const durationMs = Math.max(0, rangeMs[1] - rangeMs[0]);
	if (durationMs >= domainMax - domainMin) return [domainMin, domainMax];

	let startMs = rangeMs[0];
	let endMs = rangeMs[1];
	if (startMs < domainMin) {
		const deltaMs = domainMin - startMs;
		startMs += deltaMs;
		endMs += deltaMs;
	}
	if (endMs > domainMax) {
		const deltaMs = endMs - domainMax;
		startMs -= deltaMs;
		endMs -= deltaMs;
	}
	return [Math.max(domainMin, startMs), Math.min(domainMax, endMs)];
}

export function buildGeoTimelineSelectionFocus({
	event,
	domainMs,
	viewRangeMs,
	defaultWindowMs = 24 * 3_600_000,
}: BuildGeoTimelineSelectionFocusInput): GeoTimelineSelectionFocus | null {
	const selectedTimeMs = resolveGeoEventTimestampMs(event);
	if (selectedTimeMs === null || !Number.isFinite(selectedTimeMs)) return null;

	const timeFocus = buildGeoTimelineTimeFocus({
		selectedTimeMs,
		domainMs,
		viewRangeMs,
		defaultWindowMs,
	});
	if (!timeFocus) return null;

	return {
		...timeFocus,
		regionId: event.regionIds.find((value) => value.trim()) ?? null,
	};
}

export function buildGeoTimelineTimeFocus({
	selectedTimeMs,
	domainMs,
	viewRangeMs,
	defaultWindowMs = 24 * 3_600_000,
}: BuildGeoTimelineTimeFocusInput): Omit<GeoTimelineSelectionFocus, "regionId"> | null {
	if (!Number.isFinite(selectedTimeMs)) return null;

	if (
		viewRangeMs &&
		selectedTimeMs >= Math.min(viewRangeMs[0], viewRangeMs[1]) &&
		selectedTimeMs <= Math.max(viewRangeMs[0], viewRangeMs[1])
	) {
		return {
			selectedTimeMs,
			viewRangeMs,
		};
	}

	const durationMs =
		viewRangeMs && Number.isFinite(viewRangeMs[0]) && Number.isFinite(viewRangeMs[1])
			? Math.max(1, Math.abs(viewRangeMs[1] - viewRangeMs[0]))
			: defaultWindowMs;
	const halfWindowMs = durationMs / 2;
	const unclampedRangeMs: GeoReplayRangeMs = [
		selectedTimeMs - halfWindowMs,
		selectedTimeMs + halfWindowMs,
	];

	return {
		selectedTimeMs,
		viewRangeMs: clampRangeToDomain(unclampedRangeMs, domainMs),
	};
}
