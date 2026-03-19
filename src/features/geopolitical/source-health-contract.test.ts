import { describe, expect, it } from "bun:test";
import { buildGeoSourceHealthSummary } from "@/features/geopolitical/source-health-contract";

describe("source-health-contract", () => {
	it("reports empty state when no source health entries are available", () => {
		expect(buildGeoSourceHealthSummary([])).toEqual({
			severity: "empty",
			total: 0,
			okCount: 0,
			warnCount: 0,
			disabledCount: 0,
			hardSignalOutage: false,
			summary: "No source health data loaded.",
		});
	});

	it("marks hard-signal failures as outage", () => {
		expect(
			buildGeoSourceHealthSummary([
				{
					id: "acled",
					label: "ACLED",
					tier: "A",
					type: "hard_signal",
					ok: false,
					enabled: true,
					message: "timeout",
				},
				{
					id: "gdelt",
					label: "GDELT",
					tier: "B",
					type: "news",
					ok: true,
					enabled: true,
				},
			]),
		).toEqual({
			severity: "outage",
			total: 2,
			okCount: 1,
			warnCount: 1,
			disabledCount: 0,
			hardSignalOutage: true,
			summary:
				"Hard-signal coverage is degraded. GeoMap should stay usable but treat current ingest as partial.",
		});
	});

	it("marks non-hard-signal warnings or disabled sources as degraded", () => {
		expect(
			buildGeoSourceHealthSummary([
				{
					id: "crisiswatch",
					label: "CrisisWatch",
					tier: "B",
					type: "soft_signal",
					ok: false,
					enabled: true,
				},
				{
					id: "cfr",
					label: "CFR",
					tier: "C",
					type: "news",
					ok: true,
					enabled: false,
				},
			]),
		).toEqual({
			severity: "degraded",
			total: 2,
			okCount: 0,
			warnCount: 1,
			disabledCount: 1,
			hardSignalOutage: false,
			summary:
				"Some providers are degraded or disabled. Keep local panels active, but expect partial source coverage.",
		});
	});

	it("marks fully healthy enabled sources as healthy", () => {
		expect(
			buildGeoSourceHealthSummary([
				{
					id: "acled",
					label: "ACLED",
					tier: "A",
					type: "hard_signal",
					ok: true,
					enabled: true,
				},
				{
					id: "gdelt",
					label: "GDELT",
					tier: "B",
					type: "news",
					ok: true,
					enabled: true,
				},
			]),
		).toEqual({
			severity: "healthy",
			total: 2,
			okCount: 2,
			warnCount: 0,
			disabledCount: 0,
			hardSignalOutage: false,
			summary: "All enabled GeoMap sources currently report healthy status.",
		});
	});
});
