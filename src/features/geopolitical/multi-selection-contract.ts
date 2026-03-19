export interface GeoMultiSelectionState {
	eventIds: string[];
}

export type GeoMultiSelectionMode = "replace" | "append" | "toggle" | "clear";

export function buildGeoMultiSelectionState(params: {
	currentEventIds: string[];
	nextEventIds?: string[];
	mode: GeoMultiSelectionMode;
}): GeoMultiSelectionState {
	const current = new Set(params.currentEventIds);
	const next = new Set(params.nextEventIds ?? []);

	if (params.mode === "clear") {
		return { eventIds: [] };
	}

	if (params.mode === "replace") {
		return { eventIds: [...next] };
	}

	if (params.mode === "append") {
		for (const eventId of next) {
			current.add(eventId);
		}
		return { eventIds: [...current] };
	}

	for (const eventId of next) {
		if (current.has(eventId)) {
			current.delete(eventId);
		} else {
			current.add(eventId);
		}
	}
	return { eventIds: [...current] };
}
