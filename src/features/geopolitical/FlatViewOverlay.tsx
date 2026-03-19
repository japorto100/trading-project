"use client";

import type { PickingInfo } from "@deck.gl/core";
import { WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
	GeoFlatViewConflictAssetPoint,
	GeoFlatViewConflictHeatCell,
	GeoFlatViewConflictStrikePoint,
	GeoFlatViewConflictTargetPoint,
} from "@/features/geopolitical/flat-view-conflict-layers";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view-handoff";
import type { GeoFlatViewOverlayEventPoint } from "@/features/geopolitical/flat-view-overlay-payload";
import type { GeoFlatViewRendererContract } from "@/features/geopolitical/flat-view-renderer-contract";

interface FlatViewOverlaySize {
	width: number;
	height: number;
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

export function FlatViewOverlay({
	contract,
	onSelectEvent,
}: {
	contract: GeoFlatViewRendererContract;
	onSelectEvent: (eventId: string) => void;
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

	const initialViewState = useMemo(
		() => buildInitialViewState(contract.bounds, size),
		[contract.bounds, size],
	);
	const conflictLayerEnabled = contract.layerFamilies.includes("conflict");
	const activeLayerOptionIds = new Set(contract.activeFlatLayerOptionIds);
	const eventsLayerEnabled = activeLayerOptionIds.has("events");
	const strikesLayerEnabled = conflictLayerEnabled && activeLayerOptionIds.has("strikes");
	const targetsLayerEnabled = conflictLayerEnabled && activeLayerOptionIds.has("targets");
	const assetsLayerEnabled = conflictLayerEnabled && activeLayerOptionIds.has("assets");
	const zonesLayerEnabled = conflictLayerEnabled && activeLayerOptionIds.has("zones");
	const heatLayerEnabled = conflictLayerEnabled && activeLayerOptionIds.has("heat");
	const layers = useMemo(
		() => [
			new GeoJsonLayer({
				id: "flat-handoff-bounds-overlay",
				data: contract.boundsGeoJson,
				stroked: true,
				filled: true,
				getFillColor: [56, 189, 248, 28],
				getLineColor: [125, 211, 252, 230],
				getLineWidth: 3,
				lineWidthUnits: "pixels",
				pickable: false,
			}),
			new GeoJsonLayer({
				id: "flat-conflict-zones-overlay",
				data: zonesLayerEnabled
					? contract.conflictLayers.zones
					: { type: "FeatureCollection", features: [] },
				stroked: true,
				filled: true,
				getFillColor: [248, 113, 113, 32],
				getLineColor: [248, 113, 113, 200],
				getLineWidth: 2,
				lineWidthUnits: "pixels",
				pickable: false,
			}),
			new ScatterplotLayer<GeoFlatViewConflictHeatCell>({
				id: "flat-conflict-heat-overlay",
				data: heatLayerEnabled ? contract.conflictLayers.heat : [],
				pickable: false,
				stroked: false,
				filled: true,
				getPosition: (cell) => cell.coordinates,
				getRadius: (cell) => 14_000 + cell.intensity * 900,
				radiusUnits: "meters",
				getFillColor: (cell) => [220, 38, 38, Math.min(210, 70 + cell.intensity * 18)],
			}),
			new ScatterplotLayer<GeoFlatViewConflictAssetPoint>({
				id: "flat-conflict-assets-overlay",
				data: assetsLayerEnabled ? contract.conflictLayers.assets : [],
				pickable: true,
				stroked: true,
				filled: true,
				getPosition: (asset) => asset.coordinates,
				getRadius: (asset) => 4_000 + Math.round((asset.weight ?? 0.25) * 3_000),
				radiusUnits: "meters",
				getFillColor: [56, 189, 248, 210],
				getLineColor: [186, 230, 253, 220],
				lineWidthUnits: "pixels",
				getLineWidth: 1.5,
				onClick: (info: PickingInfo<GeoFlatViewConflictAssetPoint>) => {
					if (info.object) {
						onSelectEvent(info.object.eventId);
					}
				},
			}),
			new ScatterplotLayer<GeoFlatViewConflictTargetPoint>({
				id: "flat-conflict-targets-overlay",
				data: targetsLayerEnabled ? contract.conflictLayers.targets : [],
				pickable: true,
				stroked: true,
				filled: true,
				getPosition: (target) => target.coordinates,
				getRadius: 5_500,
				radiusUnits: "meters",
				getFillColor: [251, 191, 36, 210],
				getLineColor: [120, 53, 15, 220],
				lineWidthUnits: "pixels",
				getLineWidth: 1.5,
				onClick: (info: PickingInfo<GeoFlatViewConflictTargetPoint>) => {
					if (info.object) {
						onSelectEvent(info.object.eventId);
					}
				},
			}),
			new ScatterplotLayer<GeoFlatViewConflictStrikePoint>({
				id: "flat-conflict-strikes-overlay",
				data: strikesLayerEnabled ? contract.conflictLayers.strikes : [],
				pickable: true,
				autoHighlight: true,
				stroked: true,
				filled: true,
				getPosition: (strike) => strike.coordinates,
				getRadius: (strike) => (strike.selected ? 13_000 : 9_000),
				radiusUnits: "meters",
				getFillColor: (strike) => (strike.selected ? [250, 204, 21, 255] : [248, 113, 113, 220]),
				getLineColor: [69, 10, 10, 220],
				lineWidthUnits: "pixels",
				getLineWidth: 2,
				onClick: (info: PickingInfo<GeoFlatViewConflictStrikePoint>) => {
					if (info.object) {
						onSelectEvent(info.object.eventId);
					}
				},
			}),
			new ScatterplotLayer<GeoFlatViewOverlayEventPoint>({
				id: "flat-handoff-events-overlay",
				data: eventsLayerEnabled ? contract.eventPoints : [],
				pickable: true,
				autoHighlight: true,
				stroked: true,
				filled: true,
				getPosition: (point) => point.coordinates,
				getRadius: (point) => point.radiusMeters,
				radiusUnits: "meters",
				getFillColor: (point) => point.fillColor,
				getLineColor: [7, 11, 18, 220],
				lineWidthUnits: "pixels",
				getLineWidth: 2,
				onClick: (info: PickingInfo<GeoFlatViewOverlayEventPoint>) => {
					if (info.object) {
						onSelectEvent(info.object.id);
					}
				},
			}),
		],
		[
			contract.boundsGeoJson,
			contract.conflictLayers.assets,
			contract.conflictLayers.heat,
			contract.conflictLayers.strikes,
			contract.conflictLayers.targets,
			contract.conflictLayers.zones,
			contract.eventPoints,
			assetsLayerEnabled,
			eventsLayerEnabled,
			heatLayerEnabled,
			onSelectEvent,
			strikesLayerEnabled,
			targetsLayerEnabled,
			zonesLayerEnabled,
		],
	);

	return (
		<div ref={containerRef} className="absolute inset-0 z-10">
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
