import type {
	GeoCandidate,
	GeoConfidence,
	GeoDrawing,
	GeoEvent,
	GeoEventStatus,
	GeoRegion,
	GeoSeverity,
	GeoTimelineEntry,
} from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

export interface GeoEventsResponse {
	success: boolean;
	events: GeoEvent[];
}

export interface GeoEventResponse {
	success: boolean;
	event: GeoEvent;
}

export interface GeoCandidatesResponse {
	success: boolean;
	candidates: GeoCandidate[];
}

export interface GeoTimelineResponse {
	success: boolean;
	timeline: GeoTimelineEntry[];
}

export interface GeoRegionsResponse {
	success: boolean;
	regions: GeoRegion[];
}

export interface GeoDrawingsResponse {
	success: boolean;
	drawings: GeoDrawing[];
}

export interface GeoDrawingResponse {
	success: boolean;
	drawing: GeoDrawing;
}

export interface SourceHealthResponse {
	success: boolean;
	entries: Array<{
		id: string;
		label: string;
		tier: "A" | "B" | "C";
		type: "hard_signal" | "soft_signal" | "news";
		ok: boolean;
		enabled: boolean;
		message?: string;
	}>;
}

export interface GeoNewsResponse {
	success: boolean;
	region: GeoRegion | null;
	total: number;
	articles: MarketNewsArticle[];
	candidateCount: number;
}

export interface EditFormState {
	title: string;
	severity: GeoSeverity;
	confidence: GeoConfidence;
	status: GeoEventStatus;
	summary: string;
	analystNote: string;
}

export const DEFAULT_EDIT_FORM: EditFormState = {
	title: "",
	severity: 2,
	confidence: 2,
	status: "confirmed",
	summary: "",
	analystNote: "",
};

export type DrawingMode = "marker" | "line" | "polygon" | "text";

export interface DrawingHistoryCommand {
	label: string;
	undo: () => Promise<void>;
	redo: () => Promise<void>;
}

export function formatPoint(event: GeoEvent): string {
	const point = event.coordinates?.[0];
	if (!point) return "n/a";
	return `${point.lat.toFixed(2)}, ${point.lng.toFixed(2)}`;
}
