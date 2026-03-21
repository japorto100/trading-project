import { describe, expect, it } from "bun:test";
import {
	buildGeoFlatViewOverlayBoundsCollection,
	buildGeoFlatViewOverlayEventPoints,
	getGeoFlatViewEventColor,
} from "@/features/geopolitical/flat-view/flat-view-overlay-payload";
import { getGeoFlatMarkerDeclutterLimit } from "@/features/geopolitical/markers/marker-priority";
import type { GeoEvent } from "@/lib/geopolitical/types";

const EVENT: GeoEvent = {
	id: "evt-1",
	title: "Missile launch detected",
	category: "conflict",
	status: "confirmed",
	severity: 4,
	confidence: 3,
	countryCodes: ["IR"],
	regionIds: ["middle-east"],
	coordinates: [{ lat: 35.69, lng: 51.39 }],
	sources: [],
	assets: [],
	createdAt: "2026-03-12T07:00:00.000Z",
	updatedAt: "2026-03-12T07:00:00.000Z",
	createdBy: "system",
	updatedBy: "system",
	symbol: "missile",
};

describe("flat-view-overlay-payload", () => {
	it("builds an empty bounds collection when no flat bounds exist", () => {
		const collection = buildGeoFlatViewOverlayBoundsCollection(null);
		expect(collection.features).toEqual([]);
	});

	it("builds a polygon feature collection from flat bounds", () => {
		const collection = buildGeoFlatViewOverlayBoundsCollection({
			south: 10,
			west: 20,
			north: 30,
			east: 40,
		});

		expect(collection.features).toHaveLength(1);
		expect(collection.features[0]?.geometry.coordinates[0]).toEqual([
			[20, 10],
			[40, 10],
			[40, 30],
			[20, 30],
			[20, 10],
		]);
	});

	it("builds renderer-ready event payloads with selection styling", () => {
		const points = buildGeoFlatViewOverlayEventPoints({
			events: [EVENT],
			bounds: { south: 30, west: 40, north: 40, east: 60 },
			selectedEventId: "evt-1",
		});

		expect(points).toEqual([
			{
				id: "evt-1",
				title: "Missile launch detected",
				labelText: "Missile launch detected",
				severity: 4,
				coordinates: [51.39, 35.69],
				selected: true,
				timelineFocused: false,
				radiusMeters: 12_000,
				haloRadiusMeters: 22_000,
				fillColor: [250, 204, 21, 255],
				haloColor: [250, 204, 21, 84],
				symbolShortCode: "M",
				priorityScore: 10481,
				priorityTier: "critical",
				declutterVisible: true,
				labelVisible: true,
				badgeVisible: true,
			},
		]);
	});

	it("filters out events without coordinates or outside the current bounds", () => {
		const points = buildGeoFlatViewOverlayEventPoints({
			events: [
				EVENT,
				{ ...EVENT, id: "evt-2", coordinates: [{ lat: 5, lng: 5 }] },
				{ ...EVENT, id: "evt-3", coordinates: [] },
			],
			bounds: { south: 30, west: 40, north: 40, east: 60 },
			selectedEventId: null,
		});

		expect(points).toHaveLength(1);
		expect(points[0]?.id).toBe("evt-1");
		expect(points[0]?.labelText).toBe("Missile launch detected");
		expect(points[0]?.selected).toBeFalse();
		expect(points[0]?.timelineFocused).toBeFalse();
		expect(points[0]?.radiusMeters).toBe(9_500);
		expect(points[0]?.haloRadiusMeters).toBe(16_000);
		expect(points[0]?.priorityTier).toBe("high");
		expect(points[0]?.declutterVisible).toBeTrue();
		expect(points[0]?.badgeVisible).toBeTrue();
	});

	it("truncates long flat marker labels for declutter-safe text rendering", () => {
		const points = buildGeoFlatViewOverlayEventPoints({
			events: [{ ...EVENT, title: "Very long geopolitical escalation headline with many words" }],
			bounds: { south: 30, west: 40, north: 40, east: 60 },
			selectedEventId: null,
		});

		expect(points[0]?.labelText).toBe("Very long geopolitica...");
	});

	it("derives symbol short codes and hides low-priority badges", () => {
		const points = buildGeoFlatViewOverlayEventPoints({
			events: [{ ...EVENT, severity: 2, symbol: "rates" }],
			bounds: { south: 30, west: 40, north: 40, east: 60 },
			selectedEventId: null,
		});

		expect(points[0]?.symbolShortCode).toBe("R");
		expect(points[0]?.badgeVisible).toBeFalse();
		expect(points[0]?.haloColor).toEqual([56, 189, 248, 38]);
	});

	it("boosts markers that belong to the selected timeline bucket", () => {
		const points = buildGeoFlatViewOverlayEventPoints({
			events: [EVENT],
			bounds: { south: 30, west: 40, north: 40, east: 60 },
			selectedEventId: null,
			selectedTimelineEventIds: new Set(["evt-1"]),
		});

		expect(points[0]?.timelineFocused).toBeTrue();
		expect(points[0]?.radiusMeters).toBe(12_000);
		expect(points[0]?.haloColor).toEqual([125, 211, 252, 72]);
		expect(points[0]?.labelVisible).toBeTrue();
		expect(points[0]?.badgeVisible).toBeTrue();
	});

	it("keeps selected markers visible and declutters lower-priority tails", () => {
		const events = Array.from({ length: getGeoFlatMarkerDeclutterLimit() + 8 }, (_, index) => ({
			...EVENT,
			id: `evt-${index + 1}`,
			title: `Event ${index + 1}`,
			severity: index === getGeoFlatMarkerDeclutterLimit() + 2 ? 1 : 2,
			updatedAt: `2026-03-${String((index % 9) + 10).padStart(2, "0")}T07:00:00.000Z`,
			coordinates: [{ lat: 35.69 + index * 0.01, lng: 51.39 + index * 0.01 }],
		}));

		const selectedEventId = `evt-${getGeoFlatMarkerDeclutterLimit() + 3}`;
		const points = buildGeoFlatViewOverlayEventPoints({
			events,
			bounds: { south: 20, west: 40, north: 60, east: 80 },
			selectedEventId,
		});

		expect(points).toHaveLength(events.length);
		expect(points.find((point) => point.id === selectedEventId)?.declutterVisible).toBeTrue();
		expect(points.filter((point) => point.declutterVisible)).toHaveLength(
			getGeoFlatMarkerDeclutterLimit(),
		);
	});

	it("maps severity bands to stable overlay colors", () => {
		expect(getGeoFlatViewEventColor(5, false)).toEqual([248, 113, 113, 220]);
		expect(getGeoFlatViewEventColor(4, false)).toEqual([251, 146, 60, 220]);
		expect(getGeoFlatViewEventColor(3, false)).toEqual([250, 204, 21, 210]);
		expect(getGeoFlatViewEventColor(2, false)).toEqual([56, 189, 248, 210]);
		expect(getGeoFlatViewEventColor(2, true)).toEqual([250, 204, 21, 255]);
	});
});
