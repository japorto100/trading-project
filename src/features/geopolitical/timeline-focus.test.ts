import { describe, expect, it } from "bun:test";
import {
	buildGeoTimelineSelectionFocus,
	buildGeoTimelineTimeFocus,
} from "@/features/geopolitical/timeline-focus";
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

describe("buildGeoTimelineSelectionFocus", () => {
	it("keeps the current view range when the selected event is already visible", () => {
		const focus = buildGeoTimelineSelectionFocus({
			event: baseEvent,
			domainMs: [Date.parse("2026-03-09T00:00:00.000Z"), Date.parse("2026-03-11T00:00:00.000Z")],
			viewRangeMs: [Date.parse("2026-03-10T09:00:00.000Z"), Date.parse("2026-03-10T11:00:00.000Z")],
		});

		expect(focus).toEqual({
			regionId: "europe",
			selectedTimeMs: Date.parse("2026-03-10T10:00:00.000Z"),
			viewRangeMs: [Date.parse("2026-03-10T09:00:00.000Z"), Date.parse("2026-03-10T11:00:00.000Z")],
		});
	});

	it("recenters the view range around the selected event when needed", () => {
		const focus = buildGeoTimelineSelectionFocus({
			event: baseEvent,
			domainMs: [Date.parse("2026-03-09T00:00:00.000Z"), Date.parse("2026-03-11T00:00:00.000Z")],
			viewRangeMs: [Date.parse("2026-03-09T00:00:00.000Z"), Date.parse("2026-03-09T12:00:00.000Z")],
			defaultWindowMs: 12 * 3_600_000,
		});

		expect(focus).toEqual({
			regionId: "europe",
			selectedTimeMs: Date.parse("2026-03-10T10:00:00.000Z"),
			viewRangeMs: [Date.parse("2026-03-10T04:00:00.000Z"), Date.parse("2026-03-10T16:00:00.000Z")],
		});
	});

	it("clamps the next view range to the available timeline domain", () => {
		const focus = buildGeoTimelineSelectionFocus({
			event: {
				...baseEvent,
				validFrom: "2026-03-10T23:00:00.000Z",
			},
			domainMs: [Date.parse("2026-03-10T00:00:00.000Z"), Date.parse("2026-03-11T00:00:00.000Z")],
			viewRangeMs: [Date.parse("2026-03-10T04:00:00.000Z"), Date.parse("2026-03-10T16:00:00.000Z")],
		});

		expect(focus).toEqual({
			regionId: "europe",
			selectedTimeMs: Date.parse("2026-03-10T23:00:00.000Z"),
			viewRangeMs: [Date.parse("2026-03-10T12:00:00.000Z"), Date.parse("2026-03-11T00:00:00.000Z")],
		});
	});
});

describe("buildGeoTimelineTimeFocus", () => {
	it("recenters a visible window around a selected timestamp when needed", () => {
		const focus = buildGeoTimelineTimeFocus({
			selectedTimeMs: Date.parse("2026-03-10T18:00:00.000Z"),
			domainMs: [Date.parse("2026-03-10T00:00:00.000Z"), Date.parse("2026-03-11T00:00:00.000Z")],
			viewRangeMs: [Date.parse("2026-03-10T04:00:00.000Z"), Date.parse("2026-03-10T10:00:00.000Z")],
		});

		expect(focus).toEqual({
			selectedTimeMs: Date.parse("2026-03-10T18:00:00.000Z"),
			viewRangeMs: [Date.parse("2026-03-10T15:00:00.000Z"), Date.parse("2026-03-10T21:00:00.000Z")],
		});
	});
});
