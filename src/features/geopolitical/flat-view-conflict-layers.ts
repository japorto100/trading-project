import type { FeatureCollection, Polygon } from "geojson";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view-handoff";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface GeoFlatViewConflictStrikePoint {
	id: string;
	eventId: string;
	title: string;
	severity: GeoEvent["severity"];
	coordinates: [number, number];
	selected: boolean;
}

export interface GeoFlatViewConflictTargetPoint {
	id: string;
	eventId: string;
	title: string;
	severity: GeoEvent["severity"];
	coordinates: [number, number];
	index: number;
}

export interface GeoFlatViewConflictAssetPoint {
	id: string;
	eventId: string;
	symbol: string;
	assetClass: string;
	relation: string;
	coordinates: [number, number];
	weight: number | null;
}

export interface GeoFlatViewConflictHeatCell {
	id: string;
	coordinates: [number, number];
	eventIds: string[];
	intensity: number;
	maxSeverity: number;
}

export interface GeoFlatViewConflictZoneProperties {
	id: string;
	eventId: string;
	title: string;
	severity: GeoEvent["severity"];
	pointCount: number;
}

export type GeoFlatViewConflictZoneFeature = FeatureCollection<Polygon>["features"][number] & {
	properties: GeoFlatViewConflictZoneProperties;
};

export interface GeoFlatViewConflictLayers {
	strikes: GeoFlatViewConflictStrikePoint[];
	targets: GeoFlatViewConflictTargetPoint[];
	assets: GeoFlatViewConflictAssetPoint[];
	zones: FeatureCollection<Polygon, GeoFlatViewConflictZoneProperties>;
	heat: GeoFlatViewConflictHeatCell[];
}

function isPointInsideBounds(point: [number, number], bounds: GeoFlatViewBounds | null): boolean {
	if (!bounds) return true;
	const [lng, lat] = point;
	return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

function clampZonePadding(value: number): number {
	return Math.min(Math.max(value, 0.35), 2.5);
}

function buildConflictZoneForEvent(event: GeoEvent, bounds: GeoFlatViewBounds | null) {
	const points =
		event.coordinates
			?.map((coordinate) => [coordinate.lng, coordinate.lat] as [number, number])
			.filter((point) => isPointInsideBounds(point, bounds)) ?? [];
	if (points.length < 2) return null;

	let west = Number.POSITIVE_INFINITY;
	let east = Number.NEGATIVE_INFINITY;
	let south = Number.POSITIVE_INFINITY;
	let north = Number.NEGATIVE_INFINITY;
	for (const [lng, lat] of points) {
		west = Math.min(west, lng);
		east = Math.max(east, lng);
		south = Math.min(south, lat);
		north = Math.max(north, lat);
	}

	const padding = clampZonePadding(0.25 + Number(event.severity) * 0.15);
	return {
		type: "Feature" as const,
		properties: {
			id: `zone-${event.id}`,
			eventId: event.id,
			title: event.title,
			severity: event.severity,
			pointCount: points.length,
		},
		geometry: {
			type: "Polygon" as const,
			coordinates: [
				[
					[west - padding, south - padding],
					[east + padding, south - padding],
					[east + padding, north + padding],
					[west - padding, north + padding],
					[west - padding, south - padding],
				],
			],
		},
	};
}

export function buildGeoFlatViewConflictLayers(params: {
	events: GeoEvent[];
	bounds: GeoFlatViewBounds | null;
	selectedEventId: string | null;
}): GeoFlatViewConflictLayers {
	const strikes: GeoFlatViewConflictStrikePoint[] = [];
	const targets: GeoFlatViewConflictTargetPoint[] = [];
	const assets: GeoFlatViewConflictAssetPoint[] = [];
	const zones: GeoFlatViewConflictZoneFeature[] = [];
	const heatCells = new Map<string, GeoFlatViewConflictHeatCell>();

	for (const event of params.events) {
		const coordinate = event.coordinates?.[0];
		if (!coordinate) continue;
		const point = [coordinate.lng, coordinate.lat] as [number, number];
		if (!isPointInsideBounds(point, params.bounds)) continue;

		if (Number(event.severity) >= 4) {
			strikes.push({
				id: `strike-${event.id}`,
				eventId: event.id,
				title: event.title,
				severity: event.severity,
				coordinates: point,
				selected: event.id === params.selectedEventId,
			});
		}

		for (const [index, coordinatePoint] of (event.coordinates ?? []).slice(1).entries()) {
			const targetPoint = [coordinatePoint.lng, coordinatePoint.lat] as [number, number];
			if (!isPointInsideBounds(targetPoint, params.bounds)) continue;
			targets.push({
				id: `target-${event.id}-${index + 1}`,
				eventId: event.id,
				title: event.title,
				severity: event.severity,
				coordinates: targetPoint,
				index: index + 1,
			});
		}

		for (const asset of event.assets) {
			assets.push({
				id: `${event.id}:${asset.id}`,
				eventId: event.id,
				symbol: asset.symbol,
				assetClass: asset.assetClass,
				relation: asset.relation,
				coordinates: point,
				weight: asset.weight ?? null,
			});
		}

		const zone = buildConflictZoneForEvent(event, params.bounds);
		if (zone) {
			zones.push(zone);
		}

		const heatKey = `${Math.round(coordinate.lat)}:${Math.round(coordinate.lng)}`;
		const existingHeatCell = heatCells.get(heatKey);
		if (existingHeatCell) {
			existingHeatCell.eventIds.push(event.id);
			existingHeatCell.intensity += Number(event.severity);
			existingHeatCell.maxSeverity = Math.max(existingHeatCell.maxSeverity, Number(event.severity));
			continue;
		}
		heatCells.set(heatKey, {
			id: `heat-${heatKey}`,
			coordinates: point,
			eventIds: [event.id],
			intensity: Number(event.severity),
			maxSeverity: Number(event.severity),
		});
	}

	return {
		strikes,
		targets,
		assets,
		zones: {
			type: "FeatureCollection",
			features: zones,
		},
		heat: [...heatCells.values()].sort((left, right) => right.intensity - left.intensity),
	};
}
