import type { GeoDrawing } from "@/lib/geopolitical/types";

export type DrawingMode = "cursor" | "marker" | "line" | "polygon" | "text";

export interface DrawingHistoryCommand {
	label: string;
	undo: () => Promise<void>;
	redo: () => Promise<void>;
}

export interface GeoDrawingResponse {
	success: boolean;
	drawing: GeoDrawing;
}
