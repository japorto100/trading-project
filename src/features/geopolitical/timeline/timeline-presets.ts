import type { GeoReplayRangeMs } from "@/features/geopolitical/store";

export type GeoTimelinePresetId = "24h" | "7d" | "1m" | "all";

export interface GeoTimelinePresetOption {
	id: GeoTimelinePresetId;
	label: string;
}

export const GEO_TIMELINE_PRESET_OPTIONS: GeoTimelinePresetOption[] = [
	{ id: "24h", label: "24H" },
	{ id: "7d", label: "7D" },
	{ id: "1m", label: "1M" },
	{ id: "all", label: "ALL" },
];

export interface GeoTimelineResetState {
	playbackEnabled: boolean;
	playbackRunning: boolean;
	brushRangeMs: GeoReplayRangeMs | null;
	playbackCursorMs: number | null;
}

export function clampGeoTimelineRangeToDomain(
	rangeMs: GeoReplayRangeMs | null,
	domainMs: GeoReplayRangeMs | null,
): GeoReplayRangeMs | null {
	if (!rangeMs || !domainMs) return rangeMs;
	const [rangeStartMs, rangeEndMs] = rangeMs;
	const [domainStartMs, domainEndMs] = domainMs;
	if (
		!Number.isFinite(rangeStartMs) ||
		!Number.isFinite(rangeEndMs) ||
		!Number.isFinite(domainStartMs) ||
		!Number.isFinite(domainEndMs)
	) {
		return null;
	}
	const minDomainMs = Math.min(domainStartMs, domainEndMs);
	const maxDomainMs = Math.max(domainStartMs, domainEndMs);
	const minRangeMs = Math.min(rangeStartMs, rangeEndMs);
	const maxRangeMs = Math.max(rangeStartMs, rangeEndMs);
	const durationMs = Math.max(0, maxRangeMs - minRangeMs);
	const domainDurationMs = Math.max(0, maxDomainMs - minDomainMs);
	if (durationMs >= domainDurationMs) return null;

	let nextStartMs = minRangeMs;
	let nextEndMs = maxRangeMs;
	if (nextStartMs < minDomainMs) {
		const deltaMs = minDomainMs - nextStartMs;
		nextStartMs += deltaMs;
		nextEndMs += deltaMs;
	}
	if (nextEndMs > maxDomainMs) {
		const deltaMs = nextEndMs - maxDomainMs;
		nextStartMs -= deltaMs;
		nextEndMs -= deltaMs;
	}
	nextStartMs = Math.max(minDomainMs, nextStartMs);
	nextEndMs = Math.min(maxDomainMs, nextEndMs);

	if (nextStartMs <= minDomainMs && nextEndMs >= maxDomainMs) {
		return null;
	}
	return [nextStartMs, nextEndMs];
}

export function clampGeoTimelineSelectedTimeToDomain(
	selectedTimeMs: number | null,
	domainMs: GeoReplayRangeMs | null,
): number | null {
	if (selectedTimeMs === null || !domainMs) return selectedTimeMs;
	const [domainStartMs, domainEndMs] = domainMs;
	if (
		!Number.isFinite(selectedTimeMs) ||
		!Number.isFinite(domainStartMs) ||
		!Number.isFinite(domainEndMs)
	) {
		return null;
	}
	const minDomainMs = Math.min(domainStartMs, domainEndMs);
	const maxDomainMs = Math.max(domainStartMs, domainEndMs);
	if (selectedTimeMs < minDomainMs || selectedTimeMs > maxDomainMs) return null;
	return selectedTimeMs;
}

export function buildGeoTimelinePresetRange(
	domainMs: GeoReplayRangeMs | null,
	preset: GeoTimelinePresetId,
): GeoReplayRangeMs | null {
	if (!domainMs) return null;
	const [startMs, endMs] = domainMs;
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
	if (preset === "all") {
		return [Math.min(startMs, endMs), Math.max(startMs, endMs)];
	}
	const durationMs =
		preset === "24h" ? 24 * 3_600_000 : preset === "7d" ? 7 * 24 * 3_600_000 : 30 * 24 * 3_600_000;
	const safeEndMs = Math.max(startMs, endMs);
	return [Math.max(Math.min(startMs, endMs), safeEndMs - durationMs), safeEndMs];
}

export function buildGeoTimelineResetState(
	domainMs: GeoReplayRangeMs | null,
): GeoTimelineResetState {
	return {
		playbackEnabled: false,
		playbackRunning: false,
		brushRangeMs: null,
		playbackCursorMs: domainMs ? Math.max(domainMs[0], domainMs[1]) : null,
	};
}
