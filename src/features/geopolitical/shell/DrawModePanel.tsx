import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DrawingMode } from "@/features/geopolitical/shell/types";

interface DrawModePanelProps {
	drawingMode: DrawingMode;
	drawingTextLabel: string;
	drawingColor: string;
	pendingPolygonPointsCount: number;
	lineStartSet: boolean;
	busy: boolean;
	selectedDrawingId: string | null;
	canUndoDrawings: boolean;
	canRedoDrawings: boolean;
	onModeChange: (mode: DrawingMode) => void;
	onTextLabelChange: (label: string) => void;
	onDrawingColorChange: (color: string) => void;
	onCompletePolygon: () => void;
	onClearPolygon: () => void;
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
	canUndoDrawings,
	canRedoDrawings,
	onModeChange,
	onTextLabelChange,
	onDrawingColorChange,
	onCompletePolygon,
	onClearPolygon,
	onDeleteSelectedDrawing,
	onUndo,
	onRedo,
}: DrawModePanelProps) {
	const availableModes: Array<Exclude<DrawingMode, "marker">> = ["line", "polygon", "text"];
	const swatches = ["#22d3ee", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#f8fafc"];

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
						{mode}
					</Button>
				))}
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
			{drawingMode === "text" && (
				<Input
					id="draw-mode-text-label"
					name="draw_mode_text_label"
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
