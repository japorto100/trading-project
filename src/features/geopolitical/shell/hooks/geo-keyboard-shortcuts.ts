import type { DrawingMode } from "@/features/geopolitical/shell/types";

type AsyncOrVoid = () => void | Promise<void>;
type StateUpdater<T> = T | ((previous: T) => T);

export interface GeoKeyboardShortcutParams {
	deleteMarker: AsyncOrVoid;
	deleteSelectedDrawing: AsyncOrVoid;
	redoDrawingCommand: AsyncOrVoid;
	undoDrawingCommand: AsyncOrVoid;
	selectedDrawingId: string | null;
	selectedEventId: string | null;
	setDrawingMode: (next: DrawingMode) => void;
	setShowCandidateQueue: (next: StateUpdater<boolean>) => void;
	setShowRegionLayer: (next: StateUpdater<boolean>) => void;
	setShowHeatmap: (next: StateUpdater<boolean>) => void;
	setShowSoftSignals: (next: StateUpdater<boolean>) => void;
}

export function shouldIgnoreGeoShortcutTarget(target: EventTarget | null): boolean {
	const element = target as { tagName?: string; isContentEditable?: boolean } | null;
	const tagName = element?.tagName?.toLowerCase();
	return Boolean(
		element?.isContentEditable ||
			tagName === "input" ||
			tagName === "textarea" ||
			tagName === "select",
	);
}

export function handleGeoKeyboardShortcutEvent(
	event: KeyboardEvent,
	params: GeoKeyboardShortcutParams,
): void {
	if (shouldIgnoreGeoShortcutTarget(event.target)) {
		return;
	}

	const key = event.key.toLowerCase();
	const withModifier = event.ctrlKey || event.metaKey;
	if (withModifier && key === "z") {
		event.preventDefault();
		if (event.shiftKey) {
			void params.redoDrawingCommand();
		} else {
			void params.undoDrawingCommand();
		}
		return;
	}
	if (withModifier && key === "y") {
		event.preventDefault();
		void params.redoDrawingCommand();
		return;
	}
	if (event.key === "Escape") {
		params.setDrawingMode("cursor");
		return;
	}

	if (key === "m") params.setDrawingMode("marker");
	if (key === "l") params.setDrawingMode("line");
	if (key === "p") params.setDrawingMode("polygon");
	if (key === "t") params.setDrawingMode("text");
	if (key === "c") params.setShowCandidateQueue((previous) => !previous);
	if (key === "r") params.setShowRegionLayer((previous) => !previous);
	if (key === "h") params.setShowHeatmap((previous) => !previous);
	if (key === "s") params.setShowSoftSignals((previous) => !previous);

	if (event.key === "Delete") {
		if (params.selectedDrawingId) {
			void params.deleteSelectedDrawing();
		} else if (params.selectedEventId) {
			void params.deleteMarker();
		}
	}
}
