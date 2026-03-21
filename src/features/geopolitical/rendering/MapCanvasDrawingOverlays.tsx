import {
	type GeoViewportSelectionBox,
	normalizeGeoViewportSelectionBox,
} from "@/features/geopolitical/box-selection";
import type { GeoMapProjectionModel } from "@/features/geopolitical/rendering/useGeoMapProjectionModel";
import type { GeoCoordinate } from "@/lib/geopolitical/types";

interface MapCanvasDrawingOverlaysProps {
	selectionBox: GeoViewportSelectionBox | null;
	drawingMode: string | null;
	pendingLineStart: GeoCoordinate | null;
	pendingPolygonPoints: GeoCoordinate[];
	previewPoint: GeoCoordinate | null;
	drawingColor: string;
	projection: GeoMapProjectionModel["projection"];
}

export function MapCanvasDrawingOverlays({
	selectionBox,
	drawingMode,
	pendingLineStart,
	pendingPolygonPoints,
	previewPoint,
	drawingColor,
	projection,
}: MapCanvasDrawingOverlaysProps) {
	return (
		<>
			{selectionBox
				? (() => {
						const normalizedSelectionBox = normalizeGeoViewportSelectionBox(selectionBox);
						return (
							<rect
								x={normalizedSelectionBox.startX}
								y={normalizedSelectionBox.startY}
								width={normalizedSelectionBox.endX - normalizedSelectionBox.startX}
								height={normalizedSelectionBox.endY - normalizedSelectionBox.startY}
								fill="rgba(56, 189, 248, 0.12)"
								stroke="#38bdf8"
								strokeDasharray="6 4"
								strokeWidth={1.5}
								pointerEvents="none"
							/>
						);
					})()
				: null}

			{drawingMode === "line" && pendingLineStart && previewPoint
				? (() => {
						const startProjected = projection([pendingLineStart.lng, pendingLineStart.lat]);
						const endProjected = projection([previewPoint.lng, previewPoint.lat]);
						if (!startProjected || !endProjected) return null;
						return (
							<line
								x1={startProjected[0]}
								y1={startProjected[1]}
								x2={endProjected[0]}
								y2={endProjected[1]}
								stroke={drawingColor}
								strokeWidth={1.5}
								strokeDasharray="5,4"
								opacity={0.75}
								pointerEvents="none"
							/>
						);
					})()
				: null}

			{drawingMode === "polygon" && pendingPolygonPoints.length > 0
				? (() => {
						const previewPoints = [...pendingPolygonPoints];
						if (previewPoint) {
							previewPoints.push(previewPoint);
						}
						const projected = previewPoints
							.map((point) => projection([point.lng, point.lat]))
							.filter((point): point is [number, number] => Array.isArray(point));
						if (projected.length === 0) return null;
						const polylinePoints = projected.map(([x, y]) => `${x},${y}`).join(" ");
						return (
							<g pointerEvents="none">
								<polyline
									points={polylinePoints}
									fill={pendingPolygonPoints.length >= 3 ? drawingColor : "none"}
									fillOpacity={pendingPolygonPoints.length >= 3 ? 0.14 : 0}
									stroke={drawingColor}
									strokeWidth={1.6}
									strokeDasharray="5,4"
									opacity={0.85}
								/>
								{projected.map(([x, y], index) => (
									<circle
										key={`pending-polygon-point-${previewPoints[index]?.lat ?? y}-${previewPoints[index]?.lng ?? x}`}
										cx={x}
										cy={y}
										r={3}
										fill={drawingColor}
										stroke="#020617"
										strokeWidth={0.8}
									/>
								))}
							</g>
						);
					})()
				: null}
		</>
	);
}
