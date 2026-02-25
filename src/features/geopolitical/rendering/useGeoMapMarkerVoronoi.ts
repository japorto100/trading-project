import { geoDelaunay } from "d3-geo-voronoi";
import { useCallback, useMemo } from "react";
import type {
	GeoMapMarkerPoint,
	GeoMapProjectionModel,
} from "@/features/geopolitical/rendering/useGeoMapProjectionModel";

interface UseGeoMapMarkerVoronoiParams {
	markers: GeoMapMarkerPoint[];
	projection: GeoMapProjectionModel["projection"];
}

interface MarkerVoronoiSite {
	id: string;
	lng: number;
	lat: number;
	x: number;
	y: number;
}

export function useGeoMapMarkerVoronoi({ markers, projection }: UseGeoMapMarkerVoronoiParams) {
	const index = useMemo(() => {
		const visibleSites: MarkerVoronoiSite[] = [];
		for (const marker of markers) {
			if (!marker.visible) continue;
			const firstCoordinate = marker.raw.coordinates?.[0];
			if (!firstCoordinate) continue;
			if (!Number.isFinite(firstCoordinate.lng) || !Number.isFinite(firstCoordinate.lat)) continue;
			visibleSites.push({
				id: marker.id,
				lng: firstCoordinate.lng,
				lat: firstCoordinate.lat,
				x: marker.x,
				y: marker.y,
			});
		}

		if (visibleSites.length === 0) {
			return null;
		}

		return {
			sites: visibleSites,
			delaunay: geoDelaunay(visibleSites.map((site) => [site.lng, site.lat])),
		};
	}, [markers]);

	const findNearestMarkerIdAtScreenPoint = useCallback(
		(x: number, y: number, maxDistancePx = 14) => {
			if (!index) return null;
			const inverted = projection.invert?.([x, y]);
			if (!inverted) return null;

			const [lng, lat] = inverted;
			if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

			const nearestIndex = index.delaunay.find(lng, lat);
			if (!Number.isFinite(nearestIndex) || nearestIndex < 0) return null;

			const site = index.sites[nearestIndex];
			if (!site) return null;

			const dx = site.x - x;
			const dy = site.y - y;
			if (Math.hypot(dx, dy) > maxDistancePx) return null;

			return site.id;
		},
		[index, projection],
	);

	return {
		findNearestMarkerIdAtScreenPoint,
		hasVoronoiIndex: index !== null,
	};
}
