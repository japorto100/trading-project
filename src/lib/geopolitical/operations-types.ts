export type GeoAlertSeverityThreshold = "low" | "medium" | "high" | "critical";

export interface GeoAlertPolicyConfig {
	minSeverity: GeoAlertSeverityThreshold;
	minConfidence: number;
	cooldownMinutes: number;
	muteProfileEnabled: boolean;
	usePlaybackWindowPreview: boolean;
	updatedAt: string;
	updatedBy: string;
}

export interface GeoCentralBankOverlayConfig {
	rateDecisionsEnabled: boolean;
	cbdcStatusEnabled: boolean;
	dedollarizationEnabled: boolean;
	financialOpennessEnabled: boolean;
	updatedAt: string;
	updatedBy: string;
}

export interface GeoEvaluationSummary {
	generatedAt: string;
	counts: {
		events: number;
		candidates: number;
		openCandidates: number;
		contradictions: number;
		openContradictions: number;
		timeline: number;
	};
	review: {
		accepted: number;
		rejected: number;
		snoozed: number;
		reviewTotal: number;
		acceptRate: number;
		rejectRate: number;
		snoozeRate: number;
	};
	contradictions: {
		created: number;
		resolved: number;
		resolutionRate: number;
	};
}
