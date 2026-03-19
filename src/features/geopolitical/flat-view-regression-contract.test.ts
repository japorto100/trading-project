import { describe, expect, it } from "bun:test";
import { buildGeoFlatViewHandoffFromEvent } from "@/features/geopolitical/flat-view-handoff";
import { buildGeoFlatViewRendererContract } from "@/features/geopolitical/flat-view-renderer-contract";
import { buildGeoFlatViewStateFromHandoff } from "@/features/geopolitical/flat-view-state";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import type { GeoContextItem, GeoGameTheoryItem } from "@/features/geopolitical/shell/types";
import { buildVisibleGeoWorkspaceData } from "@/features/geopolitical/visible-geo-workspace";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

const FILTER_SNAPSHOT: GeoFilterStateSnapshot = {
	eventsSource: "local",
	activeRegionId: "mena",
	searchQuery: "port",
	minSeverityFilter: 3,
	acledCountryFilter: "",
	acledRegionFilter: "",
	acledEventTypeFilter: "",
	acledSubEventTypeFilter: "",
	acledFromFilter: "",
	acledToFilter: "",
};

const EVENTS: GeoEvent[] = [
	{
		id: "event-1",
		title: "Port disruption",
		category: "conflict",
		subcategory: "shipping",
		status: "confirmed",
		severity: 4,
		confidence: 3,
		countryCodes: ["EG"],
		regionIds: ["mena"],
		coordinates: [
			{ lat: 30, lng: 31 },
			{ lat: 30.4, lng: 31.5 },
		],
		summary: "Port under stress",
		analystNote: "Logistics pressure",
		sources: [],
		assets: [
			{
				id: "asset-1",
				symbol: "XAUUSD",
				assetClass: "commodity",
				relation: "hedge",
				weight: 0.7,
			},
		],
		createdAt: "2026-03-10T08:00:00.000Z",
		updatedAt: "2026-03-10T08:05:00.000Z",
		validFrom: "2026-03-10T08:15:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "shipping",
	},
	{
		id: "event-2",
		title: "Election rally",
		category: "politics",
		status: "confirmed",
		severity: 2,
		confidence: 2,
		countryCodes: ["FR"],
		regionIds: ["europe"],
		coordinates: [{ lat: 48.85, lng: 2.35 }],
		sources: [],
		assets: [],
		createdAt: "2026-03-10T09:00:00.000Z",
		updatedAt: "2026-03-10T09:10:00.000Z",
		createdBy: "system",
		updatedBy: "system",
		symbol: "policy",
	},
];

const CANDIDATES: GeoCandidate[] = [
	{
		id: "candidate-1",
		generatedAt: "2026-03-10T08:30:00.000Z",
		triggerType: "manual_import",
		confidence: 0.8,
		severityHint: 3,
		headline: "Port candidate headline",
		sourceRefs: [],
		state: "open",
	},
];

const TIMELINE: GeoTimelineEntry[] = [
	{
		id: "timeline-1",
		eventId: "event-1",
		action: "created",
		actor: "system",
		at: "2026-03-10T08:00:00.000Z",
		diffSummary: "Created",
	},
	{
		id: "timeline-2",
		eventId: "event-2",
		action: "created",
		actor: "system",
		at: "2026-03-10T09:00:00.000Z",
		diffSummary: "Created",
	},
];

const NEWS: MarketNewsArticle[] = [
	{
		id: "news-1",
		provider: "gnews",
		source: "Example",
		title: "Port story",
		summary: "Port summary",
		url: "https://example.com/port",
		publishedAt: "2026-03-10T08:10:00.000Z",
		sentiment: "neutral",
	},
];

const CONTEXT_ITEMS: GeoContextItem[] = [
	{
		id: "context-1",
		source: "cfr",
		title: "Context item",
		summary: "Context summary",
		url: "https://example.com/context",
		publishedAt: "2026-03-10T08:15:00.000Z",
		region: "mena",
	},
];

const GAME_THEORY_ITEMS: GeoGameTheoryItem[] = [
	{
		id: "game-1",
		eventId: "event-1",
		eventTitle: "Port disruption",
		region: "mena",
		marketBias: "risk_off",
		eventDate: "2026-03-10T08:20:00.000Z",
		impactScore: 0.6,
		confidence: 0.8,
		drivers: ["shipping"],
		symbols: ["shipping"],
	},
];

describe("flat-view regression contract", () => {
	it("keeps the flat renderer contract aligned with the replay- and filter-derived globe workspace", () => {
		const replayRangeMs: [number, number] = [
			Date.parse("2026-03-10T07:00:00.000Z"),
			Date.parse("2026-03-10T08:45:00.000Z"),
		];
		const visibleWorkspace = buildVisibleGeoWorkspaceData({
			events: EVENTS,
			candidates: CANDIDATES,
			timeline: TIMELINE,
			news: NEWS,
			contextItems: CONTEXT_ITEMS,
			gameTheoryItems: GAME_THEORY_ITEMS,
			replayRangeMs,
			filterSnapshot: FILTER_SNAPSHOT,
		});

		expect(visibleWorkspace.visibleEvents.map((event) => event.id)).toEqual(["event-1"]);
		expect(visibleWorkspace.visibleTimeline.map((entry) => entry.id)).toEqual(["timeline-1"]);

		const selectedEvent = visibleWorkspace.visibleEvents[0];
		if (!selectedEvent) {
			throw new Error("expected a selected event in the visible workspace");
		}

		const handoff = buildGeoFlatViewHandoffFromEvent({
			event: selectedEvent,
			filterSnapshot: FILTER_SNAPSHOT,
			viewRangeMs: replayRangeMs,
			filterRangeMs: replayRangeMs,
			selectedTimeMs: Date.parse("2026-03-10T08:20:00.000Z"),
			mapBody: "earth",
		});
		const flatState = buildGeoFlatViewStateFromHandoff(handoff);
		const contract = buildGeoFlatViewRendererContract({
			state: flatState,
			events: visibleWorkspace.visibleEvents,
			selectedEventId: selectedEvent.id,
			overlayChrome: {
				showFilters: true,
				showLegend: true,
				showTimeline: true,
			},
		});

		expect(contract.focus).toEqual({
			kind: "event",
			id: "event-1",
			regionId: "mena",
		});
		expect(contract.eventPoints.map((point) => point.id)).toEqual(
			visibleWorkspace.visibleEvents.map((event) => event.id),
		);
		expect(contract.conflictLayers.strikes.map((strike) => strike.eventId)).toEqual(["event-1"]);
		expect(contract.conflictLayers.targets.map((target) => target.eventId)).toEqual(["event-1"]);
		expect(contract.conflictLayers.assets.map((asset) => asset.eventId)).toEqual(["event-1"]);
		expect(contract.timelineModel.buckets.filter((bucket) => bucket.count > 0)).toEqual([
			{
				startMs: Date.parse("2026-03-10T08:00:00.000Z"),
				endMs: Date.parse("2026-03-10T08:45:00.000Z"),
				count: 1,
				maxSeverity: 4,
				strikeCount: 1,
				targetCount: 1,
				assetCount: 1,
				heatIntensity: 4,
				eventIds: ["event-1"],
				inFilterRange: true,
				containsSelectedTime: true,
			},
		]);
	});
});
