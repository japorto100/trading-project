export type ResearchMatterType = "event" | "headline" | "narrative";

export interface ResearchMatter {
	id: string;
	type: ResearchMatterType;
	title: string;
	score: number;
	confidence: number;
	reason: string;
	freshnessLabel: string;
	targetHref: string;
}

export interface ResearchEventLaneItem {
	id: string;
	title: string;
	scheduledAt: string;
	region: string;
	impactBand: "low" | "medium" | "high" | "critical";
	confidence: number;
	playbookHint: string;
	targetHref: string;
}

export interface ResearchNarrativeLaneItem {
	id: string;
	title: string;
	kind: "actor" | "narrative" | "event";
	volProbability: number;
	confidence: number;
	affectedAssets: string[];
}

export interface ResearchActionRailItem {
	id: string;
	label: string;
	description: string;
	href: string;
}

export type ResearchModuleKey =
	| "marketSummary"
	| "mattersNow"
	| "eventLane"
	| "narrativeLane"
	| "actionRail";

export type ResearchModuleStatus = "ready" | "degraded";
export type ResearchDegradationReason =
	| "NO_LOCAL_EVENTS"
	| "INSUFFICIENT_EVENT_CONTEXT"
	| "INVALID_LOCAL_RESEARCH_SHAPE"
	| "LOCAL_RESEARCH_BUILD_FAILED";

export interface ResearchModuleState {
	key: ResearchModuleKey;
	status: ResearchModuleStatus;
	reasons: ResearchDegradationReason[];
}

export interface ResearchHomePayload {
	marketSummary: {
		regime: string;
		confidence: number;
		freshnessLabel: string;
	};
	mattersNow: ResearchMatter[];
	eventLane: ResearchEventLaneItem[];
	narrativeLane: ResearchNarrativeLaneItem[];
	actionRail: ResearchActionRailItem[];
}

export interface ResearchHomeResponse {
	payload: ResearchHomePayload;
	degraded: boolean;
	degradedReasons: ResearchDegradationReason[];
	moduleStates: ResearchModuleState[];
	requestId: string;
	source: "local" | "fallback";
}
