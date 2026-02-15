import type { GeoCoordinate, GeoDrawing } from "@/lib/geopolitical/types";

export type SharedDrawingType = "line" | "polygon" | "text";

export interface SharedDrawingPrimitive {
	id: string;
	type: SharedDrawingType;
	points: GeoCoordinate[];
	label?: string;
	color?: string;
}

export function toSharedPrimitive(drawing: GeoDrawing): SharedDrawingPrimitive {
	return {
		id: drawing.id,
		type: drawing.type,
		points: drawing.points,
		label: drawing.label,
		color: drawing.color,
	};
}

export function validatePrimitive(primitive: SharedDrawingPrimitive): boolean {
	if (!primitive.id || !Array.isArray(primitive.points) || primitive.points.length === 0) {
		return false;
	}
	if (primitive.type === "line" && primitive.points.length < 2) {
		return false;
	}
	if (primitive.type === "polygon" && primitive.points.length < 3) {
		return false;
	}
	return primitive.points.every(
		(point) =>
			Number.isFinite(point.lat) &&
			Number.isFinite(point.lng) &&
			point.lat >= -90 &&
			point.lat <= 90 &&
			point.lng >= -180 &&
			point.lng <= 180,
	);
}
