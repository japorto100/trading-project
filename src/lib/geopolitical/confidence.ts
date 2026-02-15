import type { GeoCandidate, GeoSourceRef } from "@/lib/geopolitical/types";

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function tierWeight(sourceTier: GeoSourceRef["sourceTier"]): number {
	if (sourceTier === "A") return 1;
	if (sourceTier === "B") return 0.72;
	return 0.52;
}

function recencyWeight(publishedAt?: string): number {
	if (!publishedAt) return 0.5;
	const publishedMs = new Date(publishedAt).getTime();
	if (!Number.isFinite(publishedMs)) return 0.5;
	const ageHours = Math.max(0, (Date.now() - publishedMs) / 3_600_000);
	// Half-life around 36h keeps medium-term events relevant while reducing stale spikes.
	const decay = 0.5 ** (ageHours / 36);
	return clamp(decay, 0.2, 1);
}

export function scoreCandidateConfidence(
	candidate: Pick<GeoCandidate, "sourceRefs" | "triggerType">,
): number {
	const sources = candidate.sourceRefs ?? [];
	if (sources.length === 0) {
		return candidate.triggerType === "hard_signal" ? 0.55 : 0.32;
	}

	const weighted = sources.map((source) => {
		const reliability = clamp(Number(source.reliability || 0), 0, 1);
		return tierWeight(source.sourceTier) * reliability * recencyWeight(source.publishedAt);
	});

	const avgWeight = weighted.reduce((sum, value) => sum + value, 0) / weighted.length;
	const uniqueProviders = new Set(
		sources.map((source) => source.provider.trim().toLowerCase()).filter(Boolean),
	).size;
	const corroborationBoost = Math.min(0.18, Math.max(0, uniqueProviders - 1) * 0.05);
	const hardSignalBoost = candidate.triggerType === "hard_signal" ? 0.12 : 0;

	return clamp(avgWeight + corroborationBoost + hardSignalBoost, 0, 1);
}

export function confidenceToLadder(confidence: number): 0 | 1 | 2 | 3 | 4 {
	if (confidence >= 0.84) return 4;
	if (confidence >= 0.68) return 3;
	if (confidence >= 0.52) return 2;
	if (confidence >= 0.35) return 1;
	return 0;
}
