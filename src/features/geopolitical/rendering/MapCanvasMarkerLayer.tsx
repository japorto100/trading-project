import { getMarkerSeverityColor } from "@/features/geopolitical/d3/scales";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view/flat-view-handoff";
import { buildGeoMarkerPriorityContract } from "@/features/geopolitical/markers/marker-priority";
import {
	buildGeoMarkerInteractionState,
	buildGeoMarkerSymbolPath,
} from "@/features/geopolitical/markers/marker-view-model";
import type { GeoMapMarkerCluster } from "@/features/geopolitical/rendering/useGeoMapMarkerClusters";
import type { GeoMapMarkerPoint } from "@/features/geopolitical/rendering/useGeoMapProjectionModel";

interface MapCanvasMarkerLayerProps {
	scale: number;
	clusteringActive: boolean;
	clusters: GeoMapMarkerCluster[];
	unclusteredMarkerIds: Set<string>;
	markers: GeoMapMarkerPoint[];
	selectedEventId: string | null;
	selectedEventIds: string[];
	hoverEventId: string | null;
	isDrawingInteractionActive: boolean;
	onSelectEvent: (eventId: string) => void;
	onSelectEvents?: (eventIds: string[], mode?: "replace" | "append" | "toggle" | "clear") => void;
	onClusterFocus: (cluster: { lat: number; lng: number }) => void;
	onClusterOpenInFlat: (bounds: GeoFlatViewBounds | null) => void;
	onMarkerPopupChange: (eventId: string) => void;
}

export function MapCanvasMarkerLayer({
	scale,
	clusteringActive,
	clusters,
	unclusteredMarkerIds,
	markers,
	selectedEventId,
	selectedEventIds,
	hoverEventId,
	isDrawingInteractionActive,
	onSelectEvent,
	onSelectEvents,
	onClusterFocus,
	onClusterOpenInFlat,
	onMarkerPopupChange,
}: MapCanvasMarkerLayerProps) {
	const selectedEventIdSet = new Set(selectedEventIds);
	const renderedMarkers = markers
		.filter((marker) => {
			if (!marker.visible) return false;
			if (
				clusteringActive &&
				!unclusteredMarkerIds.has(marker.id) &&
				marker.id !== selectedEventId
			) {
				return false;
			}
			return true;
		})
		.map((marker) => {
			const interactionState = buildGeoMarkerInteractionState({
				markerId: marker.id,
				selectedEventId,
				selectedEventIds: selectedEventIdSet,
				hoverEventId,
			});
			const priority = buildGeoMarkerPriorityContract({
				event: marker.raw,
				selected: interactionState.selected,
			});
			const symbolPath = buildGeoMarkerSymbolPath(marker.symbol, 95);
			const labelText =
				marker.title.length <= 18 ? marker.title : `${marker.title.slice(0, 15).trimEnd()}...`;
			return {
				marker,
				interactionState,
				priority,
				symbolPath,
				labelText,
			};
		})
		.sort((left, right) => left.priority.priorityScore - right.priority.priorityScore);

	return (
		<g data-render-stage="markers">
			{clusteringActive
				? clusters.map((cluster) => (
						<g
							key={cluster.id}
							transform={`translate(${cluster.x}, ${cluster.y})`}
							role="button"
							tabIndex={0}
							aria-label={`Cluster with ${cluster.count} events`}
							className="cursor-pointer"
							onDoubleClick={(event) => {
								event.stopPropagation();
								onClusterOpenInFlat(cluster.bounds);
							}}
							onClick={(event) => {
								event.stopPropagation();
								if (event.shiftKey) {
									onSelectEvents?.(
										cluster.markerIds,
										event.metaKey || event.ctrlKey ? "append" : "replace",
									);
									return;
								}
								onClusterFocus(cluster);
							}}
							onKeyDown={(event) => {
								if (event.key !== "Enter" && event.key !== " ") return;
								event.preventDefault();
								event.stopPropagation();
								if (event.shiftKey) {
									onClusterOpenInFlat(cluster.bounds);
									return;
								}
								onClusterFocus(cluster);
							}}
						>
							{cluster.maxSeverity >= 4 || cluster.highPriorityCount > 0 ? (
								<circle
									r={21}
									fill="url(#halo-gradient)"
									opacity={cluster.maxSeverity >= 5 ? 0.95 : 0.74}
								/>
							) : null}
							<circle
								r={16}
								fill="#0f172a"
								stroke={
									cluster.maxSeverity >= 5
										? "#f87171"
										: cluster.maxSeverity >= 4
											? "#fb923c"
											: "#38bdf8"
								}
								strokeWidth={1.5}
								opacity={0.92}
							/>
							<circle
								r={11}
								fill={cluster.maxSeverity >= 4 ? "#3f1d12" : "#1e293b"}
								stroke={cluster.maxSeverity >= 4 ? "#fdba74" : "#7dd3fc"}
								strokeWidth={1}
								opacity={0.95}
							/>
							<text
								y={4}
								textAnchor="middle"
								fill="#e2e8f0"
								fontSize={10}
								fontWeight={800}
								style={{ pointerEvents: "none", userSelect: "none" }}
							>
								{cluster.count > 99 ? "99+" : String(cluster.count)}
							</text>
							{cluster.maxSeverity >= 4 ? (
								<g style={{ pointerEvents: "none", userSelect: "none" }}>
									<rect
										x={-11}
										y={-25}
										width={22}
										height={12}
										rx={6}
										fill="#08111f"
										stroke={cluster.maxSeverity >= 5 ? "#f87171" : "#fb923c"}
										strokeWidth={0.8}
										opacity={0.92}
									/>
									<text y={-16} textAnchor="middle" fill="#f8fafc" fontSize={8} fontWeight={800}>
										{cluster.representativeShortCode}
									</text>
								</g>
							) : null}
							<title>{`Cluster: ${cluster.count} events. Click to focus, double-click or Shift+Enter to inspect in flat view.`}</title>
						</g>
					))
				: null}

			{renderedMarkers.map(({ marker, interactionState, priority, symbolPath, labelText }) => {
				const markerColor = getMarkerSeverityColor(marker.severity);
				const markerRadius =
					interactionState.selected || priority.priorityTier === "critical"
						? 15
						: priority.priorityTier === "high"
							? 14.5
							: 14;
				const showPriorityHalo =
					interactionState.selected ||
					interactionState.hovered ||
					interactionState.multiSelected ||
					priority.priorityTier === "critical" ||
					priority.priorityTier === "high";
				const labelZoomGate = scale >= 420;
				const showPriorityLabel =
					!isDrawingInteractionActive &&
					(interactionState.selected || (priority.labelVisible && labelZoomGate));
				const haloStroke = interactionState.selected
					? "#10b981"
					: interactionState.multiSelected
						? "#f59e0b"
						: priority.priorityTier === "critical"
							? "#f87171"
							: priority.priorityTier === "high"
								? "#fb923c"
								: "#7dd3fc";
				const haloRadius =
					interactionState.selected || priority.priorityTier === "critical"
						? 24
						: interactionState.multiSelected || priority.priorityTier === "high"
							? 21
							: 18;
				const labelWidth = Math.max(42, labelText.length * 6.4 + 14);
				return (
					<g
						key={marker.id}
						transform={`translate(${marker.x}, ${marker.y})`}
						role="button"
						tabIndex={0}
						aria-label={`Marker ${marker.title} severity ${marker.severity}`}
						onClick={(event) => {
							event.stopPropagation();
							onMarkerPopupChange(marker.id);
							onSelectEvent(marker.id);
						}}
						pointerEvents={isDrawingInteractionActive ? "none" : "all"}
						className="cursor-pointer outline-none focus-visible:outline-none"
					>
						{showPriorityHalo ? (
							<g>
								<circle
									r={haloRadius + 2}
									fill="url(#halo-gradient)"
									opacity={
										interactionState.selected ? 1 : priority.priorityTier === "critical" ? 0.9 : 0.7
									}
								/>
								<circle
									r={haloRadius}
									fill="none"
									stroke={haloStroke}
									strokeWidth={interactionState.selected ? 2 : 1.25}
									opacity={interactionState.selected ? 0.82 : 0.68}
								>
									<animate
										attributeName="r"
										from={String(Math.max(haloRadius - 3, 12))}
										to={String(haloRadius + 2)}
										dur="1.5s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										from="0.8"
										to="0.4"
										dur="1.5s"
										repeatCount="indefinite"
									/>
								</circle>
							</g>
						) : null}
						{showPriorityLabel ? (
							<g style={{ pointerEvents: "none", userSelect: "none" }}>
								<rect
									x={-labelWidth / 2}
									y={-(markerRadius + 26)}
									width={labelWidth}
									height={18}
									rx={9}
									fill="#08111f"
									stroke={haloStroke}
									strokeWidth={0.9}
									opacity={0.92}
								/>
								<text
									y={-(markerRadius + 13)}
									textAnchor="middle"
									fill={interactionState.selected ? "#fef3c7" : "#e2e8f0"}
									fontSize={10}
									fontWeight={700}
								>
									{labelText}
								</text>
							</g>
						) : null}
						<circle
							r={markerRadius}
							fill={markerColor}
							stroke="#020617"
							strokeWidth={2}
							className="drop-shadow-lg"
						/>
						<path
							d={symbolPath}
							transform="translate(0, 1)"
							fill="#f8fafc"
							stroke="#0f172a"
							strokeWidth={0.8}
							style={{ pointerEvents: "none" }}
						/>
						<title>{marker.title}</title>
					</g>
				);
			})}
		</g>
	);
}
