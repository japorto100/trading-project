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
}

export function MapViewportPanel({
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
}: MapViewportPanelProps) {
	const bodyPointLayerLegends = getBodyPointLayerLegendEntries(mapBody);

	return (
		<div className="flex min-h-0 flex-1 overflow-hidden p-3">
			{loading ? (
				<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
					Loading geopolitical workspace...
				</div>
			) : (
				<div className="relative h-full w-full">
					<MapCanvas
						mapBody={mapBody}
						events={events}
						candidates={candidates}
						drawings={drawings}
						showRegionLayer={showRegionLayer}
						showHeatmap={mapBody === "earth" ? showHeatmap : false}
						showSoftSignals={showSoftSignals}
						bodyPointLayerVisibility={bodyPointLayerVisibility}
						earthChoroplethMode={earthChoroplethMode}
						onChangeEarthChoroplethMode={onChangeEarthChoroplethMode}
						selectedEventId={selectedEventId}
						selectedDrawingId={selectedDrawingId}
						onSelectEvent={onSelectEvent}
						onSelectDrawing={onSelectDrawing}
						onMapClick={onMapClick}
						onCountryClick={onCountryClick}
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
}
