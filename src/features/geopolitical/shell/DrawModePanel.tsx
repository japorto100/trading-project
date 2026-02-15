import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DrawingMode } from "@/features/geopolitical/shell/types";

interface DrawModePanelProps {
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

export function DrawModePanel({
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
}: DrawModePanelProps) {
	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Draw mode
			</h3>
			<div className="mt-2 grid grid-cols-2 gap-2">
				{(["marker", "line", "polygon", "text"] as DrawingMode[]).map((mode) => (
					<Button
						key={mode}
						size="sm"
						variant={drawingMode === mode ? "secondary" : "outline"}
						onClick={() => onModeChange(mode)}
						aria-pressed={drawingMode === mode}
						aria-label={`Switch draw mode to ${mode}`}
					>
						{mode}
					</Button>
				))}
			</div>
			{drawingMode === "text" && (
				<Input
					className="mt-2"
					value={drawingTextLabel}
					onChange={(event) => onTextLabelChange(event.target.value)}
					placeholder="Text label"
					aria-label="Text label for drawing mode"
				/>
			)}
			{drawingMode === "polygon" && (
				<div className="mt-2 space-y-2">
					<p className="text-xs text-muted-foreground">Points: {pendingPolygonPointsCount}</p>
					<div className="flex gap-2">
						<Button
							size="sm"
							onClick={onCompletePolygon}
							disabled={busy || pendingPolygonPointsCount < 3}
							aria-label="Complete polygon drawing"
						>
							Complete
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={onClearPolygon}
							disabled={busy}
							aria-label="Clear polygon points"
						>
							Clear
						</Button>
					</div>
				</div>
			)}
			{drawingMode === "line" && lineStartSet && (
				<p className="mt-2 text-xs text-muted-foreground">Line start set. Click second point.</p>
			)}
			<Button
				className="mt-2 w-full"
				size="sm"
				variant="outline"
				disabled={busy || !selectedDrawingId}
				onClick={onDeleteSelectedDrawing}
				aria-label="Delete selected drawing"
			>
				Delete selected drawing
			</Button>
			<div className="mt-2 grid grid-cols-2 gap-2">
				<Button
					size="sm"
					variant="outline"
					disabled={busy || !canUndoDrawings}
					onClick={onUndo}
					aria-label="Undo last drawing change"
				>
					Undo
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={busy || !canRedoDrawings}
					onClick={onRedo}
					aria-label="Redo last drawing change"
				>
					Redo
				</Button>
			</div>
		</section>
	);
}
