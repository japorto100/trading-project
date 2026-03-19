import { describe, expect, it } from "bun:test";
import { buildGeoFlatViewTimelineModel } from "@/features/geopolitical/flat-view-timeline-model";
import type { GeoEvent } from "@/lib/geopolitical/types";

const EVENTS: GeoEvent[] = [
	{
		id: "evt-1",
		title: "Missile launch",
		category: "conflict",
		status: "confirmed",
		severity: 4,
		confidence: 3,
		countryCodes: ["IR"],
		regionIds: ["middle-east"],
		coordinates: [{ lat: 35.69, lng: 51.39 }],
		sources: [],
		assets: [
			{
				id: "asset-1",
				symbol: "XAUUSD",
				assetClass: "commodity",
				relation: "hedge",
			},
		],
		createdAt: "2026-03-12T06:00:00.000Z",
		updatedAt: "2026-03-12T06:00:00.000Z",
		validFrom: "2026-03-12T09:00:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "missile",
	},
	{
		id: "evt-2",
		title: "Strike reported",
		category: "conflict",
		status: "confirmed",
		severity: 5,
		confidence: 3,
		countryCodes: ["SY"],
		regionIds: ["middle-east"],
		coordinates: [
			{ lat: 33.51, lng: 36.29 },
			{ lat: 33.6, lng: 36.4 },
		],
		sources: [],
		assets: [
			{
				id: "asset-2",
				symbol: "BTCUSD",
				assetClass: "crypto",
				relation: "beneficiary",
			},
		],
		createdAt: "2026-03-12T10:00:00.000Z",
		updatedAt: "2026-03-12T10:00:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "strike",
	},
	{
		id: "evt-3",
		title: "Port disruption",
		category: "trade",
		status: "confirmed",
		severity: 3,
		confidence: 2,
		countryCodes: ["EG"],
		regionIds: ["middle-east"],
		coordinates: [{ lat: 30.04, lng: 31.24 }],
		sources: [],
		assets: [],
		createdAt: "2026-03-12T15:00:00.000Z",
		updatedAt: "2026-03-12T15:00:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "shipping",
	},
];

describe("flat-view-timeline-model", () => {
	it("returns no buckets when the conflict layer is inactive", () => {
		const model = buildGeoFlatViewTimelineModel({
			events: EVENTS,
			viewRangeMs: [Date.parse("2026-03-12T08:00:00.000Z"), Date.parse("2026-03-12T18:00:00.000Z")],
			filterRangeMs: null,
			selectedTimeMs: null,
			layerFamilies: ["geo-core", "context"],
		});

		expect(model.conflictLayerActive).toBeFalse();
		expect(model.buckets).toEqual([]);
		expect(model.bucketSizeMs).toBeNull();
	});

	it("builds deterministic buckets from visible events and marks filter overlap", () => {
		const model = buildGeoFlatViewTimelineModel({
			events: EVENTS,
			viewRangeMs: [Date.parse("2026-03-12T08:00:00.000Z"), Date.parse("2026-03-12T18:00:00.000Z")],
			filterRangeMs: [
				Date.parse("2026-03-12T09:30:00.000Z"),
				Date.parse("2026-03-12T12:30:00.000Z"),
			],
			selectedTimeMs: Date.parse("2026-03-12T10:10:00.000Z"),
			layerFamilies: ["geo-core", "conflict", "context"],
		});

		expect(model.conflictLayerActive).toBeTrue();
		expect(model.bucketSizeMs).toBe(3_600_000);
		expect(model.selectedBucketIndex).toBe(2);
		expect(model.buckets.filter((bucket) => bucket.count > 0)).toEqual([
			{
				startMs: Date.parse("2026-03-12T09:00:00.000Z"),
				endMs: Date.parse("2026-03-12T09:59:59.999Z"),
				count: 1,
				maxSeverity: 4,
				strikeCount: 1,
				targetCount: 0,
				assetCount: 1,
				heatIntensity: 4,
				eventIds: ["evt-1"],
				inFilterRange: true,
				containsSelectedTime: false,
			},
			{
				startMs: Date.parse("2026-03-12T10:00:00.000Z"),
				endMs: Date.parse("2026-03-12T10:59:59.999Z"),
				count: 1,
				maxSeverity: 5,
				strikeCount: 1,
				targetCount: 1,
				assetCount: 1,
				heatIntensity: 5,
				eventIds: ["evt-2"],
				inFilterRange: true,
				containsSelectedTime: true,
			},
			{
				startMs: Date.parse("2026-03-12T15:00:00.000Z"),
				endMs: Date.parse("2026-03-12T15:59:59.999Z"),
				count: 1,
				maxSeverity: 3,
				strikeCount: 0,
				targetCount: 0,
				assetCount: 0,
				heatIntensity: 3,
				eventIds: ["evt-3"],
				inFilterRange: false,
				containsSelectedTime: false,
			},
		]);
	});

	it("derives the timeline range from event timestamps when no explicit view range exists", () => {
		const model = buildGeoFlatViewTimelineModel({
			events: EVENTS.slice(0, 2),
			viewRangeMs: null,
			filterRangeMs: null,
			selectedTimeMs: null,
			layerFamilies: ["geo-core", "conflict"],
		});

		expect(model.rangeMs).toEqual([
			Date.parse("2026-03-12T09:00:00.000Z"),
			Date.parse("2026-03-12T10:00:00.000Z"),
		]);
		expect(model.buckets.some((bucket) => bucket.eventIds.includes("evt-1"))).toBeTrue();
		expect(model.buckets.some((bucket) => bucket.eventIds.includes("evt-2"))).toBeTrue();
	});
});
