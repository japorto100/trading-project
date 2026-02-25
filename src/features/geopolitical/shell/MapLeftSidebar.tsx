import { SymbolToolbar } from "@/features/geopolitical/SymbolToolbar";
import { DrawModePanel } from "@/features/geopolitical/shell/DrawModePanel";
import type { DrawingMode } from "@/features/geopolitical/shell/types";

interface MapLeftSidebarProps {
	selectedSymbol: string;
	onSelectSymbol: (symbol: string) => void;
	drawingMode: DrawingMode;
	drawingTextLabel: string;
	pendingPolygonPointsCount: number;
	lineStartSet: boolean;
	busy: boolean;
	selectedDrawingId: string | null;
	canUndoDrawings: boolean;
	canRedoDrawings: boolean;
	onModeChange: (mode: DrawingMode) => void;
	onTextLabelChange: (label: string) => void;
	onCompletePolygon: () => void;
	onClearPolygon: () => void;
	onDeleteSelectedDrawing: () => void;
	onUndo: () => void;
	onRedo: () => void;
}

export function MapLeftSidebar({
	selectedSymbol,
	onSelectSymbol,
	drawingMode,
	drawingTextLabel,
	pendingPolygonPointsCount,
	lineStartSet,
	busy,
	selectedDrawingId,
	canUndoDrawings,
	canRedoDrawings,
	onModeChange,
	onTextLabelChange,
	onCompletePolygon,
	onClearPolygon,
	onDeleteSelectedDrawing,
	onUndo,
	onRedo,
}: MapLeftSidebarProps) {
	return (
		<aside className="w-72 shrink-0 overflow-y-auto border-r border-border p-3 space-y-3">
			<SymbolToolbar selectedSymbol={selectedSymbol} onSelectSymbol={onSelectSymbol} />

			<DrawModePanel
				drawingMode={drawingMode}
				drawingTextLabel={drawingTextLabel}
				pendingPolygonPointsCount={pendingPolygonPointsCount}
				lineStartSet={lineStartSet}
				busy={busy}
				selectedDrawingId={selectedDrawingId}
				canUndoDrawings={canUndoDrawings}
				canRedoDrawings={canRedoDrawings}
				onModeChange={onModeChange}
				onTextLabelChange={onTextLabelChange}
				onCompletePolygon={onCompletePolygon}
				onClearPolygon={onClearPolygon}
				onDeleteSelectedDrawing={onDeleteSelectedDrawing}
				onUndo={onUndo}
				onRedo={onRedo}
			/>
		</aside>
	);
}
