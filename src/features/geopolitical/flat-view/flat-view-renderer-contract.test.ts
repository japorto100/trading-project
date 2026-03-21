import { describe, expect, it } from "bun:test";
import { buildGeoFlatViewRendererContract } from "@/features/geopolitical/flat-view/flat-view-renderer-contract";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view/flat-view-state";
import type { GeoEvent } from "@/lib/geopolitical/types";

const STATE: GeoFlatViewState = {
	viewMode: "flat",
	renderer: "deckgl-maplibre",
	mapBody: "earth",
	reason: "story",
	bounds: { south: 30, west: 40, north: 40, east: 60 },
	focus: { kind: "event", id: "evt-1", regionId: "middle-east" },
	filterSnapshot: {
		eventsSource: "acled",
		activeRegionId: "middle-east",
		searchQuery: "tehran",
		minSeverityFilter: 3,
		acledCountryFilter: "IR",
		acledRegionFilter: "middle-east",
		acledEventTypeFilter: "",
		acledSubEventTypeFilter: "",
		acledFromFilter: "",
		acledToFilter: "",
	},
	layerFamilies: ["geo-core", "conflict", "context"],
	layerHints: ["geo-core", "conflict", "context", "story"],
	temporal: {
		viewRangeMs: [Date.parse("2026-03-12T08:00:00.000Z"), Date.parse("2026-03-12T18:00:00.000Z")],
		filterRangeMs: [Date.parse("2026-03-12T09:30:00.000Z"), Date.parse("2026-03-12T12:30:00.000Z")],
		selectedTimeMs: Date.parse("2026-03-12T10:10:00.000Z"),
	},
	basemapPolicy: {
		richness: "detailed",
		mapLibreAllowed: true,
		pmtilesAllowed: true,
		minimumFeatures: ["place", "water", "waterway"],
		optionalFeatures: ["roads", "admin-detail", "terrain"],
	},
	pmtilesPreferred: true,
};

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
		assets: [],
		createdAt: "2026-03-12T06:00:00.000Z",
		updatedAt: "2026-03-12T06:00:00.000Z",
		validFrom: "2026-03-12T09:00:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "missile",
	},
];

describe("flat-view-renderer-contract", () => {
	it("builds one shared renderer contract from flat state and visible events", () => {
		const contract = buildGeoFlatViewRendererContract({
			state: STATE,
			events: EVENTS,
			selectedEventId: "evt-1",
			overlayChrome: {
				showFilters: true,
				showLegend: true,
				showTimeline: true,
			},
		});

		expect(contract.renderer).toBe("deckgl-maplibre");
		expect(contract.bounds).toEqual({ south: 30, west: 40, north: 40, east: 60 });
		expect(contract.basemapPolicy.richness).toBe("detailed");
		expect(contract.focus).toEqual({ kind: "event", id: "evt-1", regionId: "middle-east" });
		expect(contract.layerFamilies).toEqual(["geo-core", "conflict", "context"]);
		expect(contract.layerDefinitions).toEqual([
			{
				id: "geo-core",
				label: "Geo Core",
				placement: "shared",
				supportedViews: ["globe", "flat"],
				description:
					"Analystisch zentrale, geolokalisierte Ereignisse und orientierende Kernsignale, die in Globe und Flat gleich bleiben sollen.",
			},
			{
				id: "conflict",
				label: "Conflict",
				placement: "flat-first",
				supportedViews: ["flat"],
				description:
					"Dichte Konfliktobjekte wie Strikes, Threat Zones, Assets, Targets und Replay-Arcs, primär für den operativen Flat-Modus.",
			},
			{
				id: "context",
				label: "Context",
				placement: "shared",
				supportedViews: ["globe", "flat"],
				description:
					"Kontextuelle News-, Narrative- und Analystenhinweise, die nur bei aktivem Drilldown stärker sichtbar werden.",
			},
		]);
		expect(contract.flatLayerOptions.map((option) => option.id)).toEqual([
			"events",
			"flights",
			"vessels",
			"surveillance",
			"orbital",
			"rf",
			"infra",
			"strikes",
			"missiles",
			"targets",
			"assets",
			"zones",
			"heat",
			"arcs",
			"paths",
			"rings",
			"hexbin",
			"region-news",
			"analyst-notes",
		]);
		expect(contract.activeFlatLayerOptionIds).toEqual(
			contract.flatLayerOptions.map((option) => option.id),
		);
		expect(contract.flatLayerMatrix.find((entry) => entry.optionId === "events")).toEqual({
			optionId: "events",
			label: "Events",
			family: "geo-core",
			placementMode: "overlay",
			visibilityMode: "default-on",
			selectionMode: "map-select",
			sourceRefs: ["pharos-ai"],
		});
		expect(contract.flatLayerMatrix.find((entry) => entry.optionId === "region-news")).toEqual({
			optionId: "region-news",
			label: "Region News",
			family: "context",
			placementMode: "hybrid",
			visibilityMode: "toggle-only",
			selectionMode: "hybrid-select",
			sourceRefs: ["worldwideview", "GeoSentinel"],
		});
		expect(contract.overlayChrome).toEqual({
			showFilters: true,
			showLegend: true,
			showTimeline: true,
		});
		expect(contract.boundsGeoJson.features).toHaveLength(1);
		expect(contract.eventPoints).toEqual([
			{
				id: "evt-1",
				title: "Missile launch",
				labelText: "Missile launch",
				severity: 4,
				coordinates: [51.39, 35.69],
				selected: true,
				timelineFocused: false,
				radiusMeters: 12000,
				haloRadiusMeters: 22000,
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
		expect(contract.conflictLayers.strikes).toEqual([
			{
				id: "strike-evt-1",
				eventId: "evt-1",
				title: "Missile launch",
				severity: 4,
				coordinates: [51.39, 35.69],
				selected: true,
			},
		]);
		expect(contract.conflictLayers.targets).toEqual([]);
		expect(contract.conflictLayers.assets).toEqual([]);
		expect(contract.conflictLayers.zones.features).toEqual([]);
		expect(contract.conflictLayers.heat).toEqual([
			{
				id: "heat-36:51",
				coordinates: [51.39, 35.69],
				eventIds: ["evt-1"],
				intensity: 4,
				maxSeverity: 4,
			},
		]);
		expect(contract.timelineModel.conflictLayerActive).toBeTrue();
		expect(
			contract.timelineModel.buckets.some((bucket) => bucket.eventIds.includes("evt-1")),
		).toBeTrue();
	});

	it("preserves shell-driven overlay chrome flags inside the shared renderer contract", () => {
		const contract = buildGeoFlatViewRendererContract({
			state: STATE,
			events: EVENTS,
			selectedEventId: null,
			overlayChrome: {
				showFilters: false,
				showLegend: true,
				showTimeline: false,
			},
		});

		expect(contract.overlayChrome).toEqual({
			showFilters: false,
			showLegend: true,
			showTimeline: false,
		});
	});

	it("keeps data-layer payloads stable when only overlay chrome visibility changes", () => {
		const visibleChromeContract = buildGeoFlatViewRendererContract({
			state: STATE,
			events: EVENTS,
			selectedEventId: "evt-1",
			overlayChrome: {
				showFilters: true,
				showLegend: true,
				showTimeline: true,
			},
		});
		const hiddenChromeContract = buildGeoFlatViewRendererContract({
			state: STATE,
			events: EVENTS,
			selectedEventId: "evt-1",
			overlayChrome: {
				showFilters: false,
				showLegend: false,
				showTimeline: false,
			},
		});

		expect(hiddenChromeContract.overlayChrome).toEqual({
			showFilters: false,
			showLegend: false,
			showTimeline: false,
		});
		expect(hiddenChromeContract.boundsGeoJson).toEqual(visibleChromeContract.boundsGeoJson);
		expect(hiddenChromeContract.eventPoints).toEqual(visibleChromeContract.eventPoints);
		expect(hiddenChromeContract.conflictLayers).toEqual(visibleChromeContract.conflictLayers);
		expect(hiddenChromeContract.timelineModel).toEqual(visibleChromeContract.timelineModel);
		expect(hiddenChromeContract.layerFamilies).toEqual(visibleChromeContract.layerFamilies);
		expect(hiddenChromeContract.layerDefinitions).toEqual(visibleChromeContract.layerDefinitions);
	});

	it("keeps conflict timeline diagnostics disabled when the flat contract has no conflict family", () => {
		const contract = buildGeoFlatViewRendererContract({
			state: {
				...STATE,
				layerFamilies: ["geo-core", "context"],
				layerHints: ["geo-core", "context"],
			},
			events: EVENTS,
			selectedEventId: "evt-1",
			overlayChrome: {
				showFilters: true,
				showLegend: true,
				showTimeline: true,
			},
		});

		expect(contract.layerFamilies).toEqual(["geo-core", "context"]);
		expect(contract.timelineModel.conflictLayerActive).toBeFalse();
		expect(contract.timelineModel.buckets).toEqual([]);
	});

	it("filters active flat layer options down to the visible family matrix", () => {
		const contract = buildGeoFlatViewRendererContract({
			state: STATE,
			events: EVENTS,
			selectedEventId: "evt-1",
			activeLayerOptionIds: ["events", "strikes", "heat", "panel-signals"],
			overlayChrome: {
				showFilters: true,
				showLegend: true,
				showTimeline: true,
			},
		});

		expect(contract.activeFlatLayerOptionIds).toEqual(["events", "strikes", "heat"]);
		expect(contract.flatLayerOptions.some((option) => option.id === "panel-signals")).toBeFalse();
	});
});
