import { describe, expect, it } from "bun:test";
import {
	buildDrawingWorkflowHint,
	buildGeoInteractionStatus,
	parseLatitudeInput,
	parseLongitudeInput,
} from "@/features/geopolitical/drawing-workflow";

describe("drawing workflow helpers", () => {
	it("validates manual latitude and longitude input", () => {
		expect(parseLatitudeInput("47.3769")).toEqual({ value: 47.3769, error: null });
		expect(parseLongitudeInput("8.5417")).toEqual({ value: 8.5417, error: null });
		expect(parseLatitudeInput("100").error).toContain("between -90 and 90");
		expect(parseLongitudeInput("x").error).toContain("valid number");
	});

	it("builds actionable hints for the active drawing mode", () => {
		expect(
			buildDrawingWorkflowHint({
				drawingMode: "cursor",
				lineStartSet: false,
				pendingPolygonPointsCount: 0,
				selectedDrawingId: null,
				canUndoDrawings: false,
				canRedoDrawings: false,
			}),
		).toContain("normal globe navigation");

		expect(
			buildDrawingWorkflowHint({
				drawingMode: "line",
				lineStartSet: false,
				pendingPolygonPointsCount: 0,
				selectedDrawingId: null,
				canUndoDrawings: false,
				canRedoDrawings: false,
			}),
		).toContain("line start");

		expect(
			buildDrawingWorkflowHint({
				drawingMode: "polygon",
				lineStartSet: false,
				pendingPolygonPointsCount: 3,
				selectedDrawingId: null,
				canUndoDrawings: false,
				canRedoDrawings: false,
			}),
		).toContain("Complete it now");
	});

	it("builds interaction status chips for current map workflow state", () => {
		expect(
			buildGeoInteractionStatus({
				markerPlacementArmed: true,
				drawingMode: "polygon",
				lineStartSet: false,
				pendingPolygonPointsCount: 2,
				selectedDrawingId: "drawing-1",
				mapBody: "earth",
			}),
		).toEqual([
			{ id: "body", label: "Earth view", tone: "neutral" },
			{ id: "marker", label: "Marker placement armed", tone: "active" },
			{ id: "mode", label: "Draw polygon", tone: "active" },
			{ id: "polygon-points", label: "Polygon points 2", tone: "warning" },
			{ id: "selection", label: "Drawing selected", tone: "active" },
		]);
	});
});
