import {
	buildGeoFlatViewConflictLayers,
	type GeoFlatViewConflictLayers,
} from "@/features/geopolitical/flat-view-conflict-layers";
import {
	buildGeoFlatLayerMatrixForFamilies,
	type GeoFlatLayerMatrixEntry,
} from "@/features/geopolitical/flat-view-layer-matrix";
import {
	buildGeoFlatViewOverlayBoundsCollection,
	buildGeoFlatViewOverlayEventPoints,
	type GeoFlatViewOverlayEventPoint,
} from "@/features/geopolitical/flat-view-overlay-payload";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view-state";
import {
	buildGeoFlatViewTimelineModel,
	type GeoFlatViewTimelineModel,
} from "@/features/geopolitical/flat-view-timeline-model";
import {
	type GeoFlatLayerOptionDefinition,
	type GeoFlatLayerOptionId,
	type GeoMapLayerFamilyDefinition,
	getGeoMapFlatLayerOptionsForFamilies,
	getGeoMapLayerFamilyDefinition,
} from "@/features/geopolitical/layer-taxonomy";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface GeoFlatViewOverlayChromeState {
	showFilters: boolean;
	showLegend: boolean;
	showTimeline: boolean;
}

export interface GeoFlatViewRendererContract {
	renderer: GeoFlatViewState["renderer"];
	bounds: GeoFlatViewState["bounds"];
	basemapPolicy: GeoFlatViewState["basemapPolicy"];
	focus: GeoFlatViewState["focus"];
	layerFamilies: GeoFlatViewState["layerFamilies"];
	layerDefinitions: GeoMapLayerFamilyDefinition[];
	flatLayerOptions: GeoFlatLayerOptionDefinition[];
	activeFlatLayerOptionIds: GeoFlatLayerOptionId[];
	flatLayerMatrix: GeoFlatLayerMatrixEntry[];
	overlayChrome: GeoFlatViewOverlayChromeState;
	boundsGeoJson: ReturnType<typeof buildGeoFlatViewOverlayBoundsCollection>;
	eventPoints: GeoFlatViewOverlayEventPoint[];
	conflictLayers: GeoFlatViewConflictLayers;
	timelineModel: GeoFlatViewTimelineModel;
}

export function buildGeoFlatViewRendererContract(params: {
	state: GeoFlatViewState;
	events: GeoEvent[];
	selectedEventId: string | null;
	overlayChrome: GeoFlatViewOverlayChromeState;
	activeLayerOptionIds?: GeoFlatLayerOptionId[];
}): GeoFlatViewRendererContract {
	const flatLayerOptions = getGeoMapFlatLayerOptionsForFamilies(params.state.layerFamilies);
	const fallbackActiveOptionIds = flatLayerOptions.map((option) => option.id);
	const activeFlatLayerOptionIds =
		params.activeLayerOptionIds?.filter((optionId) =>
			flatLayerOptions.some((option) => option.id === optionId),
		) ?? fallbackActiveOptionIds;

	return {
		renderer: params.state.renderer,
		bounds: params.state.bounds,
		basemapPolicy: params.state.basemapPolicy,
		focus: params.state.focus,
		layerFamilies: params.state.layerFamilies,
		layerDefinitions: params.state.layerFamilies.map((family) =>
			getGeoMapLayerFamilyDefinition(family),
		),
		flatLayerOptions,
		activeFlatLayerOptionIds,
		flatLayerMatrix: buildGeoFlatLayerMatrixForFamilies(params.state.layerFamilies),
		overlayChrome: params.overlayChrome,
		boundsGeoJson: buildGeoFlatViewOverlayBoundsCollection(params.state.bounds),
		eventPoints: buildGeoFlatViewOverlayEventPoints({
			events: params.events,
			bounds: params.state.bounds,
			selectedEventId: params.selectedEventId,
		}),
		conflictLayers: buildGeoFlatViewConflictLayers({
			events: params.events,
			bounds: params.state.bounds,
			selectedEventId: params.selectedEventId,
		}),
		timelineModel: buildGeoFlatViewTimelineModel({
			events: params.events,
			viewRangeMs: params.state.temporal.viewRangeMs,
			filterRangeMs: params.state.temporal.filterRangeMs,
			selectedTimeMs: params.state.temporal.selectedTimeMs,
			layerFamilies: params.state.layerFamilies,
		}),
	};
}
