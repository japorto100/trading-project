import { describe, expect, it } from "bun:test";
import { buildGeoFlatViewConflictLayers } from "@/features/geopolitical/flat-view-conflict-layers";
import type { GeoEvent } from "@/lib/geopolitical/types";

const EVENTS: GeoEvent[] = [
	{
		id: "evt-1",
		title: "Missile strike near Tehran",
		category: "conflict",
		status: "confirmed",
		severity: 5,
		confidence: 3,
		countryCodes: ["IR"],
		regionIds: ["middle-east"],
		coordinates: [
			{ lat: 35.69, lng: 51.39 },
			{ lat: 35.52, lng: 51.12 },
		],
		sources: [],
		assets: [
			{
				id: "asset-1",
				symbol: "XAUUSD",
				assetClass: "commodity",
				relation: "hedge",
				weight: 0.8,
			},
		],
		createdAt: "2026-03-12T07:00:00.000Z",
		updatedAt: "2026-03-12T07:00:00.000Z",
		validFrom: "2026-03-12T09:00:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "missile",
	},
	{
		id: "evt-2",
		title: "Airbase disruption",
		category: "conflict",
		status: "confirmed",
		severity: 4,
		confidence: 3,
		countryCodes: ["IR"],
		regionIds: ["middle-east"],
		coordinates: [{ lat: 35.61, lng: 51.24 }],
		sources: [],
		assets: [
			{
				id: "asset-2",
				symbol: "BTCUSD",
				assetClass: "crypto",
				relation: "beneficiary",
			},
		],
		createdAt: "2026-03-12T08:00:00.000Z",
		updatedAt: "2026-03-12T08:00:00.000Z",
		validFrom: "2026-03-12T10:00:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "airbase",
	},
	{
		id: "evt-3",
		title: "Low severity narrative shift",
		category: "context",
		status: "confirmed",
		severity: 2,
		confidence: 2,
		countryCodes: ["TR"],
		regionIds: ["middle-east"],
		coordinates: [{ lat: 41.01, lng: 28.97 }],
		sources: [],
		assets: [],
		createdAt: "2026-03-12T09:00:00.000Z",
		updatedAt: "2026-03-12T09:00:00.000Z",
		validFrom: "2026-03-12T11:00:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "narrative",
	},
];

describe("flat-view-conflict-layers", () => {
	it("builds strike, asset, zone and heat payloads from visible conflict events", () => {
		const layers = buildGeoFlatViewConflictLayers({
			events: EVENTS,
			bounds: { south: 30, west: 45, north: 38, east: 54 },
			selectedEventId: "evt-1",
		});

		expect(layers.strikes).toEqual([
			{
				id: "strike-evt-1",
				eventId: "evt-1",
				title: "Missile strike near Tehran",
				severity: 5,
				coordinates: [51.39, 35.69],
				selected: true,
			},
			{
				id: "strike-evt-2",
				eventId: "evt-2",
				title: "Airbase disruption",
				severity: 4,
				coordinates: [51.24, 35.61],
				selected: false,
			},
		]);
		expect(layers.assets).toEqual([
			{
				id: "evt-1:asset-1",
				eventId: "evt-1",
				symbol: "XAUUSD",
				assetClass: "commodity",
				relation: "hedge",
				coordinates: [51.39, 35.69],
				weight: 0.8,
			},
			{
				id: "evt-2:asset-2",
				eventId: "evt-2",
				symbol: "BTCUSD",
				assetClass: "crypto",
				relation: "beneficiary",
				coordinates: [51.24, 35.61],
				weight: null,
			},
		]);
		expect(layers.targets).toEqual([
			{
				id: "target-evt-1-1",
				eventId: "evt-1",
				title: "Missile strike near Tehran",
				severity: 5,
				coordinates: [51.12, 35.52],
				index: 1,
			},
		]);
		expect(layers.zones.features).toHaveLength(1);
		expect(layers.zones.features[0]?.properties).toEqual({
			id: "zone-evt-1",
			eventId: "evt-1",
			title: "Missile strike near Tehran",
			severity: 5,
			pointCount: 2,
		});
		expect(layers.heat).toHaveLength(1);
		expect(layers.heat[0]).toEqual({
			id: "heat-36:51",
			coordinates: [51.39, 35.69],
			eventIds: ["evt-1", "evt-2"],
			intensity: 9,
			maxSeverity: 5,
		});
	});

	it("filters out events outside bounds and ignores low-severity strike payloads", () => {
		const layers = buildGeoFlatViewConflictLayers({
			events: EVENTS,
			bounds: { south: 34, west: 50, north: 36, east: 52 },
			selectedEventId: null,
		});

		expect(layers.strikes.map((strike) => strike.eventId)).toEqual(["evt-1", "evt-2"]);
		expect(layers.targets.map((target) => target.eventId)).toEqual(["evt-1"]);
		expect(layers.assets.map((asset) => asset.eventId)).toEqual(["evt-1", "evt-2"]);
		expect(layers.zones.features).toHaveLength(1);
		expect(layers.heat.every((cell) => cell.eventIds.every((id) => id !== "evt-3"))).toBeTrue();
	});
});
