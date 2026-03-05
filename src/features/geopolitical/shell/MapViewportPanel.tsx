import { memo } from "react";
import { getBodyPointLayerLegendEntries } from "@/features/geopolitical/layers/bodyPointLayerCatalog";
import { MapCanvas } from "@/features/geopolitical/MapCanvas";
import { MapBodyLayerLegendOverlay } from "@/features/geopolitical/shell/MapBodyLayerLegendOverlay";
import type { GeoEarthChoroplethMode, GeoMapBody } from "@/features/geopolitical/store";
import type { GeoCandidate, GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

interface MapViewportPanelProps {
	mapBody: GeoMapBody;
	loading: boolean;
	events: GeoEvent[];
	candidates: GeoCandidate[];
	drawings: GeoDrawing[];
	showRegionLayer: boolean;
	showHeatmap: boolean;
	showSoftSignals: boolean;
	bodyPointLayerVisibility: Partial<Record<string, boolean>>;
	earthChoroplethMode: GeoEarthChoroplethMode;
	selectedEventId: string | null;
	selectedDrawingId: string | null;
	onSelectEvent: (eventId: string) => void;
	onSelectDrawing: (drawingId: string) => void;
	onMapClick: (coords: { lat: number; lng: number }) => void;
	onCountryClick: (countryId: string) => void;
	onToggleBodyPointLayerVisibility: (layerId: string) => void;
	onResetBodyPointLayerVisibility: () => void;
	onChangeEarthChoroplethMode: (mode: GeoEarthChoroplethMode) => void;
	drawingMode: string | null;
	pendingLineStart: { lat: number; lng: number } | null;
	pendingPolygonPoints: Array<{ lat: number; lng: number }>;
	drawingColor: string;
}

export const MapViewportPanel = memo(function MapViewportPanel({
	mapBody,
	loading,
	events,
	candidates,
	drawings,
	showRegionLayer,
	showHeatmap,
	showSoftSignals,
	bodyPointLayerVisibility,
	earthChoroplethMode,
	selectedEventId,
	selectedDrawingId,
	onSelectEvent,
	onSelectDrawing,
	onMapClick,
	onCountryClick,
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

	return (
		<div className="h-full w-full">
			{loading ? (
				<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
					Loading geopolitical workspace...
				</div>
			) : (
				<div className="relative h-full w-full">
					<MapCanvas
						mapBody={mapBody}
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
						drawingMode={drawingMode}
						pendingLineStart={pendingLineStart}
						pendingPolygonPoints={pendingPolygonPoints}
						drawingColor={drawingColor}
					/>
					<MapBodyLayerLegendOverlay
						mapBody={mapBody}
						legends={bodyPointLayerLegends}
						bodyPointLayerVisibility={bodyPointLayerVisibility}
						onToggleBodyPointLayerVisibility={onToggleBodyPointLayerVisibility}
						onResetBodyPointLayerVisibility={onResetBodyPointLayerVisibility}
					/>
				</div>
			)}
		</div>
	);
});
