"use client";

import { WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import type { FeatureCollection, Polygon } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildGeoFlatViewEventPoints } from "@/features/geopolitical/flat-view-events";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view-handoff";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view-state";
import type { GeoEvent } from "@/lib/geopolitical/types";

interface FlatViewOverlaySize {
	width: number;
	height: number;
}

function buildBoundsCollection(bounds: GeoFlatViewBounds | null): FeatureCollection<Polygon> {
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

function buildInitialViewState(bounds: GeoFlatViewBounds | null, size: FlatViewOverlaySize) {
	if (!bounds) {
		return {
			longitude: 18,
			latitude: 24,
			zoom: 1.6,
			bearing: 0,
			pitch: 0,
		};
	}

	const viewport = new WebMercatorViewport({
		width: Math.max(size.width, 1),
		height: Math.max(size.height, 1),
		longitude: 18,
		latitude: 24,
		zoom: 1.6,
	});
	const fittedViewport = viewport.fitBounds(
		[
			[bounds.west, bounds.south],
			[bounds.east, bounds.north],
		],
		{ padding: 48 },
	);

	return {
		longitude: fittedViewport.longitude,
		latitude: fittedViewport.latitude,
		zoom: fittedViewport.zoom,
		bearing: 0,
		pitch: 0,
	};
}

function getEventColor(severity: number, selected: boolean): [number, number, number, number] {
	if (selected) return [250, 204, 21, 255];
	if (severity >= 5) return [248, 113, 113, 220];
	if (severity === 4) return [251, 146, 60, 220];
	if (severity === 3) return [250, 204, 21, 210];
	return [56, 189, 248, 210];
}

export function FlatViewOverlay({
	state,
	events,
	selectedEventId,
}: {
	state: GeoFlatViewState;
	events: GeoEvent[];
	selectedEventId: string | null;
}) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState<FlatViewOverlaySize>({ width: 0, height: 0 });

	useEffect(() => {
		const node = containerRef.current;
		if (!node) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			setSize({
				width: entry.contentRect.width,
				height: entry.contentRect.height,
			});
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const boundsGeoJson = useMemo(() => buildBoundsCollection(state.bounds), [state.bounds]);
	const eventPoints = useMemo(
		() => buildGeoFlatViewEventPoints({ events, bounds: state.bounds }),
		[events, state.bounds],
	);
	const initialViewState = useMemo(
		() => buildInitialViewState(state.bounds, size),
		[state.bounds, size],
	);
	const layers = useMemo(
		() => [
			new GeoJsonLayer({
				id: "flat-handoff-bounds-overlay",
				data: boundsGeoJson,
				stroked: true,
				filled: true,
				getFillColor: [56, 189, 248, 28],
				getLineColor: [125, 211, 252, 230],
				getLineWidth: 3,
				lineWidthUnits: "pixels",
				pickable: false,
			}),
			new ScatterplotLayer({
				id: "flat-handoff-events-overlay",
				data: eventPoints,
				pickable: false,
				stroked: true,
				filled: true,
				getPosition: (point) => point.coordinates,
				getRadius: (point) => (point.id === selectedEventId ? 12_000 : 8_000),
				radiusUnits: "meters",
				getFillColor: (point) => getEventColor(point.severity, point.id === selectedEventId),
				getLineColor: [7, 11, 18, 220],
				lineWidthUnits: "pixels",
				getLineWidth: 2,
			}),
		],
		[boundsGeoJson, eventPoints, selectedEventId],
	);

	return (
		<div ref={containerRef} className="pointer-events-none absolute inset-0 z-10">
			{size.width > 0 && size.height > 0 ? (
				<DeckGL
					controller={false}
					initialViewState={initialViewState}
					viewState={initialViewState}
					layers={layers}
				/>
			) : null}
		</div>
	);
}
