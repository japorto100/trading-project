import { describe, expect, it } from "bun:test";
import {
	buildGeoFlatViewOverlayBoundsCollection,
	buildGeoFlatViewOverlayEventPoints,
	getGeoFlatViewEventColor,
} from "@/features/geopolitical/flat-view-overlay-payload";
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
				severity: 4,
				coordinates: [51.39, 35.69],
				selected: true,
				radiusMeters: 12_000,
				fillColor: [250, 204, 21, 255],
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
		expect(points[0]?.selected).toBeFalse();
		expect(points[0]?.radiusMeters).toBe(8_000);
	});

	it("maps severity bands to stable overlay colors", () => {
		expect(getGeoFlatViewEventColor(5, false)).toEqual([248, 113, 113, 220]);
		expect(getGeoFlatViewEventColor(4, false)).toEqual([251, 146, 60, 220]);
		expect(getGeoFlatViewEventColor(3, false)).toEqual([250, 204, 21, 210]);
		expect(getGeoFlatViewEventColor(2, false)).toEqual([56, 189, 248, 210]);
		expect(getGeoFlatViewEventColor(2, true)).toEqual([250, 204, 21, 255]);
	});
});
