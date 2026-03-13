import { describe, expect, it } from "bun:test";
import {
	buildGeoFilterChips,
	filterGeoCandidatesByFilters,
	filterGeoEventsByFilters,
	filterGeoNewsByFilters,
	filterGeoTimelineByVisibleEvents,
	type GeoFilterStateSnapshot,
	matchesGeoCandidateFilters,
	matchesGeoEventFilters,
} from "@/features/geopolitical/geo-filter-contract";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

const baseEvent: GeoEvent = {
	id: "event-1",
	title: "Port disruption",
	category: "trade",
	subcategory: "shipping",
	status: "confirmed",
	severity: 4,
	confidence: 3,
	countryCodes: ["EG"],
	regionIds: ["mena"],
	coordinates: [{ lat: 30.04, lng: 31.24 }],
	summary: "Canal-related disruption under review.",
	analystNote: "Freight pressure rising.",
	sources: [],
	assets: [],
	createdAt: "2026-03-10T08:00:00.000Z",
	updatedAt: "2026-03-10T08:10:00.000Z",
	createdBy: "system",
	updatedBy: "system",
	symbol: "shipping",
	externalSource: "acled",
	externalRegion: "Middle East",
	externalEventType: "Protests",
	externalSubEventType: "Violent demonstration",
};

const timeline: GeoTimelineEntry[] = [
	{
		id: "timeline-1",
		eventId: "event-1",
		action: "created",
		actor: "analyst",
		at: "2026-03-10T08:00:00.000Z",
		diffSummary: "Created event",
	},
	{
		id: "timeline-2",
		eventId: "event-2",
		action: "status_changed",
		actor: "analyst",
		at: "2026-03-11T09:00:00.000Z",
		diffSummary: "Updated event",
	},
];

const candidate: GeoCandidate = {
	id: "candidate-1",
	generatedAt: "2026-03-10T08:30:00.000Z",
	triggerType: "news_cluster",
	confidence: 0.8,
	severityHint: 4,
	headline: "Port disruption candidate",
	regionHint: "mena",
	countryHints: ["EG"],
	sourceRefs: [],
	state: "open",
	category: "trade",
	symbol: "shipping",
};

const newsArticles: MarketNewsArticle[] = [
	{
		id: "news-1",
		provider: "gnews",
		source: "Example",
		title: "Port disruption raises freight risk",
		summary: "Shipping lanes remain under stress.",
		url: "https://example.com/port",
		publishedAt: "2026-03-10T08:10:00.000Z",
	},
	{
		id: "news-2",
		provider: "reddit",
		source: "Forum",
		title: "Domestic politics update",
		summary: "Election coverage only.",
		url: "https://example.com/politics",
		publishedAt: "2026-03-10T09:10:00.000Z",
	},
];

describe("geo filter contract", () => {
	it("builds local and external chip descriptors consistently", () => {
		const localSnapshot: GeoFilterStateSnapshot = {
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
		const externalSnapshot: GeoFilterStateSnapshot = {
			...localSnapshot,
			eventsSource: "acled",
			activeRegionId: "",
			acledCountryFilter: "EG",
			acledRegionFilter: "Middle East",
		};

		expect(buildGeoFilterChips(localSnapshot).map((chip) => chip.key)).toEqual([
			"local-region",
			"local-q",
			"local-severity",
		]);
		expect(buildGeoFilterChips(externalSnapshot).map((chip) => chip.key)).toContain(
			"acled-country",
		);
		expect(buildGeoFilterChips(externalSnapshot).map((chip) => chip.key)).toContain(
			"acled-severity",
		);
	});

	it("matches local events with region, severity and search constraints", () => {
		const snapshot: GeoFilterStateSnapshot = {
			eventsSource: "local",
			activeRegionId: "mena",
			searchQuery: "freight",
			minSeverityFilter: 4,
			acledCountryFilter: "",
			acledRegionFilter: "",
			acledEventTypeFilter: "",
			acledSubEventTypeFilter: "",
			acledFromFilter: "",
			acledToFilter: "",
		};

		expect(matchesGeoEventFilters(baseEvent, snapshot)).toBe(true);
		expect(
			matchesGeoEventFilters(baseEvent, {
				...snapshot,
				activeRegionId: "europe",
			}),
		).toBe(false);
	});

	it("matches external events with ACLED-style constraints", () => {
		const snapshot: GeoFilterStateSnapshot = {
			eventsSource: "acled",
			activeRegionId: "",
			searchQuery: "violent",
			minSeverityFilter: 3,
			acledCountryFilter: "EG",
			acledRegionFilter: "middle",
			acledEventTypeFilter: "protest",
			acledSubEventTypeFilter: "violent",
			acledFromFilter: "2026-03-01",
			acledToFilter: "2026-03-31",
		};

		expect(matchesGeoEventFilters(baseEvent, snapshot)).toBe(true);
		expect(
			matchesGeoEventFilters(baseEvent, {
				...snapshot,
				acledCountryFilter: "US",
			}),
		).toBe(false);
		expect(
			matchesGeoEventFilters(baseEvent, {
				...snapshot,
				acledToFilter: "2026-03-01",
			}),
		).toBe(false);
	});

	it("filters visible events through the shared contract", () => {
		const snapshot: GeoFilterStateSnapshot = {
			eventsSource: "local",
			activeRegionId: "mena",
			searchQuery: "freight",
			minSeverityFilter: 4,
			acledCountryFilter: "",
			acledRegionFilter: "",
			acledEventTypeFilter: "",
			acledSubEventTypeFilter: "",
			acledFromFilter: "",
			acledToFilter: "",
		};

		expect(filterGeoEventsByFilters([baseEvent], snapshot)).toEqual([baseEvent]);
		expect(
			filterGeoEventsByFilters([baseEvent], {
				...snapshot,
				searchQuery: "nonexistent",
			}),
		).toEqual([]);
	});

	it("matches and filters candidates through the shared contract", () => {
		const snapshot: GeoFilterStateSnapshot = {
			eventsSource: "local",
			activeRegionId: "mena",
			searchQuery: "shipping",
			minSeverityFilter: 4,
			acledCountryFilter: "",
			acledRegionFilter: "",
			acledEventTypeFilter: "",
			acledSubEventTypeFilter: "",
			acledFromFilter: "",
			acledToFilter: "",
		};

		expect(matchesGeoCandidateFilters(candidate, snapshot)).toBe(true);
		expect(
			matchesGeoCandidateFilters(candidate, {
				...snapshot,
				activeRegionId: "europe",
			}),
		).toBe(false);
		expect(filterGeoCandidatesByFilters([candidate], snapshot)).toEqual([candidate]);
		expect(
			filterGeoCandidatesByFilters([candidate], {
				...snapshot,
				searchQuery: "energy",
			}),
		).toEqual([]);
	});

	it("filters visible news by the shared search contract", () => {
		const snapshot: GeoFilterStateSnapshot = {
			eventsSource: "local",
			activeRegionId: "mena",
			searchQuery: "freight",
			minSeverityFilter: 1,
			acledCountryFilter: "",
			acledRegionFilter: "",
			acledEventTypeFilter: "",
			acledSubEventTypeFilter: "",
			acledFromFilter: "",
			acledToFilter: "",
		};

		expect(filterGeoNewsByFilters(newsArticles, snapshot).map((article) => article.id)).toEqual([
			"news-1",
		]);
	});

	it("filters timeline entries to the currently visible event set", () => {
		expect(filterGeoTimelineByVisibleEvents(timeline, [baseEvent])).toEqual([timeline[0]]);
		expect(filterGeoTimelineByVisibleEvents(timeline, [])).toEqual([]);
	});
});
