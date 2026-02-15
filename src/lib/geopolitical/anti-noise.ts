import { confidenceToLadder } from "@/lib/geopolitical/confidence";
import type { GeoCandidate, GeoEvent } from "@/lib/geopolitical/types";

const DEFAULT_COOLDOWN_MINUTES = 45;

function toRegionKey(regionIds: string[] | undefined): string {
	if (!regionIds || regionIds.length === 0) return "global";
	return [...regionIds].sort().join("|");
}

function toCategoryKey(category: string | undefined): string {
	return category?.trim().toLowerCase() || "uncategorized";
}

function cooldownKey(regionIds: string[] | undefined, category: string | undefined): string {
	return `${toRegionKey(regionIds)}::${toCategoryKey(category)}`;
}

export function shouldPromoteCandidate(candidate: GeoCandidate): boolean {
	const ladder = confidenceToLadder(candidate.confidence);
	// C3/C4 default rule from masterplan.
	return ladder >= 3;
}

export function shouldTriggerEventAlert(
	event: Pick<GeoEvent, "severity" | "confidence" | "regionIds" | "category" | "updatedAt">,
	recent: Pick<GeoEvent, "severity" | "confidence" | "regionIds" | "category" | "updatedAt">[],
	cooldownMinutes = DEFAULT_COOLDOWN_MINUTES,
): boolean {
	// High-signal threshold: severity S4+ OR confidence C3+.
	if (event.severity < 4 && event.confidence < 3) {
		return false;
	}

	const currentUpdatedAt = new Date(event.updatedAt).getTime();
	if (!Number.isFinite(currentUpdatedAt)) {
		return true;
	}

	const key = cooldownKey(event.regionIds, event.category);
	const cooldownMs = cooldownMinutes * 60_000;

	for (const item of recent) {
		if (cooldownKey(item.regionIds, item.category) !== key) continue;
		const itemUpdatedAt = new Date(item.updatedAt).getTime();
		if (!Number.isFinite(itemUpdatedAt)) continue;
		if (currentUpdatedAt - itemUpdatedAt < cooldownMs) {
			return false;
		}
	}

	return true;
}
