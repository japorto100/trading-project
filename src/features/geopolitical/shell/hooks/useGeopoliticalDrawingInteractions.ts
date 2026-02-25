import { useCallback } from "react";
import type { DrawingMode } from "@/features/geopolitical/shell/types";
import { getGeoCatalogEntry } from "@/lib/geopolitical/catalog";
import type {
	GeoConfidence,
	GeoCoordinate,
	GeoDrawing,
	GeoSeverity,
} from "@/lib/geopolitical/types";

type StateSetter<T> = (next: T | ((previous: T) => T)) => void;

interface UseGeopoliticalDrawingInteractionsParams {
	drawings: GeoDrawing[];
	drawingMode: DrawingMode;
	drawingTextLabel: string;
	pendingLineStart: GeoCoordinate | null;
	pendingPolygonPoints: GeoCoordinate[];
	selectedDrawingId: string | null;
	pendingPoint: GeoCoordinate | null;
	draftTitle: string;
	selectedSymbol: string;
	eventsEditable: boolean;
	externalSourceLabel: string;
	createDrawingRecord: (payload: {
		type: "line" | "polygon" | "text";
		points: GeoCoordinate[];
		color?: string;
		label?: string;
		eventId?: string;
	}) => Promise<GeoDrawing>;
	deleteDrawingById: (drawingId: string) => Promise<void>;
	executeDrawingCommand: (command: {
		label: string;
		undo: () => Promise<void>;
		redo: () => Promise<void>;
	}) => Promise<boolean>;
	setSelectedDrawingId: StateSetter<string | null>;
	setSelectedEventId: (next: string | null) => void;
	setPendingLineStart: (next: GeoCoordinate | null) => void;
	setPendingPolygonPoints: StateSetter<GeoCoordinate[]>;
	setPendingPoint: (next: GeoCoordinate | null) => void;
	setDraftTitle: (next: string) => void;
	setDraftSummary: (next: string) => void;
	setDraftNote: (next: string) => void;
	setDraftSeverity: (next: GeoSeverity) => void;
	setDraftConfidence: (next: GeoConfidence) => void;
	setError: (next: string | null) => void;
}

export function useGeopoliticalDrawingInteractions({
	drawings,
	drawingMode,
	drawingTextLabel,
	pendingLineStart,
	pendingPolygonPoints,
	selectedDrawingId,
	draftTitle,
	selectedSymbol,
	eventsEditable,
	externalSourceLabel,
	createDrawingRecord,
	deleteDrawingById,
	executeDrawingCommand,
	setSelectedDrawingId,
	setSelectedEventId,
	setPendingLineStart,
	setPendingPolygonPoints,
	setPendingPoint,
	setDraftTitle,
	setDraftSummary,
	setDraftNote,
	setDraftSeverity,
	setDraftConfidence,
	setError,
}: UseGeopoliticalDrawingInteractionsParams) {
	const handleMapClick = useCallback(
		async (coords: GeoCoordinate) => {
			if (drawingMode === "line") {
				if (!pendingLineStart) {
					setPendingLineStart(coords);
					return;
				}
				const payload = {
					type: "line" as const,
					points: [pendingLineStart, coords],
					color: "#22d3ee",
					label: "Line",
				};
				let currentId: string | null = null;
				const succeeded = await executeDrawingCommand({
					label: "create line",
					redo: async () => {
						const drawing = await createDrawingRecord(payload);
						currentId = drawing.id;
						setSelectedDrawingId(drawing.id);
					},
					undo: async () => {
						if (!currentId) return;
						await deleteDrawingById(currentId);
						setSelectedDrawingId((previous) => (previous === currentId ? null : previous));
					},
				});
				if (succeeded) {
					setPendingLineStart(null);
				}
				return;
			}

			if (drawingMode === "polygon") {
				setPendingPolygonPoints((previous) => [...previous, coords]);
				return;
			}

			if (drawingMode === "text") {
				const payload = {
					type: "text" as const,
					points: [coords],
					label: drawingTextLabel || "Text",
					color: "#f8fafc",
				};
				let currentId: string | null = null;
				await executeDrawingCommand({
					label: "create text",
					redo: async () => {
						const drawing = await createDrawingRecord(payload);
						currentId = drawing.id;
						setSelectedDrawingId(drawing.id);
					},
					undo: async () => {
						if (!currentId) return;
						await deleteDrawingById(currentId);
						setSelectedDrawingId((previous) => (previous === currentId ? null : previous));
					},
				});
				return;
			}

			setSelectedEventId(null);
			if (!eventsEditable) {
				setError(
					`${externalSourceLabel} mode is read-only. Switch source to Local to place markers.`,
				);
				return;
			}
			setPendingPoint(coords);
			if (!draftTitle.trim()) {
				const defaultLabel = getGeoCatalogEntry(selectedSymbol)?.label ?? "New event";
				setDraftTitle(`${defaultLabel} marker`);
			}
		},
		[
			createDrawingRecord,
			deleteDrawingById,
			draftTitle,
			drawingMode,
			drawingTextLabel,
			eventsEditable,
			executeDrawingCommand,
			externalSourceLabel,
			pendingLineStart,
			selectedSymbol,
			setDraftTitle,
			setError,
			setPendingLineStart,
			setPendingPoint,
			setPendingPolygonPoints,
			setSelectedDrawingId,
			setSelectedEventId,
		],
	);

	const completePolygonDrawing = useCallback(async () => {
		if (pendingPolygonPoints.length < 3) {
			setError("Polygon requires at least 3 points.");
			return;
		}
		const payload = {
			type: "polygon" as const,
			points: pendingPolygonPoints,
			color: "#f59e0b",
			label: "Polygon",
		};
		let currentId: string | null = null;
		const succeeded = await executeDrawingCommand({
			label: "create polygon",
			redo: async () => {
				const drawing = await createDrawingRecord(payload);
				currentId = drawing.id;
				setSelectedDrawingId(drawing.id);
			},
			undo: async () => {
				if (!currentId) return;
				await deleteDrawingById(currentId);
				setSelectedDrawingId((previous) => (previous === currentId ? null : previous));
			},
		});
		if (succeeded) {
			setPendingPolygonPoints([]);
		}
	}, [
		createDrawingRecord,
		deleteDrawingById,
		executeDrawingCommand,
		pendingPolygonPoints,
		setError,
		setPendingPolygonPoints,
		setSelectedDrawingId,
	]);

	const resetCreateForm = useCallback(() => {
		setPendingPoint(null);
		setDraftTitle("");
		setDraftSummary("");
		setDraftNote("");
		setDraftSeverity(2);
		setDraftConfidence(2);
	}, [
		setDraftConfidence,
		setDraftNote,
		setDraftSeverity,
		setDraftSummary,
		setDraftTitle,
		setPendingPoint,
	]);

	const deleteSelectedDrawing = useCallback(async () => {
		if (!selectedDrawingId) return;
		const drawing = drawings.find((entry) => entry.id === selectedDrawingId);
		if (!drawing) {
			setSelectedDrawingId(null);
			return;
		}

		const restorePayload = {
			type: drawing.type,
			points: drawing.points,
			label: drawing.label,
			color: drawing.color,
			eventId: drawing.eventId,
		};
		let activeDeletedId = drawing.id;

		await executeDrawingCommand({
			label: "delete drawing",
			redo: async () => {
				await deleteDrawingById(activeDeletedId);
				setSelectedDrawingId((previous) => (previous === activeDeletedId ? null : previous));
			},
			undo: async () => {
				const restored = await createDrawingRecord(restorePayload);
				activeDeletedId = restored.id;
				setSelectedDrawingId(restored.id);
			},
		});
	}, [
		createDrawingRecord,
		deleteDrawingById,
		drawings,
		executeDrawingCommand,
		selectedDrawingId,
		setSelectedDrawingId,
	]);

	return {
		handleMapClick,
		completePolygonDrawing,
		resetCreateForm,
		deleteSelectedDrawing,
	};
}
