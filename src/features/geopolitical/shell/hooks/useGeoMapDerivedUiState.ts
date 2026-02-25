import { useMemo } from "react";
import type { EventsSource } from "@/features/geopolitical/store";
import type { GeoEvent, GeoRegion } from "@/lib/geopolitical/types";

type NumberUpdater = number | ((previous: number) => number);

interface UseGeoMapDerivedUiStateParams {
	events: GeoEvent[];
	regions: GeoRegion[];
	selectedEventId: string | null;
	eventsSource: EventsSource;
	activeRegionId: string;
	setActiveRegionId: (next: string) => void;
	searchQuery: string;
	setSearchQuery: (next: string) => void;
	acledCountryFilter: string;
	setAcledCountryFilter: (next: string) => void;
	acledRegionFilter: string;
	setAcledRegionFilter: (next: string) => void;
	acledEventTypeFilter: string;
	setAcledEventTypeFilter: (next: string) => void;
	acledSubEventTypeFilter: string;
	setAcledSubEventTypeFilter: (next: string) => void;
	acledFromFilter: string;
	setAcledFromFilter: (next: string) => void;
	acledToFilter: string;
	setAcledToFilter: (next: string) => void;
	setAcledPage: (next: NumberUpdater) => void;
}

export interface GeoMapFilterChip {
	key: string;
	label: string;
	clear: () => void;
}

export function useGeoMapDerivedUiState({
	events,
	regions,
	selectedEventId,
	eventsSource,
	activeRegionId,
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
}: UseGeoMapDerivedUiStateParams) {
	const acledRegionSuggestions = useMemo(() => {
		const values = events
			.map((event) => event.externalRegion?.trim())
			.filter((value): value is string => Boolean(value));
		return [...new Set(values)].slice(0, 12);
	}, [events]);

	const acledSubEventSuggestions = useMemo(() => {
		const values = events
			.map((event) => event.externalSubEventType?.trim())
			.filter((value): value is string => Boolean(value));
		return [...new Set(values)].slice(0, 12);
	}, [events]);

	const activeFilterChips = useMemo(() => {
		const chips: GeoMapFilterChip[] = [];
		if (eventsSource === "local") {
			if (activeRegionId) {
				chips.push({
					key: "local-region",
					label: `Region: ${activeRegionId}`,
					clear: () => setActiveRegionId(""),
				});
			}
			if (searchQuery.trim()) {
				chips.push({
					key: "local-q",
					label: `Search: ${searchQuery.trim()}`,
					clear: () => setSearchQuery(""),
				});
			}
			return chips;
		}

		if (acledCountryFilter.trim()) {
			chips.push({
				key: "acled-country",
				label: `Country: ${acledCountryFilter.trim()}`,
				clear: () => {
					setAcledCountryFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledRegionFilter.trim()) {
			chips.push({
				key: "acled-region",
				label: `Region: ${acledRegionFilter.trim()}`,
				clear: () => {
					setAcledRegionFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledEventTypeFilter.trim()) {
			chips.push({
				key: "acled-event-type",
				label: `Type: ${acledEventTypeFilter.trim()}`,
				clear: () => {
					setAcledEventTypeFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledSubEventTypeFilter.trim()) {
			chips.push({
				key: "acled-sub-event-type",
				label: `Sub-Event: ${acledSubEventTypeFilter.trim()}`,
				clear: () => {
					setAcledSubEventTypeFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledFromFilter.trim()) {
			chips.push({
				key: "acled-from",
				label: `From: ${acledFromFilter.trim()}`,
				clear: () => {
					setAcledFromFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledToFilter.trim()) {
			chips.push({
				key: "acled-to",
				label: `To: ${acledToFilter.trim()}`,
				clear: () => {
					setAcledToFilter("");
					setAcledPage(1);
				},
			});
		}
		if (searchQuery.trim()) {
			chips.push({
				key: "acled-q",
				label: `Search: ${searchQuery.trim()}`,
				clear: () => setSearchQuery(""),
			});
		}
		return chips;
	}, [
		activeRegionId,
		acledCountryFilter,
		acledEventTypeFilter,
		acledFromFilter,
		acledRegionFilter,
		acledSubEventTypeFilter,
		acledToFilter,
		eventsSource,
		searchQuery,
		setAcledCountryFilter,
		setAcledEventTypeFilter,
		setAcledFromFilter,
		setAcledPage,
		setAcledRegionFilter,
		setAcledSubEventTypeFilter,
		setAcledToFilter,
		setActiveRegionId,
		setSearchQuery,
	]);

	const selectedEvent = useMemo(
		() => events.find((entry) => entry.id === selectedEventId) ?? null,
		[events, selectedEventId],
	);

	const isExternalSource = eventsSource !== "local";
	const activeRegionLabel = useMemo(() => {
		if (isExternalSource) {
			return acledRegionFilter.trim() || "All regions";
		}
		if (!activeRegionId) return "All regions";
		return regions.find((region) => region.id === activeRegionId)?.label ?? activeRegionId;
	}, [acledRegionFilter, activeRegionId, isExternalSource, regions]);

	return {
		acledRegionSuggestions,
		acledSubEventSuggestions,
		activeFilterChips,
		selectedEvent,
		activeRegionLabel,
	};
}
