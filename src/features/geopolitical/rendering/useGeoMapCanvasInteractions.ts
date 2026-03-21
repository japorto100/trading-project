import { type MouseEvent, type RefObject, useCallback, useState } from "react";
import type { GeoViewportSelectionBox } from "@/features/geopolitical/box-selection";
import { getGeoBoxSelectedMarkerIds } from "@/features/geopolitical/box-selection";
import type {
	GeoMapMarkerPoint,
	GeoMapProjectionModel,
} from "@/features/geopolitical/rendering/useGeoMapProjectionModel";
import type { GeoCoordinate } from "@/lib/geopolitical/types";

interface UseGeoMapCanvasInteractionsParams {
	svgRef: RefObject<SVGSVGElement | null>;
	mapWidth: number;
	mapHeight: number;
	projection: GeoMapProjectionModel["projection"];
	markers: GeoMapMarkerPoint[];
	drawingMode: string | null;
	pendingLineStart: GeoCoordinate | null;
	isDrawingInteractionActive: boolean;
	findNearestMarkerIdAtScreenPoint: (x: number, y: number, maxDistancePx?: number) => string | null;
	onMapClick: (coords: { lat: number; lng: number }) => void;
	onSelectEvent: (eventId: string) => void;
	onSelectEvents?: (eventIds: string[], mode?: "replace" | "append" | "toggle" | "clear") => void;
	setIsAutoRotating: React.Dispatch<React.SetStateAction<boolean>>;
	setPopupEventId: React.Dispatch<React.SetStateAction<string | null>>;
	setHoverEventId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useGeoMapCanvasInteractions({
	svgRef,
	mapWidth,
	mapHeight,
	projection,
	markers,
	drawingMode,
	pendingLineStart,
	isDrawingInteractionActive,
	findNearestMarkerIdAtScreenPoint,
	onMapClick,
	onSelectEvent,
	onSelectEvents,
	setIsAutoRotating,
	setPopupEventId,
	setHoverEventId,
}: UseGeoMapCanvasInteractionsParams) {
	const [previewPoint, setPreviewPoint] = useState<GeoCoordinate | null>(null);
	const [selectionBox, setSelectionBox] = useState<GeoViewportSelectionBox | null>(null);

	const resolvePointerCoordinates = useCallback(
		(event: MouseEvent<SVGSVGElement>) => {
			const svg = svgRef.current;
			if (!svg) return null;
			const rect = svg.getBoundingClientRect();
			return {
				x: (event.clientX - rect.left) * (mapWidth / rect.width),
				y: (event.clientY - rect.top) * (mapHeight / rect.height),
			};
		},
		[mapHeight, mapWidth, svgRef],
	);

	const handleSelectionBoxStart = useCallback(
		(event: MouseEvent<SVGSVGElement>) => {
			if (!event.shiftKey || isDrawingInteractionActive) return;
			const point = resolvePointerCoordinates(event);
			if (!point) return;
			event.preventDefault();
			event.stopPropagation();
			setIsAutoRotating(false);
			setSelectionBox({
				startX: point.x,
				startY: point.y,
				endX: point.x,
				endY: point.y,
			});
		},
		[isDrawingInteractionActive, resolvePointerCoordinates, setIsAutoRotating],
	);

	const handleSelectionBoxMove = useCallback(
		(event: MouseEvent<SVGSVGElement>) => {
			if (!selectionBox) return;
			const point = resolvePointerCoordinates(event);
			if (!point) return;
			event.preventDefault();
			setSelectionBox((current) =>
				current
					? {
							...current,
							endX: point.x,
							endY: point.y,
						}
					: current,
			);
		},
		[resolvePointerCoordinates, selectionBox],
	);

	const handleSelectionBoxEnd = useCallback(
		(event: MouseEvent<SVGSVGElement>) => {
			if (!selectionBox) return;
			const markerIds = getGeoBoxSelectedMarkerIds({
				box: selectionBox,
				markers,
			});
			setSelectionBox(null);
			if (markerIds.length === 0) return;
			onSelectEvents?.(markerIds, event.metaKey || event.ctrlKey ? "append" : "replace");
		},
		[markers, onSelectEvents, selectionBox],
	);

	const handleBackgroundClick = useCallback(
		(event: MouseEvent<SVGSVGElement>) => {
			if (!svgRef.current) return;
			if (event.shiftKey || selectionBox) return;
			setIsAutoRotating(false);

			const rect = event.currentTarget.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;
			const x = mouseX * (mapWidth / rect.width);
			const y = mouseY * (mapHeight / rect.height);

			const inverted = projection.invert?.([x, y]);
			if (!inverted) return;

			const [lng, lat] = inverted;
			if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

			if (isDrawingInteractionActive) {
				setPopupEventId(null);
				onMapClick({
					lat: Number(lat.toFixed(6)),
					lng: Number(lng.toFixed(6)),
				});
				return;
			}

			const nearestMarkerId = findNearestMarkerIdAtScreenPoint(x, y, 14);
			if (nearestMarkerId) {
				setPopupEventId(nearestMarkerId);
				onSelectEvent(nearestMarkerId);
				return;
			}

			setPopupEventId(null);
			onMapClick({
				lat: Number(lat.toFixed(6)),
				lng: Number(lng.toFixed(6)),
			});
		},
		[
			findNearestMarkerIdAtScreenPoint,
			isDrawingInteractionActive,
			mapHeight,
			mapWidth,
			onMapClick,
			onSelectEvent,
			projection,
			selectionBox,
			setIsAutoRotating,
			setPopupEventId,
			svgRef,
		],
	);

	const handleSvgMouseMove = useCallback(
		(event: MouseEvent<SVGSVGElement>) => {
			const rect = event.currentTarget.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;
			const x = mouseX * (mapWidth / rect.width);
			const y = mouseY * (mapHeight / rect.height);

			if (isDrawingInteractionActive) {
				setHoverEventId((previous) => (previous === null ? previous : null));
			} else {
				const nearestMarkerId = findNearestMarkerIdAtScreenPoint(x, y, 10);
				setHoverEventId((previous) => (previous === nearestMarkerId ? previous : nearestMarkerId));
			}

			if (
				(drawingMode === "line" || drawingMode === "polygon") &&
				(drawingMode !== "line" || pendingLineStart) &&
				projection.invert
			) {
				const inverted = projection.invert([x, y]);
				if (inverted) {
					const [lng, lat] = inverted;
					if (Number.isFinite(lat) && Number.isFinite(lng)) {
						setPreviewPoint({ lat, lng });
						return;
					}
				}
			}

			setPreviewPoint((previous) => (previous === null ? previous : null));
		},
		[
			drawingMode,
			findNearestMarkerIdAtScreenPoint,
			isDrawingInteractionActive,
			mapHeight,
			mapWidth,
			pendingLineStart,
			projection,
			setHoverEventId,
		],
	);

	const handleSvgMouseLeave = useCallback(() => {
		setHoverEventId(null);
		setPreviewPoint(null);
		setSelectionBox(null);
	}, [setHoverEventId]);

	return {
		previewPoint,
		selectionBox,
		handleBackgroundClick,
		handleSelectionBoxEnd,
		handleSelectionBoxMove,
		handleSelectionBoxStart,
		handleSvgMouseLeave,
		handleSvgMouseMove,
	};
}
