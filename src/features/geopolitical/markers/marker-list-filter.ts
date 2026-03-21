import type { GeoEvent, GeoEventStatus, GeoSeverity } from "@/lib/geopolitical/types";

export interface GeoMarkerListFilterState {
	searchValue: string;
	countryValue: string;
	regionValue: string;
	symbolValue: string;
	minSeverityValue: GeoSeverity | 0;
	statusValue: GeoEventStatus | "all";
}

export const GEO_MARKER_SEVERITY_VALUES = [1, 2, 3, 4, 5] as const satisfies readonly GeoSeverity[];

export const GEO_MARKER_STATUS_VALUES: readonly GeoEventStatus[] = [
	"candidate",
	"confirmed",
	"persistent",
	"archived",
];

export const DEFAULT_GEO_MARKER_LIST_FILTER_STATE: GeoMarkerListFilterState = {
	searchValue: "",
	countryValue: "",
	regionValue: "",
	symbolValue: "",
	minSeverityValue: 0,
	statusValue: "all",
};

export function filterGeoMarkerEvents(
	events: GeoEvent[],
	filterState: GeoMarkerListFilterState,
): GeoEvent[] {
	const query = filterState.searchValue.trim().toLowerCase();
	const country = filterState.countryValue.trim().toLowerCase();
	const region = filterState.regionValue.trim().toLowerCase();
	const symbol = filterState.symbolValue.trim().toLowerCase();

	return events.filter((event) => {
		if (filterState.minSeverityValue > 0 && event.severity < filterState.minSeverityValue) {
			return false;
		}
		if (filterState.statusValue !== "all" && event.status !== filterState.statusValue) {
			return false;
		}
		if (country.length > 0) {
			const hasCountry = event.countryCodes.some((entry) => entry.toLowerCase().includes(country));
			if (!hasCountry) return false;
		}
		if (region.length > 0) {
			const hasRegion = event.regionIds.some((entry) => entry.toLowerCase().includes(region));
			if (!hasRegion) return false;
		}
		if (symbol.length > 0 && !event.symbol.toLowerCase().includes(symbol)) {
			return false;
		}
		if (query.length === 0) {
			return true;
		}

		const haystack = [
			event.title,
			event.summary ?? "",
			event.analystNote ?? "",
			event.category,
			event.subcategory ?? "",
			event.externalRegion ?? "",
			event.externalEventType ?? "",
			event.externalSubEventType ?? "",
			event.countryCodes.join(" "),
			event.regionIds.join(" "),
		]
			.join(" ")
			.toLowerCase();

		return haystack.includes(query);
	});
}
