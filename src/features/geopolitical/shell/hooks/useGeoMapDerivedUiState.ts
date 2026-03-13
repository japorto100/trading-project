import { useMemo } from "react";
import {
	buildGeoFilterChips,
	type GeoFilterStateSnapshot,
} from "@/features/geopolitical/geo-filter-contract";
import type { EventsSource } from "@/features/geopolitical/store";
import type { GeoEvent, GeoRegion } from "@/lib/geopolitical/types";

type NumberUpdater = number | ((previous: number) => number);

interface UseGeoMapDerivedUiStateParams {
	events: GeoEvent[];
	regions: GeoRegion[];
	selectedEventId: string | null;
	eventsSource: EventsSource;
	activeRegionId: string;
	minSeverityFilter: number;
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
		const snapshot: GeoFilterStateSnapshot = {
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
		};
		return buildGeoFilterChips(snapshot).map((chip): GeoMapFilterChip => {
			switch (chip.key) {
				case "local-region":
					return { ...chip, clear: () => setActiveRegionId("") };
				case "local-q":
				case "acled-q":
					return { ...chip, clear: () => setSearchQuery("") };
				case "acled-country":
					return {
						...chip,
						clear: () => {
							setAcledCountryFilter("");
							setAcledPage(1);
						},
					};
				case "acled-region":
					return {
						...chip,
						clear: () => {
							setAcledRegionFilter("");
							setAcledPage(1);
						},
					};
				case "acled-event-type":
					return {
						...chip,
						clear: () => {
							setAcledEventTypeFilter("");
							setAcledPage(1);
						},
					};
				case "acled-sub-event-type":
					return {
						...chip,
						clear: () => {
							setAcledSubEventTypeFilter("");
							setAcledPage(1);
						},
					};
				case "acled-from":
					return {
						...chip,
						clear: () => {
							setAcledFromFilter("");
							setAcledPage(1);
						},
					};
				case "acled-to":
					return {
						...chip,
						clear: () => {
							setAcledToFilter("");
							setAcledPage(1);
						},
					};
				default:
					return { ...chip, clear: () => undefined };
			}
		});
	}, [
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
