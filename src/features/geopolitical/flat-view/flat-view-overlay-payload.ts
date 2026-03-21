import type { FeatureCollection, Polygon } from "geojson";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view/flat-view-handoff";
import { getMarkerSymbolShortCode } from "@/features/geopolitical/markerSymbols";
import {
	buildGeoMarkerPriorityContract,
	type GeoMarkerPriorityTier,
	getGeoFlatMarkerDeclutterLimit,
} from "@/features/geopolitical/markers/marker-priority";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface GeoFlatViewOverlayEventPoint {
	id: string;
	title: string;
	labelText: string;
	severity: GeoEvent["severity"];
	coordinates: [number, number];
	selected: boolean;
	timelineFocused: boolean;
	radiusMeters: number;
	haloRadiusMeters: number;
	fillColor: [number, number, number, number];
	haloColor: [number, number, number, number];
	symbolShortCode: string;
	priorityScore: number;
	priorityTier: GeoMarkerPriorityTier;
	declutterVisible: boolean;
	labelVisible: boolean;
	badgeVisible: boolean;
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

function buildGeoFlatViewEventLabelText(title: string): string {
	const trimmed = title.trim();
	if (trimmed.length <= 24) return trimmed;
	return `${trimmed.slice(0, 21).trimEnd()}...`;
}

export function buildGeoFlatViewOverlayEventPoints(params: {
	events: GeoEvent[];
	bounds: GeoFlatViewBounds | null;
	selectedEventId: string | null;
	selectedTimelineEventIds?: ReadonlySet<string>;
}): GeoFlatViewOverlayEventPoint[] {
	const points: GeoFlatViewOverlayEventPoint[] = [];

	for (const event of params.events) {
		const coordinate = event.coordinates?.[0];
		if (!coordinate) continue;
		const point = [coordinate.lng, coordinate.lat] as [number, number];
		if (!isPointInsideBounds(point, params.bounds)) continue;
		const selected = event.id === params.selectedEventId;
		const timelineFocused = params.selectedTimelineEventIds?.has(event.id) ?? false;
		const priority = buildGeoMarkerPriorityContract({ event, selected });
		points.push({
			id: event.id,
			title: event.title,
			labelText: buildGeoFlatViewEventLabelText(event.title),
			severity: event.severity,
			coordinates: point,
			selected,
			timelineFocused,
			radiusMeters:
				selected || timelineFocused || priority.priorityTier === "critical"
					? 12_000
					: priority.priorityTier === "high"
						? 9_500
						: priority.priorityTier === "medium"
							? 8_500
							: 7_500,
			haloRadiusMeters:
				selected || timelineFocused || priority.priorityTier === "critical"
					? 22_000
					: priority.priorityTier === "high"
						? 16_000
						: priority.priorityTier === "medium"
							? 12_000
							: 9_500,
			fillColor: getGeoFlatViewEventColor(event.severity, selected),
			haloColor: selected
				? [250, 204, 21, 84]
				: timelineFocused
					? [125, 211, 252, 72]
					: priority.priorityTier === "critical"
						? [248, 113, 113, 70]
						: priority.priorityTier === "high"
							? [251, 146, 60, 62]
							: priority.priorityTier === "medium"
								? [250, 204, 21, 54]
								: [56, 189, 248, 38],
			symbolShortCode: getMarkerSymbolShortCode(event.symbol),
			priorityScore: priority.priorityScore,
			priorityTier: priority.priorityTier,
			declutterVisible: false,
			labelVisible: timelineFocused || priority.labelVisible,
			badgeVisible: selected || timelineFocused || priority.priorityTier !== "low",
		});
	}

	const sortedPoints = [...points].sort((left, right) => right.priorityScore - left.priorityScore);
	const declutterLimit = getGeoFlatMarkerDeclutterLimit();

	return sortedPoints.map((point, index) => ({
		...point,
		declutterVisible: point.selected || point.timelineFocused || index < declutterLimit,
	}));
}
