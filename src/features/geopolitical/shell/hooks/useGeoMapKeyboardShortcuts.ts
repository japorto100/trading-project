import { useEffect } from "react";
import type { DrawingMode } from "@/features/geopolitical/shell/types";

type AsyncOrVoid = () => void | Promise<void>;
type StateUpdater<T> = T | ((previous: T) => T);

interface UseGeoMapKeyboardShortcutsParams {
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

export function useGeoMapKeyboardShortcuts({
	deleteMarker,
	deleteSelectedDrawing,
	redoDrawingCommand,
	undoDrawingCommand,
	selectedDrawingId,
	selectedEventId,
	setDrawingMode,
	setShowCandidateQueue,
	setShowRegionLayer,
	setShowHeatmap,
	setShowSoftSignals,
}: UseGeoMapKeyboardShortcutsParams) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const tagName = target?.tagName?.toLowerCase();
			const isEditable =
				target?.isContentEditable ||
				tagName === "input" ||
				tagName === "textarea" ||
				tagName === "select";
			if (isEditable) {
				return;
			}

			const key = event.key.toLowerCase();
			const withModifier = event.ctrlKey || event.metaKey;
			if (withModifier && key === "z") {
				event.preventDefault();
				if (event.shiftKey) {
					void redoDrawingCommand();
				} else {
					void undoDrawingCommand();
				}
				return;
			}
			if (withModifier && key === "y") {
				event.preventDefault();
				void redoDrawingCommand();
				return;
			}

			if (key === "m") setDrawingMode("marker");
			if (key === "l") setDrawingMode("line");
			if (key === "p") setDrawingMode("polygon");
			if (key === "t") setDrawingMode("text");
			if (key === "c") setShowCandidateQueue((previous) => !previous);
			if (key === "r") setShowRegionLayer((previous) => !previous);
			if (key === "h") setShowHeatmap((previous) => !previous);
			if (key === "s") setShowSoftSignals((previous) => !previous);

			if (event.key === "Delete") {
				if (selectedDrawingId) {
					void deleteSelectedDrawing();
				} else if (selectedEventId) {
					void deleteMarker();
				}
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [
		deleteMarker,
		deleteSelectedDrawing,
		redoDrawingCommand,
		selectedDrawingId,
		selectedEventId,
		setDrawingMode,
		setShowCandidateQueue,
		setShowHeatmap,
		setShowRegionLayer,
		setShowSoftSignals,
		undoDrawingCommand,
	]);
}
