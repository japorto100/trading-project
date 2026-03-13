import { describe, expect, it } from "bun:test";
import {
	buildGeoEventStoryFocusState,
	buildGeoStoryFocusPreset,
	removeGeoStoryFocusPreset,
	upsertGeoStoryFocusPreset,
} from "@/features/geopolitical/geo-story-focus";
import type { GeoEvent } from "@/lib/geopolitical/types";

const baseEvent: GeoEvent = {
	id: "event-1",
	title: "Test event",
	category: "conflict",
	status: "confirmed",
	severity: 3,
	confidence: 2,
	countryCodes: ["UA"],
	regionIds: ["europe"],
	sources: [],
	assets: [],
	createdAt: "2026-03-10T08:00:00.000Z",
	updatedAt: "2026-03-10T09:00:00.000Z",
	validFrom: "2026-03-10T10:00:00.000Z",
	createdBy: "system",
	updatedBy: "system",
	symbol: "alert",
};

describe("geo story focus", () => {
	it("adopts the event region when no region filter is active", () => {
		const focus = buildGeoEventStoryFocusState({
			event: baseEvent,
			domainMs: [Date.parse("2026-03-09T00:00:00.000Z"), Date.parse("2026-03-11T00:00:00.000Z")],
			viewRangeMs: [Date.parse("2026-03-10T09:00:00.000Z"), Date.parse("2026-03-10T11:00:00.000Z")],
			activeRegionId: "",
		});

		expect(focus?.regionIdToAdopt).toBe("europe");
		expect(focus?.selectedTimeMs).toBe(Date.parse("2026-03-10T10:00:00.000Z"));
	});

	it("does not overwrite an existing active region", () => {
		const focus = buildGeoEventStoryFocusState({
			event: baseEvent,
			domainMs: [Date.parse("2026-03-09T00:00:00.000Z"), Date.parse("2026-03-11T00:00:00.000Z")],
			viewRangeMs: [Date.parse("2026-03-10T09:00:00.000Z"), Date.parse("2026-03-10T11:00:00.000Z")],
			activeRegionId: "mena",
		});

		expect(focus?.regionIdToAdopt).toBeNull();
		expect(focus?.regionId).toBe("europe");
	});

	it("keeps recent story presets with newest first", () => {
		const older = buildGeoStoryFocusPreset({
			id: "story-older",
			label: "Older",
			linkedEventId: "event-1",
			selectedTimeMs: 10,
			viewRangeMs: [1, 2],
			filterRangeMs: [1, 2],
			regionId: "europe",
		});
		const newer = buildGeoStoryFocusPreset({
			id: "story-newer",
			label: "Newer",
			linkedEventId: "event-2",
			selectedTimeMs: 20,
			viewRangeMs: [2, 3],
			filterRangeMs: [2, 3],
			regionId: "mena",
		});

		const result = upsertGeoStoryFocusPreset([older], newer, 2);
		expect(result.map((item) => item.id)).toEqual(["story-newer", "story-older"]);
	});

	it("replaces an existing story preset with the same id", () => {
		const older = buildGeoStoryFocusPreset({
			id: "story-1",
			label: "Older",
			linkedEventId: "event-1",
			selectedTimeMs: 10,
			viewRangeMs: [1, 2],
			filterRangeMs: [1, 2],
			regionId: "europe",
		});
		const updated = buildGeoStoryFocusPreset({
			id: "story-1",
			label: "Updated",
			linkedEventId: "event-1",
			selectedTimeMs: 12,
			viewRangeMs: [3, 4],
			filterRangeMs: [3, 4],
			regionId: "europe",
		});

		const result = upsertGeoStoryFocusPreset([older], updated);
		expect(result).toHaveLength(1);
		expect(result[0]?.label).toBe("Updated");
		expect(result[0]?.viewRangeMs).toEqual([3, 4]);
	});

	it("removes a story preset by id", () => {
		const first = buildGeoStoryFocusPreset({
			id: "story-1",
			label: "First",
			linkedEventId: "event-1",
			selectedTimeMs: 10,
			viewRangeMs: [1, 2],
			filterRangeMs: [1, 2],
			regionId: "europe",
		});
		const second = buildGeoStoryFocusPreset({
			id: "story-2",
			label: "Second",
			linkedEventId: "event-2",
			selectedTimeMs: 20,
			viewRangeMs: [2, 3],
			filterRangeMs: [2, 3],
			regionId: "mena",
		});

		const result = removeGeoStoryFocusPreset([first, second], "story-1");
		expect(result.map((item) => item.id)).toEqual(["story-2"]);
	});
});
