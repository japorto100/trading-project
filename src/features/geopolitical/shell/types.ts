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
	source?: "local" | "acled" | "gdelt";
	meta?: {
		source: "acled" | "gdelt";
		page: number;
		pageSize: number;
		total: number;
		hasMore: boolean;
		filters: {
			country?: string;
			region?: string;
			eventType?: string;
			subEventType?: string;
			from?: string;
			to?: string;
		};
	};
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

export interface GeoGraphResponse {
	success: boolean;
	source: "local" | "acled" | "gdelt";
	nodeCount: number;
	edgeCount: number;
	nodes: Array<{
		id: string;
		label: string;
		type: "event" | "region" | "event_type" | "sub_event_type" | "asset";
		weight: number;
	}>;
	edges: Array<{
		id: string;
		source: string;
		target: string;
		type: "event-region" | "event-type" | "event-subevent" | "event-asset";
		weight: number;
	}>;
	topRegions: string[];
	topSubEventTypes: string[];
}

export interface GeoContextItem {
	id: string;
	source: string;
	title: string;
	url: string;
	summary?: string;
	publishedAt?: string;
	region?: string;
}

export interface GeoContextResponse {
	success: boolean;
	source: "all" | "cfr" | "crisiswatch";
	filters?: {
		source: "all" | "cfr" | "crisiswatch";
		q?: string;
		region?: string;
		limit: number;
	};
	items: GeoContextItem[];
}

export interface GeoGameTheoryItem {
	id: string;
	eventId: string;
	eventTitle: string;
	region: string;
	marketBias: "risk_on" | "risk_off" | "neutral";
	impactScore: number;
	confidence: number;
	drivers: string[];
	symbols: string[];
	eventDate: string;
}

export interface GeoGameTheorySummary {
	analyzedEvents: number;
	avgImpactScore: number;
	riskOnCount: number;
	riskOffCount: number;
	neutralCount: number;
	topRegion?: string;
}

export interface GeoGameTheoryResponse {
	success: boolean;
	source?: string;
	filters?: {
		country?: string;
		region?: string;
		eventType?: string;
		subEventType?: string;
		from?: string;
		to?: string;
		limit: number;
	};
	summary?: GeoGameTheorySummary;
	items: GeoGameTheoryItem[];
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
