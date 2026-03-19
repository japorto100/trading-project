import type { SourceHealthResponse } from "@/features/geopolitical/shell/types";

export type GeoSourceHealthSeverity = "healthy" | "degraded" | "outage" | "empty";

export interface GeoSourceHealthSummary {
	severity: GeoSourceHealthSeverity;
	total: number;
	okCount: number;
	warnCount: number;
	disabledCount: number;
	hardSignalOutage: boolean;
	summary: string;
}

type GeoSourceHealthEntry = SourceHealthResponse["entries"][number];

export function buildGeoSourceHealthSummary(
	entries: GeoSourceHealthEntry[],
): GeoSourceHealthSummary {
	if (entries.length === 0) {
		return {
			severity: "empty",
			total: 0,
			okCount: 0,
			warnCount: 0,
			disabledCount: 0,
			hardSignalOutage: false,
			summary: "No source health data loaded.",
		};
	}

	const enabledEntries = entries.filter((entry) => entry.enabled);
	const okCount = enabledEntries.filter((entry) => entry.ok).length;
	const warnEntries = enabledEntries.filter((entry) => !entry.ok);
	const warnCount = warnEntries.length;
	const disabledCount = entries.length - enabledEntries.length;
	const hardSignalOutage = warnEntries.some((entry) => entry.type === "hard_signal");

	if (hardSignalOutage) {
		return {
			severity: "outage",
			total: entries.length,
			okCount,
			warnCount,
			disabledCount,
			hardSignalOutage,
			summary:
				"Hard-signal coverage is degraded. GeoMap should stay usable but treat current ingest as partial.",
		};
	}

	if (warnCount > 0 || disabledCount > 0) {
		return {
			severity: "degraded",
			total: entries.length,
			okCount,
			warnCount,
			disabledCount,
			hardSignalOutage,
			summary:
				"Some providers are degraded or disabled. Keep local panels active, but expect partial source coverage.",
		};
	}

	return {
		severity: "healthy",
		total: entries.length,
		okCount,
		warnCount,
		disabledCount,
		hardSignalOutage,
		summary: "All enabled GeoMap sources currently report healthy status.",
	};
}
