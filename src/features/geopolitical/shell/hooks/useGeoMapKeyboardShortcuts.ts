import { useEffect } from "react";
import {
	type GeoKeyboardShortcutParams,
	handleGeoKeyboardShortcutEvent,
} from "@/features/geopolitical/shell/hooks/geo-keyboard-shortcuts";

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
}: GeoKeyboardShortcutParams) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) =>
			handleGeoKeyboardShortcutEvent(event, {
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
			});

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
