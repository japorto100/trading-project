export type IntelligenceCalendarImpactBand = "low" | "medium" | "high" | "critical";
export type IntelligenceCalendarSource = "local" | "fallback";
export type IntelligenceCalendarDegradationReason =
	| "NO_PROVIDER_DATA"
	| "STALE_DATA"
	| "MISSING_EXPECTED_RANGE"
	| "LOW_CONFIDENCE"
	| "SERVICE_DEGRADED"
	| "NO_LOCAL_EVENTS"
	| "INVALID_LOCAL_CALENDAR_SHAPE"
	| "LOCAL_CALENDAR_BUILD_FAILED";
export type IntelligenceCalendarSurpriseState =
	| "unknown"
	| "pending"
	| "in_range"
	| "above_range"
	| "below_range";

export interface IntelligenceCalendarExpectedRange {
	min?: number;
	consensus?: number;
	max?: number;
	previous?: number | string | null;
}

export interface IntelligenceCalendarPlaybookItem {
	scenario: string;
	bias: string;
	note?: string;
}

export interface IntelligenceCalendarEvent {
	eventId: string;
	updatedAt: string;
	title: string;
	region: string;
	category: "macro" | "central_bank" | "earnings" | "geopolitical" | "other";
	scheduledAt: string;
	expectedRange?: IntelligenceCalendarExpectedRange;
	actual?: number | string | null;
	surpriseState: IntelligenceCalendarSurpriseState;
	impactBand: IntelligenceCalendarImpactBand;
	affectedAssets: string[];
	playbook: IntelligenceCalendarPlaybookItem[];
	confidence: number;
	freshnessLabel: string;
	sources: Array<{ name: string; url: string }>;
	degradationReasons: IntelligenceCalendarDegradationReason[];
	targetHref: string;
}

export interface IntelligenceCalendarResponse {
	events: IntelligenceCalendarEvent[];
	degraded: boolean;
	degradedReasons: IntelligenceCalendarDegradationReason[];
	requestId: string;
	source: IntelligenceCalendarSource;
}
