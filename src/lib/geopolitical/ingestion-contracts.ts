import { confidenceToLadder } from "@/lib/geopolitical/confidence";
import type { GeoCandidate, GeoSourceRef } from "@/lib/geopolitical/types";

export interface GeoIngestionAdapterStats {
	adapterId: string;
	ok: boolean;
	message?: string;
	produced: number;
	promoted: number;
	created: number;
	deduped: number;
}

export function createEmptyGeoIngestionAdapterStats(
	adapterId: string,
	input?: { ok?: boolean; message?: string },
): GeoIngestionAdapterStats {
	return {
		adapterId,
		ok: input?.ok ?? false,
		message: input?.message,
		produced: 0,
		promoted: 0,
		created: 0,
		deduped: 0,
	};
}

interface TierCounts {
	A: number;
	B: number;
	C: number;
}

function summarizeSources(sourceRefs: GeoSourceRef[]): {
	sourceCount: number;
	providerCount: number;
	tierCounts: TierCounts;
} {
	const providerCount = new Set(
		sourceRefs.map((source) => source.provider.trim().toLowerCase()).filter(Boolean),
	).size;
	const tierCounts = sourceRefs.reduce(
		(acc, source) => {
			acc[source.sourceTier] += 1;
			return acc;
		},
		{ A: 0, B: 0, C: 0 } as TierCounts,
	);
	return {
		sourceCount: sourceRefs.length,
		providerCount,
		tierCounts,
	};
}

function formatTierSummary(tierCounts: TierCounts): string | null {
	const parts = [`A:${tierCounts.A}`, `B:${tierCounts.B}`, `C:${tierCounts.C}`].filter(
		(entry) => !entry.endsWith(":0"),
	);
	return parts.length > 0 ? parts.join(", ") : null;
}

export interface GeoAutoReviewNoteInput {
	pipeline: "hard" | "soft";
	adapterId: string;
	triggerType: GeoCandidate["triggerType"];
	confidence: number;
	sourceRefs: GeoSourceRef[];
	category?: string;
	extra?: Record<string, string | number | boolean | undefined | null>;
}

export function formatGeoAutoReviewNote(input: GeoAutoReviewNoteInput): string {
	const { sourceCount, providerCount, tierCounts } = summarizeSources(input.sourceRefs ?? []);
	const tierSummary = formatTierSummary(tierCounts);
	const ladder = confidenceToLadder(input.confidence);
	const confidenceLabel = `C${ladder} (${input.confidence.toFixed(2)})`;

	const extraParts = Object.entries(input.extra ?? {})
		.filter(([, value]) => value !== undefined && value !== null && value !== "")
		.map(([key, value]) => `${key}=${String(value)}`);

	return [
		`auto:${input.pipeline}:${input.adapterId}`,
		`trigger=${input.triggerType}`,
		input.category ? `category=${input.category}` : null,
		`confidence=${confidenceLabel}`,
		`sources=${sourceCount}`,
		`providers=${providerCount}`,
		tierSummary ? `tiers=${tierSummary}` : null,
		...extraParts,
	]
		.filter(Boolean)
		.join(" | ");
}
