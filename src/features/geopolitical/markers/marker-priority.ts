import type { GeoEvent } from "@/lib/geopolitical/types";

export type GeoMarkerPriorityTier = "critical" | "high" | "medium" | "low";

export interface GeoMarkerPriorityContract {
	priorityScore: number;
	priorityTier: GeoMarkerPriorityTier;
	labelVisible: boolean;
}

const FLAT_MARKER_DECLUTTER_LIMIT = 120;

function getGeoMarkerStatusPriority(status: GeoEvent["status"]): number {
	switch (status) {
		case "confirmed":
			return 36;
		case "persistent":
			return 28;
		case "candidate":
			return 18;
		case "archived":
			return 4;
	}
}

function getGeoMarkerRecencyPriority(updatedAt: string): number {
	const updatedMs = Date.parse(updatedAt);
	if (!Number.isFinite(updatedMs)) return 0;
	const ageHours = Math.max(0, (Date.now() - updatedMs) / 3_600_000);
	if (ageHours <= 24) return 18;
	if (ageHours <= 72) return 12;
	if (ageHours <= 7 * 24) return 6;
	return 0;
}

export function buildGeoMarkerPriorityContract(params: {
	event: GeoEvent;
	selected: boolean;
}): GeoMarkerPriorityContract {
	const { event, selected } = params;
	const priorityScore =
		(selected ? 10_000 : 0) +
		event.severity * 100 +
		event.confidence * 15 +
		getGeoMarkerStatusPriority(event.status) +
		getGeoMarkerRecencyPriority(event.updatedAt);

	const priorityTier: GeoMarkerPriorityTier =
		selected || event.severity >= 5
			? "critical"
			: event.severity >= 4
				? "high"
				: event.severity >= 3
					? "medium"
					: "low";

	return {
		priorityScore,
		priorityTier,
		labelVisible: selected || priorityTier === "critical" || priorityTier === "high",
	};
}

export function getGeoFlatMarkerDeclutterLimit(): number {
	return FLAT_MARKER_DECLUTTER_LIMIT;
}
