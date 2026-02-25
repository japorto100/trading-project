import { useCallback, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import type {
	DrawingHistoryCommand,
	GeoDrawingResponse,
} from "@/features/geopolitical/shell/types";
import { useGeoMapWorkspaceStore } from "@/features/geopolitical/store";
import type { GeoDrawing } from "@/lib/geopolitical/types";

interface UseGeopoliticalDrawingCommandsParams {
	fetchAll: () => Promise<void>;
}

export function useGeopoliticalDrawingCommands({ fetchAll }: UseGeopoliticalDrawingCommandsParams) {
	const { setBusy, setError, setCanUndoDrawings, setCanRedoDrawings } = useGeoMapWorkspaceStore(
		useShallow((state) => ({
			setBusy: state.setBusy,
			setError: state.setError,
			setCanUndoDrawings: state.setCanUndoDrawings,
			setCanRedoDrawings: state.setCanRedoDrawings,
		})),
	);

	const undoStackRef = useRef<DrawingHistoryCommand[]>([]);
	const redoStackRef = useRef<DrawingHistoryCommand[]>([]);

	const syncDrawingHistoryState = useCallback(() => {
		setCanUndoDrawings(undoStackRef.current.length > 0);
		setCanRedoDrawings(redoStackRef.current.length > 0);
	}, [setCanRedoDrawings, setCanUndoDrawings]);

	const createDrawingRecord = useCallback(
		async (payload: {
			type: "line" | "polygon" | "text";
			points: Array<{ lat: number; lng: number }>;
			color?: string;
			label?: string;
			eventId?: string;
		}): Promise<GeoDrawing> => {
			const response = await fetch("/api/geopolitical/drawings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
				throw new Error(errorPayload.error ?? `Drawing create failed (${response.status})`);
			}
			const parsed = (await response.json()) as GeoDrawingResponse;
			return parsed.drawing;
		},
		[],
	);

	const deleteDrawingById = useCallback(async (drawingId: string): Promise<void> => {
		const response = await fetch(`/api/geopolitical/drawings/${encodeURIComponent(drawingId)}`, {
			method: "DELETE",
		});
		if (!response.ok && response.status !== 404) {
			const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
			throw new Error(errorPayload.error ?? `Drawing delete failed (${response.status})`);
		}
	}, []);

	const executeDrawingCommand = useCallback(
		async (command: DrawingHistoryCommand): Promise<boolean> => {
			setBusy(true);
			setError(null);
			try {
				await command.redo();
				undoStackRef.current.push(command);
				redoStackRef.current = [];
				syncDrawingHistoryState();
				await fetchAll();
				return true;
			} catch (commandError) {
				setError(commandError instanceof Error ? commandError.message : "Drawing command failed");
				return false;
			} finally {
				setBusy(false);
			}
		},
		[fetchAll, setBusy, setError, syncDrawingHistoryState],
	);

	const undoDrawingCommand = useCallback(async () => {
		const command = undoStackRef.current.pop();
		if (!command) return;
		setBusy(true);
		setError(null);
		try {
			await command.undo();
			redoStackRef.current.push(command);
			syncDrawingHistoryState();
			await fetchAll();
		} catch (commandError) {
			undoStackRef.current.push(command);
			setError(commandError instanceof Error ? commandError.message : "Undo failed");
			syncDrawingHistoryState();
		} finally {
			setBusy(false);
		}
	}, [fetchAll, setBusy, setError, syncDrawingHistoryState]);

	const redoDrawingCommand = useCallback(async () => {
		const command = redoStackRef.current.pop();
		if (!command) return;
		setBusy(true);
		setError(null);
		try {
			await command.redo();
			undoStackRef.current.push(command);
			syncDrawingHistoryState();
			await fetchAll();
		} catch (commandError) {
			redoStackRef.current.push(command);
			setError(commandError instanceof Error ? commandError.message : "Redo failed");
			syncDrawingHistoryState();
		} finally {
			setBusy(false);
		}
	}, [fetchAll, setBusy, setError, syncDrawingHistoryState]);

	return {
		createDrawingRecord,
		deleteDrawingById,
		executeDrawingCommand,
		undoDrawingCommand,
		redoDrawingCommand,
	};
}
