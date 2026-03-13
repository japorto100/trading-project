import {
	filterGeoCandidatesByFilters,
	filterGeoEventsByFilters,
	filterGeoNewsByFilters,
	filterGeoTimelineByVisibleEvents,
	type GeoFilterStateSnapshot,
} from "@/features/geopolitical/geo-filter-contract";
import {
	filterGeoCandidatesByReplayRange,
	filterGeoContextItemsByReplayRange,
	filterGeoEventsByReplayRange,
	filterGeoGameTheoryItemsByReplayRange,
	filterGeoNewsByReplayRange,
	filterGeoTimelineByReplayRange,
	type GeoReplayRangeMs,
} from "@/features/geopolitical/replay-window";
import type { GeoContextItem, GeoGameTheoryItem } from "@/features/geopolitical/shell/types";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

function normalizeGeoRegionToken(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function filterGeoContextItemsByActiveRegion(
	items: GeoContextItem[],
	filterSnapshot: GeoFilterStateSnapshot,
): GeoContextItem[] {
	const regionToken = filterSnapshot.activeRegionId || filterSnapshot.acledRegionFilter;
	if (!regionToken.trim()) return items;
	const normalizedRegionToken = normalizeGeoRegionToken(regionToken);
	return items.filter((item) => {
		if (!item.region?.trim()) return true;
		return normalizeGeoRegionToken(item.region) === normalizedRegionToken;
	});
}

export interface BuildVisibleGeoWorkspaceDataParams {
	events: GeoEvent[];
	candidates: GeoCandidate[];
	timeline: GeoTimelineEntry[];
	news: MarketNewsArticle[];
	contextItems: GeoContextItem[];
	gameTheoryItems: GeoGameTheoryItem[];
	replayRangeMs: GeoReplayRangeMs | null;
	filterSnapshot: GeoFilterStateSnapshot;
}

export function buildVisibleGeoWorkspaceData({
	events,
	candidates,
	timeline,
	news,
	contextItems,
	gameTheoryItems,
	replayRangeMs,
	filterSnapshot,
}: BuildVisibleGeoWorkspaceDataParams) {
	const replayFilteredEvents = filterGeoEventsByReplayRange(events, replayRangeMs);
	const replayFilteredCandidates = filterGeoCandidatesByReplayRange(candidates, replayRangeMs);
	const replayFilteredTimeline = filterGeoTimelineByReplayRange(timeline, replayRangeMs);
	const replayFilteredNews = filterGeoNewsByReplayRange(news, replayRangeMs);
	const replayFilteredContextItems = filterGeoContextItemsByReplayRange(
		contextItems,
		replayRangeMs,
	);
	const replayFilteredGameTheoryItems = filterGeoGameTheoryItemsByReplayRange(
		gameTheoryItems,
		replayRangeMs,
	);
	const visibleEvents = filterGeoEventsByFilters(replayFilteredEvents, filterSnapshot);
	const visibleCandidates = filterGeoCandidatesByFilters(replayFilteredCandidates, filterSnapshot);
	const visibleTimeline = filterGeoTimelineByVisibleEvents(replayFilteredTimeline, visibleEvents);
	const visibleEventIds = new Set(visibleEvents.map((event) => event.id));
	const visibleNews = filterGeoNewsByFilters(replayFilteredNews, filterSnapshot);
	const visibleContextItems = filterGeoContextItemsByActiveRegion(
		replayFilteredContextItems,
		filterSnapshot,
	);
	const visibleGameTheoryItems = replayFilteredGameTheoryItems.filter((item) =>
		visibleEventIds.has(item.eventId),
	);

	return {
		replayFilteredCandidates,
		replayFilteredNews,
		visibleCandidates,
		visibleNews,
		replayFilteredContextItems,
		replayFilteredGameTheoryItems,
		visibleContextItems,
		visibleGameTheoryItems,
		visibleEvents,
		visibleTimeline,
	};
}
