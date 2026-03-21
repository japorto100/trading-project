import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view/flat-view-handoff";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface GeoFlatViewEventPoint {
	id: string;
	title: string;
	severity: GeoEvent["severity"];
	coordinates: [number, number];
}

function isPointInsideBounds(point: [number, number], bounds: GeoFlatViewBounds | null): boolean {
	if (!bounds) return true;
	const [lng, lat] = point;
	return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

export function buildGeoFlatViewEventPoints(params: {
	events: GeoEvent[];
	bounds: GeoFlatViewBounds | null;
}): GeoFlatViewEventPoint[] {
	const points: GeoFlatViewEventPoint[] = [];

	for (const event of params.events) {
		const coordinate = event.coordinates?.[0];
		if (!coordinate) continue;
		const point = [coordinate.lng, coordinate.lat] as [number, number];
		if (!isPointInsideBounds(point, params.bounds)) continue;
		points.push({
			id: event.id,
			title: event.title,
			severity: event.severity,
			coordinates: point,
		});
	}

	return points;
}
