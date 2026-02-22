export type GeoEventStatus = "candidate" | "confirmed" | "persistent" | "archived";
export type GeoSeverity = 1 | 2 | 3 | 4 | 5;
export type GeoConfidence = 0 | 1 | 2 | 3 | 4;

export interface GeoSourceRef {
	id: string;
	provider: string;
	url: string;
	title?: string;
	publishedAt?: string;
	fetchedAt: string;
	sourceTier: "A" | "B" | "C";
	reliability: number;
}

export interface GeoAssetLink {
	id: string;
	symbol: string;
	assetClass: "equity" | "etf" | "fx" | "commodity" | "crypto" | "index";
	relation: "beneficiary" | "exposed" | "hedge" | "uncertain";
	weight?: number;
	rationale?: string;
}

export interface GeoCoordinate {
	lat: number;
	lng: number;
}

export interface GeoDrawing {
	id: string;
	type: "line" | "polygon" | "text";
	label?: string;
	points: GeoCoordinate[];
	color?: string;
	eventId?: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface GeoEvent {
	id: string;
	title: string;
	category: string;
	subcategory?: string;
	status: GeoEventStatus;
	severity: GeoSeverity;
	confidence: GeoConfidence;
	countryCodes: string[];
	regionIds: string[];
	hotspotIds?: string[];
	coordinates?: GeoCoordinate[];
	summary?: string;
	analystNote?: string;
	sources: GeoSourceRef[];
	assets: GeoAssetLink[];
	createdAt: string;
	updatedAt: string;
	validFrom?: string;
	validTo?: string;
	createdBy: string;
	updatedBy: string;
	symbol: string;
	externalSource?: string;
	externalRegion?: string;
	externalEventType?: string;
	externalSubEventType?: string;
	externalFatalities?: number;
}

export interface GeoEventsStoreFile {
	events: GeoEvent[];
}

export interface GeoCandidate {
	id: string;
	generatedAt: string;
	triggerType: "hard_signal" | "news_cluster" | "manual_import";
	confidence: number;
	severityHint: GeoSeverity;
	headline: string;
	regionHint?: string;
	countryHints?: string[];
	sourceRefs: GeoSourceRef[];
	mergedIntoEventId?: string;
	state: "open" | "accepted" | "rejected" | "snoozed" | "expired";
	reviewNote?: string;
	symbol?: string;
	category?: string;
	hotspotIds?: string[];
}

export interface GeoCandidatesStoreFile {
	candidates: GeoCandidate[];
}

export interface GeoTimelineEntry {
	id: string;
	eventId: string;
	action:
		| "created"
		| "status_changed"
		| "severity_changed"
		| "confidence_changed"
		| "geometry_changed"
		| "sources_updated"
		| "assets_updated"
		| "note_updated"
		| "candidate_accepted"
		| "candidate_rejected"
		| "candidate_snoozed"
		| "archived";
	actor: string;
	at: string;
	diffSummary: string;
}

export interface GeoTimelineStoreFile {
	timeline: GeoTimelineEntry[];
}

export interface GeoRegion {
	id: string;
	label: string;
	countryCodes: string[];
}

export interface GeoRegionsStoreFile {
	regions: GeoRegion[];
}

export interface GeoDrawingsStoreFile {
	drawings: GeoDrawing[];
}
