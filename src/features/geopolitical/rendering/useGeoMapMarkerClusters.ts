import { useMemo } from "react";
import Supercluster from "supercluster";
import {
	buildGeoFlatViewBoundsFromCoordinates,
	type GeoFlatViewBounds,
} from "@/features/geopolitical/flat-view/flat-view-handoff";
import { getMarkerSymbolShortCode } from "@/features/geopolitical/markerSymbols";
import type { GeoMapMarkerPoint } from "@/features/geopolitical/rendering/useGeoMapProjectionModel";
import {
	GEO_MAP_INITIAL_SCALE,
	type GeoMapProjectionModel,
} from "@/features/geopolitical/rendering/useGeoMapProjectionModel";

interface ClusterPointProps {
	markerId: string;
}

interface ClusterFeatureProps {
	cluster: true;
	cluster_id: number;
	point_count: number;
	point_count_abbreviated: number | string;
}

export interface GeoMapMarkerCluster {
	id: string;
	lat: number;
	lng: number;
	x: number;
	y: number;
	count: number;
	maxSeverity: number;
	highPriorityCount: number;
	representativeShortCode: string;
	markerIds: string[];
	bounds: GeoFlatViewBounds | null;
}

interface UseGeoMapMarkerClustersParams {
	markers: GeoMapMarkerPoint[];
	scale: number;
	projection: GeoMapProjectionModel["projection"];
}

interface GeoMapMarkerClustersResult {
	clusters: GeoMapMarkerCluster[];
	unclusteredMarkerIds: Set<string>;
	clusteringActive: boolean;
}

const CLUSTER_BBOX: [number, number, number, number] = [-180, -85, 180, 85];

function getClusterZoomFromScale(scale: number): number {
	const zoom = Math.round(Math.log2(Math.max(scale, 1) / GEO_MAP_INITIAL_SCALE) + 3);
	return Math.max(0, Math.min(16, zoom));
}

export function useGeoMapMarkerClusters({
	markers,
	scale,
	projection,
}: UseGeoMapMarkerClustersParams): GeoMapMarkerClustersResult {
	return useMemo(() => {
		const visibleMarkers = markers.filter((marker) => marker.visible);
		const visibleMarkerById = new Map(visibleMarkers.map((marker) => [marker.id, marker] as const));
		const shouldCluster = visibleMarkers.length >= 24;
		if (!shouldCluster) {
			return {
				clusters: [],
				unclusteredMarkerIds: new Set(visibleMarkers.map((marker) => marker.id)),
				clusteringActive: false,
			};
		}

		const index = new Supercluster<ClusterPointProps, ClusterFeatureProps>({
			radius: 44,
			maxZoom: 16,
			minPoints: 2,
		});

		index.load(
			visibleMarkers.map((marker) => ({
				type: "Feature" as const,
				geometry: {
					type: "Point" as const,
					coordinates: [marker.lng, marker.lat] as [number, number],
				},
				properties: {
					markerId: marker.id,
				},
			})),
		);

		const zoom = getClusterZoomFromScale(scale);
		const features = index.getClusters(CLUSTER_BBOX, zoom);

		const clusters: GeoMapMarkerCluster[] = [];
		const unclusteredMarkerIds = new Set<string>();

		for (const feature of features) {
			const lng = feature.geometry.coordinates[0];
			const lat = feature.geometry.coordinates[1];
			if (typeof lng !== "number" || typeof lat !== "number") continue;
			const props = feature.properties;
			if (!props) continue;

			if ("cluster" in props && props.cluster) {
				const projected = projection([lng, lat]);
				if (!projected) continue;
				const projectedX = projected[0];
				const projectedY = projected[1];
				if (typeof projectedX !== "number" || typeof projectedY !== "number") continue;
				const leaves = index.getLeaves(props.cluster_id, props.point_count);
				const bounds = buildGeoFlatViewBoundsFromCoordinates(
					leaves
						.map((leaf) => {
							const leafLng = leaf.geometry.coordinates[0];
							const leafLat = leaf.geometry.coordinates[1];
							if (typeof leafLat !== "number" || typeof leafLng !== "number") {
								return null;
							}
							return {
								lat: leafLat,
								lng: leafLng,
							};
						})
						.filter(
							(coordinate): coordinate is { lat: number; lng: number } => coordinate !== null,
						),
				);
				const clusterMarkers = leaves
					.map((leaf) => {
						const markerId = leaf.properties?.markerId;
						return typeof markerId === "string" ? (visibleMarkerById.get(markerId) ?? null) : null;
					})
					.filter((marker): marker is GeoMapMarkerPoint => marker !== null);
				const representativeMarker = [...clusterMarkers].sort(
					(left, right) => right.severity - left.severity,
				)[0];
				const maxSeverity = clusterMarkers.reduce(
					(maximum, marker) => Math.max(maximum, marker.severity),
					0,
				);
				const highPriorityCount = clusterMarkers.filter((marker) => marker.severity >= 4).length;
				clusters.push({
					id: `cluster-${props.cluster_id}`,
					lat,
					lng,
					x: projectedX,
					y: projectedY,
					count: props.point_count,
					maxSeverity,
					highPriorityCount,
					representativeShortCode: representativeMarker
						? getMarkerSymbolShortCode(representativeMarker.symbol)
						: "EV",
					markerIds: leaves
						.map((leaf) => leaf.properties?.markerId)
						.filter((markerId): markerId is string => typeof markerId === "string"),
					bounds,
				});
				continue;
			}

			if ("markerId" in props && typeof props.markerId === "string") {
				unclusteredMarkerIds.add(props.markerId);
			}
		}

		return {
			clusters,
			unclusteredMarkerIds,
			clusteringActive: clusters.length > 0,
		};
	}, [markers, projection, scale]);
}
