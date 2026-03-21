import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view/flat-view-handoff";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view/flat-view-state";
import { getGeoMapFlatLayerOptionsForFamilies } from "@/features/geopolitical/layer-taxonomy";
import type { GeoEvent } from "@/lib/geopolitical/types";

export function formatRange(range: [number, number] | null): string {
	if (!range) return "none";
	return `${new Date(range[0]).toISOString()} -> ${new Date(range[1]).toISOString()}`;
}

export function isEventInsideBounds(event: GeoEvent, bounds: GeoFlatViewBounds | null): boolean {
	if (!bounds) return true;
	return (event.coordinates ?? []).some(
		(point) =>
			point.lat >= bounds.south &&
			point.lat <= bounds.north &&
			point.lng >= bounds.west &&
			point.lng <= bounds.east,
	);
}

export function formatEventWindow(event: GeoEvent): string {
	const timestamp = event.validFrom ?? event.createdAt;
	if (!timestamp) return "time unknown";
	const parsed = new Date(timestamp);
	return Number.isNaN(parsed.getTime())
		? timestamp
		: parsed.toISOString().slice(0, 16).replace("T", " ");
}

export function formatBucketLabel(timestampMs: number): string {
	return new Date(timestampMs).toISOString().slice(11, 16);
}

export function buildActiveFlatFilterChips(state: GeoFlatViewState): string[] {
	const { filterSnapshot } = state;
	const chips = [
		filterSnapshot.eventsSource !== "local" ? `source:${filterSnapshot.eventsSource}` : null,
		filterSnapshot.activeRegionId ? `region:${filterSnapshot.activeRegionId}` : null,
		filterSnapshot.searchQuery.trim() ? `query:${filterSnapshot.searchQuery.trim()}` : null,
		filterSnapshot.minSeverityFilter > 1 ? `severity>=${filterSnapshot.minSeverityFilter}` : null,
		filterSnapshot.acledCountryFilter.trim()
			? `country:${filterSnapshot.acledCountryFilter.trim()}`
			: null,
		filterSnapshot.acledRegionFilter.trim()
			? `acled-region:${filterSnapshot.acledRegionFilter.trim()}`
			: null,
		filterSnapshot.acledEventTypeFilter.trim()
			? `event-type:${filterSnapshot.acledEventTypeFilter.trim()}`
			: null,
		filterSnapshot.acledSubEventTypeFilter.trim()
			? `subtype:${filterSnapshot.acledSubEventTypeFilter.trim()}`
			: null,
		filterSnapshot.acledFromFilter.trim() ? `from:${filterSnapshot.acledFromFilter.trim()}` : null,
		filterSnapshot.acledToFilter.trim() ? `to:${filterSnapshot.acledToFilter.trim()}` : null,
	];

	return chips.filter((value): value is string => Boolean(value));
}

export function buildDefaultFlatLayerOptionIds(layerFamilies: GeoFlatViewState["layerFamilies"]) {
	return getGeoMapFlatLayerOptionsForFamilies(layerFamilies).map((option) => option.id);
}
