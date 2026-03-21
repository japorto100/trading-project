import type { GeoContradiction, GeoContradictionResolution } from "@/lib/geopolitical/types";

export interface GeoContradictionsResponse {
	success: boolean;
	contradictions?: GeoContradiction[];
	error?: string;
}

export type ContradictionFilter = "open" | "resolved" | "all";

export type ContradictionResolutionOutcome = GeoContradictionResolution["outcome"];

export interface ContradictionDraftState {
	summary: string;
	resolutionOutcome: ContradictionResolutionOutcome;
	resolutionNote: string;
	mergedEventId: string;
	mergedCandidateId: string;
	evidenceKind: "source" | "note" | "candidate_link" | "event_link";
	evidenceLabel: string;
	evidenceNote: string;
	evidenceUrl: string;
	evidenceEventId: string;
	evidenceCandidateId: string;
}

export const DEFAULT_RESOLUTION_OUTCOME: ContradictionResolutionOutcome = "defer_monitoring";

export function createDraftFromContradiction(item: GeoContradiction): ContradictionDraftState {
	return {
		summary: item.summary ?? "",
		resolutionOutcome: item.resolution?.outcome ?? DEFAULT_RESOLUTION_OUTCOME,
		resolutionNote: item.resolution?.note ?? "",
		mergedEventId: item.resolution?.mergedEventId ?? "",
		mergedCandidateId: item.resolution?.mergedCandidateId ?? "",
		evidenceKind: "note",
		evidenceLabel: "",
		evidenceNote: "",
		evidenceUrl: "",
		evidenceEventId: "",
		evidenceCandidateId: "",
	};
}
