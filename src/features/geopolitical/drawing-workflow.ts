"use client";

import type { DrawingMode } from "@/features/geopolitical/shell/types";

export interface ParsedGeoCoordinateInput {
	value: number | null;
	error: string | null;
}

export interface GeoInteractionStatusItem {
	id: string;
	label: string;
	tone: "neutral" | "active" | "warning";
}

export function parseLatitudeInput(raw: string): ParsedGeoCoordinateInput {
	const value = Number(raw);
	if (!Number.isFinite(value)) {
		return { value: null, error: "Latitude must be a valid number." };
	}
	if (value < -90 || value > 90) {
		return { value: null, error: "Latitude must stay between -90 and 90." };
	}
	return { value: Number(value.toFixed(6)), error: null };
}

export function parseLongitudeInput(raw: string): ParsedGeoCoordinateInput {
	const value = Number(raw);
	if (!Number.isFinite(value)) {
		return { value: null, error: "Longitude must be a valid number." };
	}
	if (value < -180 || value > 180) {
		return { value: null, error: "Longitude must stay between -180 and 180." };
	}
	return { value: Number(value.toFixed(6)), error: null };
}

export function buildDrawingWorkflowHint(params: {
	drawingMode: DrawingMode;
	lineStartSet: boolean;
	pendingPolygonPointsCount: number;
	selectedDrawingId: string | null;
	canUndoDrawings: boolean;
	canRedoDrawings: boolean;
}): string {
	const {
		drawingMode,
		lineStartSet,
		pendingPolygonPointsCount,
		selectedDrawingId,
		canUndoDrawings,
		canRedoDrawings,
	} = params;

	if (drawingMode === "line") {
		return lineStartSet
			? "Line start locked. Place the second point to finish the segment."
			: "Click once to place the line start, then click again to complete it.";
	}

	if (drawingMode === "polygon") {
		if (pendingPolygonPointsCount >= 3) {
			return `Polygon has ${pendingPolygonPointsCount} points. Complete it now or keep adding vertices.`;
		}
		return `Polygon needs at least 3 points. Current points: ${pendingPolygonPointsCount}.`;
	}

	if (drawingMode === "text") {
		return "Click the map to place a text annotation at the active cursor position.";
	}

	if (drawingMode === "cursor") {
		return "Cursor mode keeps normal globe navigation active. Select a tool only when you want to place or edit geometry.";
	}

	if (selectedDrawingId) {
		return "A drawing is selected. You can delete it or continue with undo/redo history.";
	}

	if (canUndoDrawings || canRedoDrawings) {
		return "Drawing history is available. Use undo/redo to inspect recent geometry changes.";
	}

	return "Choose a drawing mode to start placing geometry on the globe.";
}

export function buildGeoInteractionStatus(params: {
	markerPlacementArmed: boolean;
	drawingMode: DrawingMode | null;
	lineStartSet: boolean;
	pendingPolygonPointsCount: number;
	selectedDrawingId: string | null;
	mapBody: "earth" | "moon";
}): GeoInteractionStatusItem[] {
	const {
		markerPlacementArmed,
		drawingMode,
		lineStartSet,
		pendingPolygonPointsCount,
		selectedDrawingId,
		mapBody,
	} = params;

	const items: GeoInteractionStatusItem[] = [
		{
			id: "body",
			label: mapBody === "earth" ? "Earth view" : "Moon view",
			tone: "neutral",
		},
	];

	if (markerPlacementArmed) {
		items.push({
			id: "marker",
			label: "Marker placement armed",
			tone: "active",
		});
	}

	if (drawingMode) {
		items.push({
			id: "mode",
			label: drawingMode === "cursor" ? "Cursor mode" : `Draw ${drawingMode}`,
			tone: drawingMode === "cursor" ? "neutral" : "active",
		});
	}

	if (lineStartSet) {
		items.push({
			id: "line-start",
			label: "Line start locked",
			tone: "warning",
		});
	}

	if (pendingPolygonPointsCount > 0) {
		items.push({
			id: "polygon-points",
			label: `Polygon points ${pendingPolygonPointsCount}`,
			tone: pendingPolygonPointsCount >= 3 ? "active" : "warning",
		});
	}

	if (selectedDrawingId) {
		items.push({
			id: "selection",
			label: "Drawing selected",
			tone: "active",
		});
	}

	return items;
}
