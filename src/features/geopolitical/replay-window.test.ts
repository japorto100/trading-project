import { describe, expect, it } from "bun:test";
import {
	buildEffectiveReplayRangeMs,
	filterGeoContextItemsByReplayRange,
	filterGeoEventsByReplayRange,
	filterGeoGameTheoryItemsByReplayRange,
	filterGeoTimelineByReplayRange,
	filterGeoTimelineByViewRange,
} from "@/features/geopolitical/replay-window";
import type { GeoContextItem, GeoGameTheoryItem } from "@/features/geopolitical/shell/types";
import type { GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";

describe("geo replay window helpers", () => {
	it("intersects playback and brush ranges into one effective replay range", () => {
		expect(
			buildEffectiveReplayRangeMs({
				playbackRangeMs: [100, 400],
				brushRangeMs: [250, 500],
			}),
		).toEqual([250, 400]);
	});

	it("filters events using validFrom before falling back to createdAt", () => {
		const events = [
			{
				id: "inside-valid-from",
				title: "Inside",
				category: "conflict",
				status: "confirmed",
				severity: 3,
				confidence: 2,
				countryCodes: ["UA"],
				regionIds: ["europe"],
				sources: [],
				assets: [],
				createdAt: "2026-03-10T08:00:00.000Z",
				updatedAt: "2026-03-10T08:05:00.000Z",
				validFrom: "2026-03-10T12:00:00.000Z",
				createdBy: "system",
				updatedBy: "system",
				symbol: "alert",
			},
			{
				id: "outside-created",
				title: "Outside",
				category: "conflict",
				status: "confirmed",
				severity: 2,
				confidence: 1,
				countryCodes: ["UA"],
				regionIds: ["europe"],
				sources: [],
				assets: [],
				createdAt: "2026-03-09T08:00:00.000Z",
				updatedAt: "2026-03-09T08:05:00.000Z",
				createdBy: "system",
				updatedBy: "system",
				symbol: "alert",
			},
		] satisfies GeoEvent[];

		const visible = filterGeoEventsByReplayRange(events, [
			Date.parse("2026-03-10T11:00:00.000Z"),
			Date.parse("2026-03-10T13:00:00.000Z"),
		]);

		expect(visible.map((entry) => entry.id)).toEqual(["inside-valid-from"]);
	});

	it("filters timeline entries by the active replay range", () => {
		const timeline = [
			{
				id: "before",
				eventId: "a",
				action: "created",
				actor: "system",
				at: "2026-03-10T07:00:00.000Z",
				diffSummary: "Before",
			},
			{
				id: "inside",
				eventId: "b",
				action: "status_changed",
				actor: "analyst",
				at: "2026-03-10T09:00:00.000Z",
				diffSummary: "Inside",
			},
		] satisfies GeoTimelineEntry[];

		const visible = filterGeoTimelineByReplayRange(timeline, [
			Date.parse("2026-03-10T08:00:00.000Z"),
			Date.parse("2026-03-10T10:00:00.000Z"),
		]);

		expect(visible.map((entry) => entry.id)).toEqual(["inside"]);
	});

	it("filters visible timeline entries by an independent timeline view range", () => {
		const timeline = [
			{
				id: "before",
				eventId: "a",
				action: "created",
				actor: "system",
				at: "2026-03-10T07:00:00.000Z",
				diffSummary: "Before",
			},
			{
				id: "inside",
				eventId: "b",
				action: "status_changed",
				actor: "analyst",
				at: "2026-03-10T09:00:00.000Z",
				diffSummary: "Inside",
			},
		] satisfies GeoTimelineEntry[];

		const visible = filterGeoTimelineByViewRange(timeline, [
			Date.parse("2026-03-10T08:00:00.000Z"),
			Date.parse("2026-03-10T10:00:00.000Z"),
		]);

		expect(visible.map((entry) => entry.id)).toEqual(["inside"]);
	});
});

describe("geo replay window auxiliary panels", () => {
	it("filters context items by publishedAt when a replay range is active", () => {
		const items = [
			{
				id: "inside",
				source: "cfr",
				title: "Inside",
				url: "https://example.com/inside",
				publishedAt: "2026-03-10T09:00:00.000Z",
			},
			{
				id: "outside",
				source: "crisiswatch",
				title: "Outside",
				url: "https://example.com/outside",
				publishedAt: "2026-03-08T09:00:00.000Z",
			},
		] satisfies GeoContextItem[];

		const visible = filterGeoContextItemsByReplayRange(items, [
			Date.parse("2026-03-10T08:00:00.000Z"),
			Date.parse("2026-03-10T10:00:00.000Z"),
		]);

		expect(visible.map((entry) => entry.id)).toEqual(["inside"]);
	});

	it("filters game-theory items by eventDate when a replay range is active", () => {
		const items = [
			{
				id: "inside",
				eventId: "e1",
				eventTitle: "Inside",
				region: "Europe",
				marketBias: "risk_off",
				impactScore: 0.8,
				confidence: 0.7,
				drivers: ["escalation"],
				symbols: ["DXY"],
				eventDate: "2026-03-10T11:00:00.000Z",
			},
			{
				id: "outside",
				eventId: "e2",
				eventTitle: "Outside",
				region: "Europe",
				marketBias: "neutral",
				impactScore: 0.3,
				confidence: 0.4,
				drivers: ["noise"],
				symbols: ["SPY"],
				eventDate: "2026-03-07T11:00:00.000Z",
			},
		] satisfies GeoGameTheoryItem[];

		const visible = filterGeoGameTheoryItemsByReplayRange(items, [
			Date.parse("2026-03-10T10:00:00.000Z"),
			Date.parse("2026-03-10T12:00:00.000Z"),
		]);

		expect(visible.map((entry) => entry.id)).toEqual(["inside"]);
	});
});
