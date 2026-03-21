import { describe, expect, it, mock } from "bun:test";
import type { DrawingMode } from "@/features/geopolitical/drawing/types";
import {
	type GeoKeyboardShortcutParams,
	handleGeoKeyboardShortcutEvent,
	shouldIgnoreGeoShortcutTarget,
} from "@/features/geopolitical/shell/hooks/geo-keyboard-shortcuts";

function createParams(
	overrides: Partial<GeoKeyboardShortcutParams> = {},
): GeoKeyboardShortcutParams {
	return {
		deleteMarker: mock(),
		deleteSelectedDrawing: mock(),
		redoDrawingCommand: mock(),
		undoDrawingCommand: mock(),
		selectedDrawingId: null,
		selectedEventId: null,
		setDrawingMode: mock((_next: DrawingMode) => {}),
		setShowCandidateQueue: mock(),
		setShowRegionLayer: mock(),
		setShowHeatmap: mock(),
		setShowSoftSignals: mock(),
		...overrides,
	};
}

function createKeyboardEvent(
	key: string,
	init: Partial<{
		ctrlKey: boolean;
		metaKey: boolean;
		shiftKey: boolean;
		target: EventTarget | null;
	}> = {},
): KeyboardEvent {
	return {
		key,
		ctrlKey: init.ctrlKey ?? false,
		metaKey: init.metaKey ?? false,
		shiftKey: init.shiftKey ?? false,
		target: init.target ?? null,
		preventDefault: mock(),
	} as unknown as KeyboardEvent;
}

describe("geo keyboard shortcuts", () => {
	it("ignores editable targets", () => {
		const input = { tagName: "INPUT", isContentEditable: false } as EventTarget;
		const params = createParams();
		const event = createKeyboardEvent("m", { target: input });

		handleGeoKeyboardShortcutEvent(event, params);

		expect(shouldIgnoreGeoShortcutTarget(input)).toBe(true);
		expect(params.setDrawingMode).not.toHaveBeenCalled();
	});

	it("routes undo and redo shortcuts through drawing commands", () => {
		const params = createParams();
		const undoEvent = createKeyboardEvent("z", { ctrlKey: true });
		const redoEvent = createKeyboardEvent("z", { ctrlKey: true, shiftKey: true });

		handleGeoKeyboardShortcutEvent(undoEvent, params);
		handleGeoKeyboardShortcutEvent(redoEvent, params);

		expect(params.undoDrawingCommand).toHaveBeenCalledTimes(1);
		expect(params.redoDrawingCommand).toHaveBeenCalledTimes(1);
	});

	it("prefers selected drawing over event on delete", () => {
		const params = createParams({
			selectedDrawingId: "drawing-1",
			selectedEventId: "event-1",
		});
		const event = createKeyboardEvent("Delete");

		handleGeoKeyboardShortcutEvent(event, params);

		expect(params.deleteSelectedDrawing).toHaveBeenCalledTimes(1);
		expect(params.deleteMarker).not.toHaveBeenCalled();
	});

	it("switches drawing mode and toggles overlays in non-editable contexts", () => {
		const params = createParams();

		handleGeoKeyboardShortcutEvent(createKeyboardEvent("Escape"), params);
		handleGeoKeyboardShortcutEvent(createKeyboardEvent("m"), params);
		handleGeoKeyboardShortcutEvent(createKeyboardEvent("c"), params);

		expect(params.setDrawingMode).toHaveBeenNthCalledWith(1, "cursor");
		expect(params.setDrawingMode).toHaveBeenNthCalledWith(2, "marker");
		expect(params.setShowCandidateQueue).toHaveBeenCalledTimes(1);
	});
});
