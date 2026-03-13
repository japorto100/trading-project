import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildDrawingWorkflowHint } from "@/features/geopolitical/drawing-workflow";
import type { DrawingMode } from "@/features/geopolitical/shell/types";

interface DrawModePanelProps {
	drawingMode: DrawingMode;
	drawingTextLabel: string;
	drawingColor: string;
	pendingPolygonPointsCount: number;
	lineStartSet: boolean;
	busy: boolean;
	selectedDrawingId: string | null;
	canOpenSelectedDrawingInFlatView: boolean;
	canUndoDrawings: boolean;
	canRedoDrawings: boolean;
	onModeChange: (mode: DrawingMode) => void;
	onTextLabelChange: (label: string) => void;
	onDrawingColorChange: (color: string) => void;
	onCompletePolygon: () => void;
	onClearPolygon: () => void;
	onOpenSelectedDrawingInFlatView: () => void;
	onDeleteSelectedDrawing: () => void;
	onUndo: () => void;
	onRedo: () => void;
}

export function DrawModePanel({
	drawingMode,
	drawingTextLabel,
	drawingColor,
	pendingPolygonPointsCount,
	lineStartSet,
	busy,
	selectedDrawingId,
	canOpenSelectedDrawingInFlatView,
	canUndoDrawings,
	canRedoDrawings,
	onModeChange,
	onTextLabelChange,
	onDrawingColorChange,
	onCompletePolygon,
	onClearPolygon,
	onOpenSelectedDrawingInFlatView,
	onDeleteSelectedDrawing,
	onUndo,
	onRedo,
}: DrawModePanelProps) {
	const availableModes: Array<Exclude<DrawingMode, "marker">> = [
		"cursor",
		"line",
		"polygon",
		"text",
	];
	const swatches = ["#22d3ee", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#f8fafc"];
	const shortcutLegend = [
		{ label: "Cursor", keys: "Esc" },
		{ label: "Marker", keys: "M" },
		{ label: "Line", keys: "L" },
		{ label: "Polygon", keys: "P" },
		{ label: "Text", keys: "T" },
		{ label: "Delete", keys: "Del" },
		{ label: "Undo", keys: "Ctrl+Z" },
		{ label: "Redo", keys: "Ctrl+Shift+Z / Ctrl+Y" },
		{ label: "Candidates", keys: "C" },
		{ label: "Regions", keys: "R" },
		{ label: "Heatmap", keys: "H" },
		{ label: "Soft signals", keys: "S" },
	] as const;
	const workflowHint = buildDrawingWorkflowHint({
		drawingMode,
		lineStartSet,
		pendingPolygonPointsCount,
		selectedDrawingId,
		canUndoDrawings,
		canRedoDrawings,
	});

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Draw mode
			</h3>
			<div className="mt-2 grid grid-cols-2 gap-2">
				{availableModes.map((mode) => (
					<Button
						key={mode}
						size="sm"
						variant={drawingMode === mode ? "secondary" : "outline"}
						onClick={() => onModeChange(mode)}
						aria-pressed={drawingMode === mode}
						aria-label={`Switch draw mode to ${mode}`}
					>
						<span className="truncate">{mode}</span>
						<span className="ml-2 rounded border border-border/70 px-1 py-0 text-[10px] text-muted-foreground">
							{mode === "cursor" ? "Esc" : mode === "line" ? "L" : mode === "polygon" ? "P" : "T"}
						</span>
					</Button>
				))}
			</div>
			<div className="mt-2 rounded-md border border-border bg-background/70 px-2 py-2 text-[11px] text-muted-foreground">
				{workflowHint}
			</div>
			<div className="mt-2 space-y-2">
				<p className="text-xs text-muted-foreground">Drawing color</p>
				<div className="grid grid-cols-6 gap-1">
					{swatches.map((swatch) => (
						<button
							key={swatch}
							type="button"
							className={`h-6 w-6 rounded border ${drawingColor === swatch ? "border-foreground" : "border-border"}`}
							style={{ backgroundColor: swatch }}
							onClick={() => onDrawingColorChange(swatch)}
							aria-label={`Select drawing color ${swatch}`}
							title={swatch}
						/>
					))}
				</div>
				<div className="flex items-center gap-2">
					<input
						id="draw-mode-color-picker"
						name="draw_mode_color_picker"
						type="color"
						value={drawingColor}
						onChange={(event) => onDrawingColorChange(event.target.value)}
						className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent p-1"
						aria-label="Pick drawing color"
					/>
					<Input
						id="draw-mode-color-hex"
						name="draw_mode_color_hex"
						value={drawingColor}
						onChange={(event) => onDrawingColorChange(event.target.value)}
						placeholder="#22d3ee"
						aria-label="Custom drawing color (hex)"
					/>
				</div>
			</div>
			{drawingMode === "text" ? (
				<Input
					id="draw-mode-text-label"
					name="draw_mode_text_label"
					className="mt-2"
					value={drawingTextLabel}
					onChange={(event) => onTextLabelChange(event.target.value)}
					placeholder="Text label"
					aria-label="Text label for drawing mode"
				/>
			) : null}
			{drawingMode === "polygon" ? (
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
			) : null}
			{drawingMode === "line" && lineStartSet ? (
				<p className="mt-2 text-xs text-muted-foreground">Line start set. Click second point.</p>
			) : null}
			<div className="mt-2 grid grid-cols-1 gap-2">
				<Button
					size="sm"
					variant="outline"
					disabled={!canOpenSelectedDrawingInFlatView}
					onClick={onOpenSelectedDrawingInFlatView}
					aria-label="Open selected drawing in flat view"
				>
					Open selected area in flat view
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={busy || !selectedDrawingId}
					onClick={onDeleteSelectedDrawing}
					aria-label="Delete selected drawing"
				>
					Delete selected drawing
				</Button>
			</div>
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
			<div className="mt-3 rounded-md border border-border/70 bg-background/60 p-2">
				<div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
					Keyboard shortcuts
				</div>
				<div className="grid grid-cols-1 gap-1 text-[11px] text-muted-foreground">
					{shortcutLegend.map((entry) => (
						<div key={entry.label} className="flex items-center justify-between gap-3">
							<span>{entry.label}</span>
							<kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground">
								{entry.keys}
							</kbd>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
