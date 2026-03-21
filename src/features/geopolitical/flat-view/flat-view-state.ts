import {
	type GeoMapBasemapRichnessPolicy,
	getGeoMapBasemapRichnessPolicy,
} from "@/features/geopolitical/basemap-richness";
import type {
	GeoFlatViewBounds,
	GeoFlatViewFocus,
	GeoFlatViewHandoff,
	GeoFlatViewHandoffReason,
} from "@/features/geopolitical/flat-view/flat-view-handoff";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import {
	type GeoMapLayerFamily,
	type GeoMapLayerHint,
	type GeoMapViewMode,
	getGeoMapDefaultLayerFamiliesForView,
} from "@/features/geopolitical/layer-taxonomy";
import type { GeoReplayRangeMs } from "@/features/geopolitical/replay-window";
import type { GeoMapBody } from "@/features/geopolitical/store";

export type GeoMapRendererKind = "d3-geo" | "deckgl-maplibre";

export interface GeoFlatViewTemporalState {
	viewRangeMs: GeoReplayRangeMs | null;
	filterRangeMs: GeoReplayRangeMs | null;
	selectedTimeMs: number | null;
}

export interface GeoFlatViewState {
	viewMode: Extract<GeoMapViewMode, "flat">;
	renderer: Extract<GeoMapRendererKind, "deckgl-maplibre">;
	mapBody: GeoMapBody;
	reason: GeoFlatViewHandoffReason;
	bounds: GeoFlatViewBounds | null;
	focus: GeoFlatViewFocus | null;
	filterSnapshot: GeoFilterStateSnapshot;
	layerFamilies: GeoMapLayerFamily[];
	layerHints: GeoMapLayerHint[];
	temporal: GeoFlatViewTemporalState;
	basemapPolicy: GeoMapBasemapRichnessPolicy;
	pmtilesPreferred: boolean;
}

function isGeoMapLayerFamily(value: GeoMapLayerHint): value is GeoMapLayerFamily {
	return value !== "story";
}

export function buildGeoFlatViewStateFromHandoff(handoff: GeoFlatViewHandoff): GeoFlatViewState {
	const hintedLayerFamilies = handoff.layerHints.filter(isGeoMapLayerFamily);
	const layerFamilies =
		hintedLayerFamilies.length > 0
			? Array.from(new Set(hintedLayerFamilies))
			: getGeoMapDefaultLayerFamiliesForView("flat");
	const basemapPolicy = getGeoMapBasemapRichnessPolicy({
		body: handoff.mapBody,
		viewMode: "flat",
	});

	return {
		viewMode: "flat",
		renderer: "deckgl-maplibre",
		mapBody: handoff.mapBody,
		reason: handoff.reason,
		bounds: handoff.bounds ? { ...handoff.bounds } : null,
		focus: handoff.focus ? { ...handoff.focus } : null,
		filterSnapshot: { ...handoff.filterSnapshot },
		layerFamilies,
		layerHints: [...handoff.layerHints],
		temporal: {
			viewRangeMs: handoff.viewRangeMs ? [...handoff.viewRangeMs] : null,
			filterRangeMs: handoff.filterRangeMs ? [...handoff.filterRangeMs] : null,
			selectedTimeMs: handoff.selectedTimeMs,
		},
		basemapPolicy,
		pmtilesPreferred: basemapPolicy.pmtilesAllowed,
	};
}
