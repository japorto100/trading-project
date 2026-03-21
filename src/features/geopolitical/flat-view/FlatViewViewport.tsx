"use client";

import type { Feature, FeatureCollection, Polygon } from "geojson";
import type {
	GeoJSONSource,
	LngLatBoundsLike,
	Map as MapLibreMap,
	StyleSpecification,
} from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view/flat-view-handoff";
import type { GeoFlatViewRendererContract } from "@/features/geopolitical/flat-view/flat-view-renderer-contract";

const FLAT_VIEW_STYLE: StyleSpecification = {
	version: 8,
	sources: {},
	layers: [
		{
			id: "background",
			type: "background",
			paint: {
				"background-color": "#08111f",
			},
		},
	],
};

function toBoundsLike(bounds: GeoFlatViewBounds): LngLatBoundsLike {
	return [
		[bounds.west, bounds.south],
		[bounds.east, bounds.north],
	];
}

function buildBoundsFeature(bounds: GeoFlatViewBounds): Feature<Polygon> {
	return {
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
	};
}

function buildBoundsCollection(bounds: GeoFlatViewBounds | null): FeatureCollection<Polygon> {
	return {
		type: "FeatureCollection",
		features: bounds ? [buildBoundsFeature(bounds)] : [],
	};
}

export function FlatViewViewport({ contract }: { contract: GeoFlatViewRendererContract }) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const boundsGeoJson = useMemo(() => buildBoundsCollection(contract.bounds), [contract.bounds]);

	useEffect(() => {
		if (!containerRef.current || mapRef.current) return;

		let disposed = false;

		void import("maplibre-gl").then((maplibregl) => {
			if (!containerRef.current || disposed) return;

			const map = new maplibregl.Map({
				container: containerRef.current,
				style: FLAT_VIEW_STYLE,
				attributionControl: false,
				dragRotate: false,
				pitchWithRotate: false,
				renderWorldCopies: false,
				center: [18, 24],
				zoom: 1.6,
			});

			mapRef.current = map;

			map.on("load", () => {
				if (!map.getSource("handoff-bounds")) {
					map.addSource("handoff-bounds", {
						type: "geojson",
						data: boundsGeoJson,
					});
				}

				map.addLayer({
					id: "handoff-bounds-fill",
					type: "fill",
					source: "handoff-bounds",
					paint: {
						"fill-color": "#38bdf8",
						"fill-opacity": 0.12,
					},
				});

				map.addLayer({
					id: "handoff-bounds-line",
					type: "line",
					source: "handoff-bounds",
					paint: {
						"line-color": "#7dd3fc",
						"line-width": 2,
						"line-opacity": 0.95,
					},
				});

				if (contract.bounds) {
					map.fitBounds(toBoundsLike(contract.bounds), {
						padding: 48,
						duration: 0,
					});
				}
			});
		});

		return () => {
			disposed = true;
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, [boundsGeoJson, contract.bounds]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		const source = map.getSource("handoff-bounds") as GeoJSONSource | undefined;
		source?.setData(boundsGeoJson);

		if (contract.bounds) {
			map.fitBounds(toBoundsLike(contract.bounds), {
				padding: 48,
				duration: 700,
			});
		}
	}, [boundsGeoJson, contract.bounds]);

	return (
		<div className="relative h-full min-h-[18rem] w-full overflow-hidden rounded-lg border border-border/60 bg-[#08111f]">
			<div ref={containerRef} className="h-full w-full" data-testid="geomap-flat-view-viewport" />
			<div className="pointer-events-none absolute left-3 top-3 rounded-md border border-border/60 bg-card/80 px-3 py-2 text-[11px] text-muted-foreground backdrop-blur">
				<div>renderer: {contract.renderer}</div>
				<div>richness: {contract.basemapPolicy.richness}</div>
				<div>focus: {contract.focus?.kind ?? "bounds"}</div>
			</div>
		</div>
	);
}
