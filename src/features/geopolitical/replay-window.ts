import type { GeoContextItem, GeoGameTheoryItem } from "@/features/geopolitical/shell/types";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

export type GeoReplayRangeMs = [number, number];

interface BuildEffectiveReplayRangeParams {
	playbackRangeMs: GeoReplayRangeMs | null;
	brushRangeMs: GeoReplayRangeMs | null;
}

function clampRange(rangeMs: GeoReplayRangeMs): GeoReplayRangeMs | null {
	const [startMs, endMs] = rangeMs;
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
	return [Math.min(startMs, endMs), Math.max(startMs, endMs)];
}

export function buildEffectiveReplayRangeMs({
	playbackRangeMs,
	brushRangeMs,
}: BuildEffectiveReplayRangeParams): GeoReplayRangeMs | null {
	const normalizedPlayback = playbackRangeMs ? clampRange(playbackRangeMs) : null;
	const normalizedBrush = brushRangeMs ? clampRange(brushRangeMs) : null;
	if (!normalizedPlayback) return normalizedBrush;
	if (!normalizedBrush) return normalizedPlayback;

	const startMs = Math.max(normalizedPlayback[0], normalizedBrush[0]);
	const endMs = Math.min(normalizedPlayback[1], normalizedBrush[1]);
	if (startMs > endMs) return null;
	return [startMs, endMs];
}

function isWithinReplayRange(
	timestampMs: number | null,
	replayRangeMs: GeoReplayRangeMs | null,
): boolean {
	if (!replayRangeMs) return true;
	if (timestampMs === null) return true;
	return timestampMs >= replayRangeMs[0] && timestampMs <= replayRangeMs[1];
}

export function resolveGeoEventTimestampMs(event: GeoEvent): number | null {
	const candidates = [event.validFrom, event.createdAt, event.updatedAt];
	for (const value of candidates) {
		if (!value) continue;
		const timestampMs = Date.parse(value);
		if (Number.isFinite(timestampMs)) return timestampMs;
	}
	return null;
}

function resolveCandidateTimestampMs(candidate: GeoCandidate): number | null {
	const timestampMs = Date.parse(candidate.generatedAt);
	return Number.isFinite(timestampMs) ? timestampMs : null;
}

function resolveTimelineTimestampMs(entry: GeoTimelineEntry): number | null {
	const timestampMs = Date.parse(entry.at);
	return Number.isFinite(timestampMs) ? timestampMs : null;
}

function resolveNewsTimestampMs(article: MarketNewsArticle): number | null {
	const timestampMs = Date.parse(article.publishedAt);
	return Number.isFinite(timestampMs) ? timestampMs : null;
}

function resolveContextTimestampMs(item: GeoContextItem): number | null {
	if (!item.publishedAt) return null;
	const timestampMs = Date.parse(item.publishedAt);
	return Number.isFinite(timestampMs) ? timestampMs : null;
}

function resolveGameTheoryTimestampMs(item: GeoGameTheoryItem): number | null {
	const timestampMs = Date.parse(item.eventDate);
	return Number.isFinite(timestampMs) ? timestampMs : null;
}

export function filterGeoEventsByReplayRange(
	events: GeoEvent[],
	replayRangeMs: GeoReplayRangeMs | null,
): GeoEvent[] {
	return events.filter((event) =>
		isWithinReplayRange(resolveGeoEventTimestampMs(event), replayRangeMs),
	);
}

export function filterGeoCandidatesByReplayRange(
	candidates: GeoCandidate[],
	replayRangeMs: GeoReplayRangeMs | null,
): GeoCandidate[] {
	return candidates.filter((candidate) =>
		isWithinReplayRange(resolveCandidateTimestampMs(candidate), replayRangeMs),
	);
}

export function filterGeoTimelineByReplayRange(
	timeline: GeoTimelineEntry[],
	replayRangeMs: GeoReplayRangeMs | null,
): GeoTimelineEntry[] {
	return timeline.filter((entry) =>
		isWithinReplayRange(resolveTimelineTimestampMs(entry), replayRangeMs),
	);
}

export function filterGeoTimelineByViewRange(
	timeline: GeoTimelineEntry[],
	viewRangeMs: GeoReplayRangeMs | null,
): GeoTimelineEntry[] {
	return filterGeoTimelineByReplayRange(timeline, viewRangeMs);
}

export function filterGeoNewsByReplayRange(
	articles: MarketNewsArticle[],
	replayRangeMs: GeoReplayRangeMs | null,
): MarketNewsArticle[] {
	return articles.filter((article) =>
		isWithinReplayRange(resolveNewsTimestampMs(article), replayRangeMs),
	);
}

export function filterGeoContextItemsByReplayRange(
	items: GeoContextItem[],
	replayRangeMs: GeoReplayRangeMs | null,
): GeoContextItem[] {
	return items.filter((item) =>
		isWithinReplayRange(resolveContextTimestampMs(item), replayRangeMs),
	);
}

export function filterGeoGameTheoryItemsByReplayRange(
	items: GeoGameTheoryItem[],
	replayRangeMs: GeoReplayRangeMs | null,
): GeoGameTheoryItem[] {
	return items.filter((item) =>
		isWithinReplayRange(resolveGameTheoryTimestampMs(item), replayRangeMs),
	);
}
