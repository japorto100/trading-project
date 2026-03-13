import { describe, expect, it } from "bun:test";
import type { GeoFilterStateSnapshot } from "@/features/geopolitical/geo-filter-contract";
import type { GeoContextItem, GeoGameTheoryItem } from "@/features/geopolitical/shell/types";
import { buildVisibleGeoWorkspaceData } from "@/features/geopolitical/visible-geo-workspace";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

const filterSnapshot: GeoFilterStateSnapshot = {
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

const events: GeoEvent[] = [
	{
		id: "event-1",
		title: "Port disruption",
		category: "trade",
		subcategory: "shipping",
		status: "confirmed",
		severity: 4,
		confidence: 3,
		countryCodes: ["EG"],
		regionIds: ["mena"],
		coordinates: [{ lat: 30, lng: 31 }],
		summary: "Port under stress",
		analystNote: "Logistics pressure",
		sources: [],
		assets: [],
		createdAt: "2026-03-10T08:00:00.000Z",
		updatedAt: "2026-03-10T08:05:00.000Z",
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

const candidates: GeoCandidate[] = [
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

const timeline: GeoTimelineEntry[] = [
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

const news: MarketNewsArticle[] = [
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

const contextItems: GeoContextItem[] = [
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

const gameTheoryItems: GeoGameTheoryItem[] = [
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

describe("visible geo workspace", () => {
	it("derives replay-filtered side datasets and contract-filtered events/timeline", () => {
		const result = buildVisibleGeoWorkspaceData({
			events,
			candidates,
			timeline,
			news,
			contextItems,
			gameTheoryItems,
			replayRangeMs: [
				Date.parse("2026-03-10T07:00:00.000Z"),
				Date.parse("2026-03-10T08:45:00.000Z"),
			],
			filterSnapshot,
		});

		expect(result.visibleEvents.map((event) => event.id)).toEqual(["event-1"]);
		expect(result.visibleTimeline.map((entry) => entry.id)).toEqual(["timeline-1"]);
		expect(result.replayFilteredCandidates.map((candidate) => candidate.id)).toEqual([
			"candidate-1",
		]);
		expect(result.visibleCandidates.map((candidate) => candidate.id)).toEqual(["candidate-1"]);
		expect(result.replayFilteredNews.map((article) => article.title)).toEqual(["Port story"]);
		expect(result.visibleNews.map((article) => article.id)).toEqual(["news-1"]);
		expect(result.replayFilteredContextItems.map((item) => item.id)).toEqual(["context-1"]);
		expect(result.visibleContextItems.map((item) => item.id)).toEqual(["context-1"]);
		expect(result.replayFilteredGameTheoryItems.map((item) => item.id)).toEqual(["game-1"]);
		expect(result.visibleGameTheoryItems.map((item) => item.id)).toEqual(["game-1"]);
	});

	it("keeps game-theory items aligned with the currently visible event set", () => {
		const result = buildVisibleGeoWorkspaceData({
			events,
			candidates,
			timeline,
			news,
			contextItems,
			gameTheoryItems: [
				...gameTheoryItems,
				{
					id: "game-2",
					eventId: "event-2",
					eventTitle: "Election rally",
					region: "europe",
					marketBias: "neutral",
					eventDate: "2026-03-10T08:25:00.000Z",
					impactScore: 0.2,
					confidence: 0.4,
					drivers: ["politics"],
					symbols: ["eurusd"],
				},
			],
			replayRangeMs: [
				Date.parse("2026-03-10T07:00:00.000Z"),
				Date.parse("2026-03-10T09:30:00.000Z"),
			],
			filterSnapshot,
		});

		expect(result.visibleEvents.map((event) => event.id)).toEqual(["event-1"]);
		expect(result.replayFilteredGameTheoryItems.map((item) => item.id)).toEqual([
			"game-1",
			"game-2",
		]);
		expect(result.visibleGameTheoryItems.map((item) => item.id)).toEqual(["game-1"]);
	});

	it("keeps region-tagged context items aligned with the active region filter", () => {
		const result = buildVisibleGeoWorkspaceData({
			events,
			candidates,
			timeline,
			news,
			contextItems: [
				...contextItems,
				{
					id: "context-2",
					source: "crisiswatch",
					title: "Europe context",
					summary: "Europe summary",
					url: "https://example.com/europe",
					publishedAt: "2026-03-10T08:35:00.000Z",
					region: "europe",
				},
			],
			gameTheoryItems,
			replayRangeMs: [
				Date.parse("2026-03-10T07:00:00.000Z"),
				Date.parse("2026-03-10T09:30:00.000Z"),
			],
			filterSnapshot,
		});

		expect(result.replayFilteredContextItems.map((item) => item.id)).toEqual([
			"context-1",
			"context-2",
		]);
		expect(result.visibleContextItems.map((item) => item.id)).toEqual(["context-1"]);
	});

	it("keeps candidates and news aligned with the shared search and region contract", () => {
		const result = buildVisibleGeoWorkspaceData({
			events,
			candidates: [
				...candidates,
				{
					id: "candidate-2",
					generatedAt: "2026-03-10T08:20:00.000Z",
					triggerType: "manual_import",
					confidence: 0.6,
					severityHint: 2,
					headline: "Election candidate",
					regionHint: "europe",
					countryHints: ["FR"],
					sourceRefs: [],
					state: "open",
				},
			],
			timeline,
			news: [
				...news,
				{
					id: "news-2",
					provider: "reddit",
					source: "Forum",
					title: "Election thread",
					summary: "Political chatter only",
					url: "https://example.com/election",
					publishedAt: "2026-03-10T08:12:00.000Z",
					sentiment: "neutral",
				},
			],
			contextItems,
			gameTheoryItems,
			replayRangeMs: [
				Date.parse("2026-03-10T07:00:00.000Z"),
				Date.parse("2026-03-10T09:30:00.000Z"),
			],
			filterSnapshot,
		});

		expect(result.replayFilteredCandidates.map((candidate) => candidate.id)).toEqual([
			"candidate-1",
			"candidate-2",
		]);
		expect(result.visibleCandidates.map((candidate) => candidate.id)).toEqual(["candidate-1"]);
		expect(result.replayFilteredNews.map((article) => article.id)).toEqual(["news-1", "news-2"]);
		expect(result.visibleNews.map((article) => article.id)).toEqual(["news-1"]);
	});
});
