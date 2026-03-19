import type { FeatureCollection, Polygon } from "geojson";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view-handoff";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface GeoFlatViewOverlayEventPoint {
	id: string;
	title: string;
	severity: GeoEvent["severity"];
	coordinates: [number, number];
	selected: boolean;
	radiusMeters: number;
	fillColor: [number, number, number, number];
}

function isPointInsideBounds(point: [number, number], bounds: GeoFlatViewBounds | null): boolean {
	if (!bounds) return true;
	const [lng, lat] = point;
	return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

export function buildGeoFlatViewOverlayBoundsCollection(
	bounds: GeoFlatViewBounds | null,
): FeatureCollection<Polygon> {
	if (!bounds) {
		return {
			type: "FeatureCollection",
			features: [],
		};
	}

	return {
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Polygon",
					coordinates: [
						[
							[bounds.west, bounds.south],
							[bounds.east, bounds.south],
							[bounds.east, bounds.north],
							[bounds.west, bounds.north],
							[bounds.west, bounds.south],
						],
					],
				},
			},
		],
	};
}

export function getGeoFlatViewEventColor(
	severity: number,
	selected: boolean,
): [number, number, number, number] {
	if (selected) return [250, 204, 21, 255];
	if (severity >= 5) return [248, 113, 113, 220];
	if (severity === 4) return [251, 146, 60, 220];
	if (severity === 3) return [250, 204, 21, 210];
	return [56, 189, 248, 210];
}

export function buildGeoFlatViewOverlayEventPoints(params: {
	events: GeoEvent[];
	bounds: GeoFlatViewBounds | null;
	selectedEventId: string | null;
}): GeoFlatViewOverlayEventPoint[] {
	const points: GeoFlatViewOverlayEventPoint[] = [];

	for (const event of params.events) {
		const coordinate = event.coordinates?.[0];
		if (!coordinate) continue;
		const point = [coordinate.lng, coordinate.lat] as [number, number];
		if (!isPointInsideBounds(point, params.bounds)) continue;
		const selected = event.id === params.selectedEventId;
		points.push({
			id: event.id,
			title: event.title,
			severity: event.severity,
			coordinates: point,
			selected,
			radiusMeters: selected ? 12_000 : 8_000,
			fillColor: getGeoFlatViewEventColor(event.severity, selected),
		});
	}

	return points;
}
