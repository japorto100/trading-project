import { useMemo } from "react";
import Supercluster from "supercluster";
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
			const [lng, lat] = feature.geometry.coordinates;
			const props = feature.properties;
			if (!props) continue;

			if ("cluster" in props && props.cluster) {
				const projected = projection([lng, lat]);
				if (!projected) continue;
				clusters.push({
					id: `cluster-${props.cluster_id}`,
					lat,
					lng,
					x: projected[0],
					y: projected[1],
					count: props.point_count,
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
