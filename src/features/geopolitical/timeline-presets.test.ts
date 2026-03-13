import { describe, expect, it } from "bun:test";
import {
	buildGeoTimelinePresetRange,
	buildGeoTimelineResetState,
	clampGeoTimelineRangeToDomain,
	clampGeoTimelineSelectedTimeToDomain,
	GEO_TIMELINE_PRESET_OPTIONS,
} from "@/features/geopolitical/timeline-presets";

describe("timeline presets", () => {
	it("exposes the expected preset options", () => {
		expect(GEO_TIMELINE_PRESET_OPTIONS.map((option) => option.id)).toEqual([
			"24h",
			"7d",
			"1m",
			"all",
		]);
	});

	it("builds bounded 24h and 7d ranges against the latest timestamp", () => {
		const domain: [number, number] = [
			Date.parse("2026-03-01T00:00:00.000Z"),
			Date.parse("2026-03-10T00:00:00.000Z"),
		];
		expect(buildGeoTimelinePresetRange(domain, "24h")).toEqual([
			Date.parse("2026-03-09T00:00:00.000Z"),
			Date.parse("2026-03-10T00:00:00.000Z"),
		]);
		expect(buildGeoTimelinePresetRange(domain, "7d")).toEqual([
			Date.parse("2026-03-03T00:00:00.000Z"),
			Date.parse("2026-03-10T00:00:00.000Z"),
		]);
	});

	it("clamps 1m and all presets to the available domain", () => {
		const domain: [number, number] = [
			Date.parse("2026-03-08T00:00:00.000Z"),
			Date.parse("2026-03-10T00:00:00.000Z"),
		];
		expect(buildGeoTimelinePresetRange(domain, "1m")).toEqual(domain);
		expect(buildGeoTimelinePresetRange(domain, "all")).toEqual(domain);
	});

	it("builds a neutral reset state for the current timeline domain", () => {
		const domain: [number, number] = [
			Date.parse("2026-03-08T00:00:00.000Z"),
			Date.parse("2026-03-10T00:00:00.000Z"),
		];
		expect(buildGeoTimelineResetState(domain)).toEqual({
			playbackEnabled: false,
			playbackRunning: false,
			brushRangeMs: null,
			playbackCursorMs: domain[1],
		});
		expect(buildGeoTimelineResetState(null)).toEqual({
			playbackEnabled: false,
			playbackRunning: false,
			brushRangeMs: null,
			playbackCursorMs: null,
		});
	});

	it("clamps a visible timeline range back into the active domain", () => {
		const domain: [number, number] = [
			Date.parse("2026-03-08T00:00:00.000Z"),
			Date.parse("2026-03-10T00:00:00.000Z"),
		];
		expect(
			clampGeoTimelineRangeToDomain(
				[Date.parse("2026-03-07T12:00:00.000Z"), Date.parse("2026-03-08T12:00:00.000Z")],
				domain,
			),
		).toEqual([Date.parse("2026-03-08T00:00:00.000Z"), Date.parse("2026-03-09T00:00:00.000Z")]);
		expect(
			clampGeoTimelineRangeToDomain(
				[Date.parse("2026-03-07T00:00:00.000Z"), Date.parse("2026-03-11T00:00:00.000Z")],
				domain,
			),
		).toBeNull();
	});

	it("drops selected time when it falls outside the active domain", () => {
		const domain: [number, number] = [
			Date.parse("2026-03-08T00:00:00.000Z"),
			Date.parse("2026-03-10T00:00:00.000Z"),
		];
		expect(
			clampGeoTimelineSelectedTimeToDomain(Date.parse("2026-03-09T08:00:00.000Z"), domain),
		).toBe(Date.parse("2026-03-09T08:00:00.000Z"));
		expect(
			clampGeoTimelineSelectedTimeToDomain(Date.parse("2026-03-11T08:00:00.000Z"), domain),
		).toBeNull();
	});
});
