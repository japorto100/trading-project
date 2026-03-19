import type {
	IntelligenceCalendarEvent,
	IntelligenceCalendarImpactBand,
	IntelligenceCalendarSurpriseState,
} from "./types";

export function intelligenceCalendarImpactTone(impactBand: IntelligenceCalendarImpactBand): string {
	switch (impactBand) {
		case "critical":
			return "border-red-500/40 text-red-300";
		case "high":
			return "border-amber-500/40 text-amber-300";
		case "medium":
			return "border-sky-500/40 text-sky-300";
		default:
			return "border-muted text-muted-foreground";
	}
}

export function intelligenceCalendarSurpriseTone(state: IntelligenceCalendarSurpriseState): string {
	switch (state) {
		case "above_range":
			return "text-red-300";
		case "below_range":
			return "text-emerald-300";
		case "in_range":
			return "text-sky-300";
		case "pending":
			return "text-amber-300";
		default:
			return "text-muted-foreground";
	}
}

export function intelligenceCalendarOperationalState(event: IntelligenceCalendarEvent): string {
	if (event.actual !== null && event.actual !== undefined && event.actual !== "") {
		return "Post-event";
	}
	if (event.surpriseState === "pending") {
		return "Pre-event";
	}
	return "Live monitoring";
}

export function intelligenceCalendarEvidenceState(
	event: IntelligenceCalendarEvent,
): "verified" | "inferred" | "unknown" {
	if (event.sources.length > 0 && event.degradationReasons.length === 0) {
		return "verified";
	}
	if (event.sources.length > 0 || event.confidence >= 0.55) {
		return "inferred";
	}
	return "unknown";
}

export function intelligenceCalendarEvidenceTone(
	state: "verified" | "inferred" | "unknown",
): string {
	switch (state) {
		case "verified":
			return "border-emerald-500/40 text-emerald-300";
		case "inferred":
			return "border-amber-500/40 text-amber-300";
		default:
			return "border-muted text-muted-foreground";
	}
}

export function dedupeIntelligenceCalendarEvents(
	events: IntelligenceCalendarEvent[],
): IntelligenceCalendarEvent[] {
	const seen = new Set<string>();
	const deduped: IntelligenceCalendarEvent[] = [];

	for (const event of events) {
		const key = `${event.eventId}:${event.updatedAt}`;
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(event);
	}

	return deduped;
}

export function intelligenceCalendarRequiresEvidence(event: IntelligenceCalendarEvent): boolean {
	return event.sources.length > 0 && event.confidence > 0;
}
