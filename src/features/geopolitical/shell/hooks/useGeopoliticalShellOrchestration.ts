import { useEffect, useMemo, useRef } from "react";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import {
	buildGeoEventStoryFocusState,
	type GeoStoryFocusPreset,
} from "@/features/geopolitical/geo-story-focus";
import { useGeoMapDerivedUiState } from "@/features/geopolitical/shell/hooks/useGeoMapDerivedUiState";
import { useVisibleGeoWorkspaceData } from "@/features/geopolitical/shell/hooks/useVisibleGeoWorkspaceData";
import type {
	GeoContextItem,
	GeoGameTheoryItem,
	GeoGraphResponse,
} from "@/features/geopolitical/shell/types";
import type {
	EventsSource,
	GeoMapBody,
	GeoReplayRangeMs,
	SourceHealthResponse,
} from "@/features/geopolitical/store";
import { buildGeoContext } from "@/lib/chat-context-builders";
import type { GeoCandidate, GeoEvent, GeoRegion, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

type NumberUpdater = number | ((previous: number) => number);

interface UseGeopoliticalShellOrchestrationParams {
	events: GeoEvent[];
	candidates: GeoCandidate[];
	timeline: GeoTimelineEntry[];
	news: MarketNewsArticle[];
	contextItems: GeoContextItem[];
	gameTheoryItems: GeoGameTheoryItem[];
	graph: GeoGraphResponse | null;
	sourceHealth: SourceHealthResponse["entries"];
	regions: GeoRegion[];
	eventsSource: EventsSource;
	activeRegionId: string;
	searchQuery: string;
	minSeverityFilter: number;
	acledCountryFilter: string;
	acledRegionFilter: string;
	acledEventTypeFilter: string;
	acledSubEventTypeFilter: string;
	acledFromFilter: string;
	acledToFilter: string;
	selectedEventId: string | null;
	selectedEventIds: string[];
	selectedTimelineId: string | null;
	activeStoryFocusPresetId: string | null;
	storyFocusPresets: GeoStoryFocusPreset[];
	activeReplayRangeMs: GeoReplayRangeMs | null;
	timelineViewRangeMs: GeoReplayRangeMs | null;
	timelineSelectedTimeMs: number | null;
	mapBody: GeoMapBody;
	chatOpen: boolean;
	setChatContext: (context: ReturnType<typeof buildGeoContext>) => void;
	setSelectedEventId: (next: string | null) => void;
	setSelectedTimelineId: (next: string | null) => void;
	setActiveStoryFocusPresetId: (next: string | null) => void;
	setActiveRegionId: (next: string) => void;
	setSearchQuery: (next: string) => void;
	setAcledCountryFilter: (next: string) => void;
	setAcledRegionFilter: (next: string) => void;
	setAcledEventTypeFilter: (next: string) => void;
	setAcledSubEventTypeFilter: (next: string) => void;
	setAcledFromFilter: (next: string) => void;
	setAcledToFilter: (next: string) => void;
	setAcledPage: (next: NumberUpdater) => void;
	setTimelineViewRangeMs: (next: GeoReplayRangeMs | null) => void;
	setTimelineSelectedTimeMs: (next: number | null) => void;
}

function isSameRange(left: [number, number] | null, right: [number, number] | null): boolean {
	if (left === right) return true;
	if (!left || !right) return false;
	return left[0] === right[0] && left[1] === right[1];
}

export function useGeopoliticalShellOrchestration({
	events,
	candidates,
	timeline,
	news,
	contextItems,
	gameTheoryItems,
	graph,
	sourceHealth,
	regions,
	eventsSource,
	activeRegionId,
	searchQuery,
	minSeverityFilter,
	acledCountryFilter,
	acledRegionFilter,
	acledEventTypeFilter,
	acledSubEventTypeFilter,
	acledFromFilter,
	acledToFilter,
	selectedEventId,
	selectedEventIds,
	selectedTimelineId,
	activeStoryFocusPresetId,
	storyFocusPresets,
	activeReplayRangeMs,
	timelineViewRangeMs,
	timelineSelectedTimeMs,
	mapBody,
	chatOpen,
	setChatContext,
	setSelectedEventId,
	setSelectedTimelineId,
	setActiveStoryFocusPresetId,
	setActiveRegionId,
	setSearchQuery,
	setAcledCountryFilter,
	setAcledRegionFilter,
	setAcledEventTypeFilter,
	setAcledSubEventTypeFilter,
	setAcledFromFilter,
	setAcledToFilter,
	setAcledPage,
	setTimelineViewRangeMs,
	setTimelineSelectedTimeMs,
}: UseGeopoliticalShellOrchestrationParams) {
	const prevChatOpenRef = useRef(false);

	const filterSnapshot = useMemo<GeoFilterStateSnapshot>(
		() => ({
			eventsSource,
			activeRegionId,
			searchQuery,
			minSeverityFilter,
			acledCountryFilter,
			acledRegionFilter,
			acledEventTypeFilter,
			acledSubEventTypeFilter,
			acledFromFilter,
			acledToFilter,
		}),
		[
			activeRegionId,
			acledCountryFilter,
			acledEventTypeFilter,
			acledFromFilter,
			acledRegionFilter,
			acledSubEventTypeFilter,
			acledToFilter,
			eventsSource,
			minSeverityFilter,
			searchQuery,
		],
	);

	const {
		visibleCandidates,
		visibleNews,
		visibleContextItems,
		visibleGameTheoryItems,
		visibleEvents,
		visibleTimeline,
	} = useVisibleGeoWorkspaceData({
		events,
		candidates,
		timeline,
		news,
		contextItems,
		gameTheoryItems,
		replayRangeMs: activeReplayRangeMs,
		filterSnapshot,
		selectedEventId,
		selectedTimelineId,
		activeStoryFocusPresetId,
		storyFocusPresets,
		onSelectedEventIdChange: setSelectedEventId,
		onSelectedTimelineIdChange: setSelectedTimelineId,
		onActiveStoryFocusPresetIdChange: setActiveStoryFocusPresetId,
	});

	const {
		acledRegionSuggestions,
		acledSubEventSuggestions,
		activeFilterChips,
		selectedEvent,
		activeRegionLabel,
	} = useGeoMapDerivedUiState({
		events,
		regions,
		selectedEventId,
		eventsSource,
		activeRegionId,
		minSeverityFilter,
		setActiveRegionId,
		searchQuery,
		setSearchQuery,
		acledCountryFilter,
		setAcledCountryFilter,
		acledRegionFilter,
		setAcledRegionFilter,
		acledEventTypeFilter,
		setAcledEventTypeFilter,
		acledSubEventTypeFilter,
		setAcledSubEventTypeFilter,
		acledFromFilter,
		setAcledFromFilter,
		acledToFilter,
		setAcledToFilter,
		setAcledPage,
	});

	const activeStoryFocusPreset = useMemo(
		() =>
			activeStoryFocusPresetId
				? (storyFocusPresets.find((preset) => preset.id === activeStoryFocusPresetId) ?? null)
				: null,
		[activeStoryFocusPresetId, storyFocusPresets],
	);

	const selectedEvents = useMemo(
		() =>
			selectedEventIds
				.map((eventId) => visibleEvents.find((event) => event.id === eventId) ?? null)
				.filter((event): event is NonNullable<typeof event> => event !== null),
		[selectedEventIds, visibleEvents],
	);

	const overlayEvents = mapBody === "earth" ? visibleEvents : [];
	const overlayCandidates = mapBody === "earth" ? visibleCandidates : [];
	const overlayTimeline = mapBody === "earth" ? visibleTimeline : [];
	const overlaySelectedEventId = mapBody === "earth" ? selectedEventId : null;
	const overlayNews = mapBody === "earth" ? visibleNews : [];
	const overlayGraph = mapBody === "earth" ? graph : null;
	const overlaySourceHealth = mapBody === "earth" ? sourceHealth : [];

	const statsSummary = useMemo(() => {
		if (mapBody !== "earth" || overlayEvents.length === 0) {
			return { totalEvents: 0, avgSeverityLabel: "n/a", maxSeverityLabel: "n/a" };
		}
		let sum = 0;
		let max = 0;
		for (const event of overlayEvents) {
			sum += Number(event.severity);
			max = Math.max(max, Number(event.severity));
		}
		return {
			totalEvents: overlayEvents.length,
			avgSeverityLabel: (sum / overlayEvents.length).toFixed(1),
			maxSeverityLabel: `S${max}`,
		};
	}, [mapBody, overlayEvents]);

	const overlayTimelineDomainMs = useMemo<[number, number] | null>(() => {
		const timestamps = overlayTimeline
			.map((entry) => Date.parse(entry.at))
			.filter((value) => Number.isFinite(value));
		if (timestamps.length === 0) return null;
		return [Math.min(...timestamps), Math.max(...timestamps)];
	}, [overlayTimeline]);

	useEffect(() => {
		if (!selectedEventId) return;
		const nextSelectedEvent = overlayEvents.find((event) => event.id === selectedEventId);
		if (!nextSelectedEvent) return;
		const nextFocus = buildGeoEventStoryFocusState({
			event: nextSelectedEvent,
			domainMs: overlayTimelineDomainMs,
			viewRangeMs: timelineViewRangeMs,
			activeRegionId,
		});
		if (!nextFocus) return;
		if (timelineSelectedTimeMs !== nextFocus.selectedTimeMs) {
			setTimelineSelectedTimeMs(nextFocus.selectedTimeMs);
		}
		if (!isSameRange(timelineViewRangeMs, nextFocus.viewRangeMs)) {
			setTimelineViewRangeMs(nextFocus.viewRangeMs);
		}
		if (nextFocus.regionIdToAdopt) {
			setActiveRegionId(nextFocus.regionIdToAdopt);
		}
	}, [
		activeRegionId,
		overlayEvents,
		overlayTimelineDomainMs,
		selectedEventId,
		setActiveRegionId,
		setTimelineSelectedTimeMs,
		setTimelineViewRangeMs,
		timelineSelectedTimeMs,
		timelineViewRangeMs,
	]);

	useEffect(() => {
		if (chatOpen && !prevChatOpenRef.current) {
			const selectedTitle = selectedEvent?.title;
			setChatContext(
				buildGeoContext(activeRegionId ?? "global", visibleEvents.length, selectedTitle),
			);
		}
		prevChatOpenRef.current = chatOpen;
	}, [chatOpen, activeRegionId, visibleEvents.length, selectedEvent, setChatContext]);

	return {
		filterSnapshot,
		visibleCandidates,
		visibleNews,
		visibleContextItems,
		visibleGameTheoryItems,
		visibleEvents,
		visibleTimeline,
		acledRegionSuggestions,
		acledSubEventSuggestions,
		activeFilterChips,
		selectedEvent,
		activeRegionLabel,
		activeStoryFocusPreset,
		selectedEvents,
		overlayEvents,
		overlayCandidates,
		overlayTimeline,
		overlaySelectedEventId,
		overlayNews,
		overlayGraph,
		overlaySourceHealth,
		statsSummary,
	};
}
