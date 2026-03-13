import { memo } from "react";
import {
	buildDrawingWorkflowHint,
	buildGeoInteractionStatus,
} from "@/features/geopolitical/drawing-workflow";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view-handoff";
import { getBodyPointLayerLegendEntries } from "@/features/geopolitical/layers/bodyPointLayerCatalog";
import { MapCanvas } from "@/features/geopolitical/MapCanvas";
import { MapBodyLayerLegendOverlay } from "@/features/geopolitical/shell/MapBodyLayerLegendOverlay";
import { MapInteractionStatusOverlay } from "@/features/geopolitical/shell/MapInteractionStatusOverlay";
import type { DrawingMode } from "@/features/geopolitical/shell/types";
import type { GeoEarthChoroplethMode, GeoMapBody } from "@/features/geopolitical/store";
import type { GeoCandidate, GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

interface MapViewportPanelProps {
	mapBody: GeoMapBody;
	viewportResetNonce: number;
	loading: boolean;
	events: GeoEvent[];
	candidates: GeoCandidate[];
	drawings: GeoDrawing[];
	showRegionLayer: boolean;
	showHeatmap: boolean;
	showSoftSignals: boolean;
	showBodyLayerLegend: boolean;
	bodyPointLayerVisibility: Partial<Record<string, boolean>>;
	earthChoroplethMode: GeoEarthChoroplethMode;
	selectedEventId: string | null;
	selectedDrawingId: string | null;
	markerPlacementArmed: boolean;
	canUndoDrawings: boolean;
	canRedoDrawings: boolean;
	onSelectEvent: (eventId: string) => void;
	onSelectDrawing: (drawingId: string) => void;
	onMapClick: (coords: { lat: number; lng: number }) => void;
	onCountryClick: (countryId: string) => void;
	onOpenFlatViewForCluster: (bounds: GeoFlatViewBounds) => void;
	onToggleBodyPointLayerVisibility: (layerId: string) => void;
	onResetBodyPointLayerVisibility: () => void;
	onChangeEarthChoroplethMode: (mode: GeoEarthChoroplethMode) => void;
	drawingMode: DrawingMode | null;
	pendingLineStart: { lat: number; lng: number } | null;
	pendingPolygonPoints: Array<{ lat: number; lng: number }>;
	drawingColor: string;
}

export const MapViewportPanel = memo(function MapViewportPanel({
	mapBody,
	viewportResetNonce,
	loading,
	events,
	candidates,
	drawings,
	showRegionLayer,
	showHeatmap,
	showSoftSignals,
	showBodyLayerLegend,
	bodyPointLayerVisibility,
	earthChoroplethMode,
	selectedEventId,
	selectedDrawingId,
	markerPlacementArmed,
	canUndoDrawings,
	canRedoDrawings,
	onSelectEvent,
	onSelectDrawing,
	onMapClick,
	onCountryClick,
	onOpenFlatViewForCluster,
	onToggleBodyPointLayerVisibility,
	onResetBodyPointLayerVisibility,
	onChangeEarthChoroplethMode,
	drawingMode,
	pendingLineStart,
	pendingPolygonPoints,
	drawingColor,
}: MapViewportPanelProps) {
	const bodyPointLayerLegends = getBodyPointLayerLegendEntries(mapBody);
	const viewportEvents = mapBody === "earth" ? events : [];
	const viewportCandidates = mapBody === "earth" ? candidates : [];
	const viewportDrawings = mapBody === "earth" ? drawings : [];
	const viewportShowSoftSignals = mapBody === "earth" ? showSoftSignals : false;
	const interactionStatusItems = buildGeoInteractionStatus({
		markerPlacementArmed,
		drawingMode,
		lineStartSet: Boolean(pendingLineStart),
		pendingPolygonPointsCount: pendingPolygonPoints.length,
		selectedDrawingId,
		mapBody,
	});
	const interactionWorkflowHint = buildDrawingWorkflowHint({
		drawingMode: drawingMode === null ? "cursor" : drawingMode,
		lineStartSet: Boolean(pendingLineStart),
		pendingPolygonPointsCount: pendingPolygonPoints.length,
		selectedDrawingId,
		canUndoDrawings,
		canRedoDrawings,
	});

	return (
		<div className="h-full w-full">
			{loading ? (
				<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
					Loading geopolitical workspace...
				</div>
			) : (
				<div className="relative h-full w-full" data-geomap-export-root="true">
					<MapCanvas
						mapBody={mapBody}
						viewportResetNonce={viewportResetNonce}
						events={viewportEvents}
						candidates={viewportCandidates}
						drawings={viewportDrawings}
						showRegionLayer={showRegionLayer}
						showHeatmap={mapBody === "earth" ? showHeatmap : false}
						showSoftSignals={viewportShowSoftSignals}
						bodyPointLayerVisibility={bodyPointLayerVisibility}
						earthChoroplethMode={earthChoroplethMode}
						onChangeEarthChoroplethMode={onChangeEarthChoroplethMode}
						selectedEventId={selectedEventId}
						selectedDrawingId={selectedDrawingId}
						onSelectEvent={onSelectEvent}
						onSelectDrawing={onSelectDrawing}
						onMapClick={onMapClick}
						onCountryClick={onCountryClick}
						onOpenFlatViewForCluster={onOpenFlatViewForCluster}
						drawingMode={drawingMode}
						pendingLineStart={pendingLineStart}
						pendingPolygonPoints={pendingPolygonPoints}
						drawingColor={drawingColor}
					/>
					{showBodyLayerLegend ? (
						<MapBodyLayerLegendOverlay
							mapBody={mapBody}
							legends={bodyPointLayerLegends}
							bodyPointLayerVisibility={bodyPointLayerVisibility}
							onToggleBodyPointLayerVisibility={onToggleBodyPointLayerVisibility}
							onResetBodyPointLayerVisibility={onResetBodyPointLayerVisibility}
						/>
					) : null}
					<MapInteractionStatusOverlay
						items={interactionStatusItems}
						workflowHint={interactionWorkflowHint}
					/>
				</div>
			)}
		</div>
	);
});
