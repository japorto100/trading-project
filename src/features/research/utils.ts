export function researchConfidenceTone(confidence: number): string {
	if (confidence >= 0.8) return "text-emerald-400";
	if (confidence >= 0.65) return "text-amber-300";
	return "text-orange-300";
}

export function researchImpactTone(impactBand: "low" | "medium" | "high" | "critical"): string {
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
