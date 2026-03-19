import type { GeoMapMarkerPoint } from "@/features/geopolitical/rendering/useGeoMapProjectionModel";

export interface GeoViewportSelectionBox {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

export function normalizeGeoViewportSelectionBox(
	box: GeoViewportSelectionBox,
): GeoViewportSelectionBox {
	return {
		startX: Math.min(box.startX, box.endX),
		startY: Math.min(box.startY, box.endY),
		endX: Math.max(box.startX, box.endX),
		endY: Math.max(box.startY, box.endY),
	};
}

export function getGeoBoxSelectedMarkerIds(params: {
	box: GeoViewportSelectionBox;
	markers: GeoMapMarkerPoint[];
	minDragPixels?: number;
}): string[] {
	const normalized = normalizeGeoViewportSelectionBox(params.box);
	const width = normalized.endX - normalized.startX;
	const height = normalized.endY - normalized.startY;
	if (width < (params.minDragPixels ?? 8) || height < (params.minDragPixels ?? 8)) {
		return [];
	}
	return params.markers
		.filter(
			(marker) =>
				marker.visible &&
				marker.x >= normalized.startX &&
				marker.x <= normalized.endX &&
				marker.y >= normalized.startY &&
				marker.y <= normalized.endY,
		)
		.map((marker) => marker.id);
}
