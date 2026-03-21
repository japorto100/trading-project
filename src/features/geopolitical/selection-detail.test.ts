import { describe, expect, it } from "bun:test";
import type {
	GeoFlatViewConflictHeatCell,
	GeoFlatViewConflictZoneFeature,
} from "@/features/geopolitical/flat-view/flat-view-conflict-layers";
import {
	buildGeoCandidateSelectionDetail,
	buildGeoConflictAssetSelectionDetail,
	buildGeoConflictHeatSelectionDetail,
	buildGeoConflictStrikeSelectionDetail,
	buildGeoConflictTargetSelectionDetail,
	buildGeoConflictZoneSelectionDetail,
	buildGeoContextSelectionDetail,
	buildGeoEventSelectionDetail,
	buildGeoNewsSelectionDetail,
	buildGeoTimelineSelectionDetail,
} from "@/features/geopolitical/selection-detail";
import type { GeoContextItem } from "@/features/geopolitical/shell/types";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

describe("geo selection detail helpers", () => {
	it("builds a shared event selection summary", () => {
		const event = {
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
			sources: [],
			assets: [],
			createdAt: "2026-03-10T08:00:00.000Z",
			updatedAt: "2026-03-10T08:10:00.000Z",
			createdBy: "system",
			updatedBy: "system",
			symbol: "shipping",
			externalSource: "acled",
			summary: "Canal-related disruption under review.",
		} satisfies GeoEvent;

		const detail = buildGeoEventSelectionDetail(event);

		expect(detail.kind).toBe("event");
		expect(detail.title).toBe("Port disruption");
		expect(detail.subtitle).toBe("trade / shipping");
		expect(detail.primaryMeta).toEqual(["confirmed", "S4", "C3", "shipping"]);
		expect(detail.secondaryMeta).toContain("EG");
		expect(detail.secondaryMeta).toContain("30.04, 31.24");
		expect(detail.secondaryMeta).toContain("acled");
	});

	it("builds a shared timeline selection summary", () => {
		const entry = {
			id: "timeline-1",
			eventId: "event-1",
			action: "status_changed",
			actor: "analyst",
			at: "2026-03-10T10:00:00.000Z",
			diffSummary: "Status raised to persistent.",
		} satisfies GeoTimelineEntry;

		const detail = buildGeoTimelineSelectionDetail(entry);

		expect(detail.kind).toBe("timeline");
		expect(detail.title).toBe("Status Changed");
		expect(detail.linkedEventId).toBe("event-1");
		expect(detail.subtitle).toBe("event event-1");
		expect(detail.summary).toBe("Status raised to persistent.");
		expect(detail.primaryMeta[0]).toBe("analyst");
		expect(detail.secondaryMeta).toEqual(["status_changed"]);
	});

	it("builds a shared candidate selection summary", () => {
		const candidate = {
			id: "candidate-1",
			generatedAt: "2026-03-10T08:30:00.000Z",
			triggerType: "news_cluster",
			confidence: 0.82,
			severityHint: 4,
			headline: "Port disruption candidate",
			regionHint: "mena",
			countryHints: ["EG"],
			sourceRefs: [],
			state: "open",
			category: "trade",
			symbol: "shipping",
			routeTarget: "geo",
			reviewAction: "human_review",
		} satisfies GeoCandidate;

		const detail = buildGeoCandidateSelectionDetail(candidate);

		expect(detail.kind).toBe("candidate");
		expect(detail.title).toBe("Port disruption candidate");
		expect(detail.subtitle).toBe("news cluster");
		expect(detail.primaryMeta).toContain("open");
		expect(detail.primaryMeta).toContain("S4");
		expect(detail.secondaryMeta).toContain("mena • EG");
		expect(detail.secondaryMeta).toContain("trade");
		expect(detail.secondaryMeta).toContain("shipping");
	});

	it("builds a shared context selection summary", () => {
		const item = {
			id: "context-1",
			source: "cfr",
			title: "Conflict explainer",
			url: "https://example.com/context",
			summary: "Context summary",
			publishedAt: "2026-03-10T08:15:00.000Z",
			region: "mena",
		} satisfies GeoContextItem;

		const detail = buildGeoContextSelectionDetail(item);

		expect(detail.kind).toBe("context");
		expect(detail.title).toBe("Conflict explainer");
		expect(detail.subtitle).toBe("CFR");
		expect(detail.primaryMeta).toContain("CFR");
		expect(detail.secondaryMeta).toEqual(["mena"]);
	});

	it("builds a shared news selection summary", () => {
		const article = {
			id: "news-1",
			provider: "gnews",
			source: "Example",
			title: "Port disruption raises freight risk",
			url: "https://example.com/port",
			publishedAt: "2026-03-10T08:10:00.000Z",
			summary: "Shipping lanes remain under stress.",
			sentiment: "neutral",
		} satisfies MarketNewsArticle;

		const detail = buildGeoNewsSelectionDetail(article);

		expect(detail.kind).toBe("news");
		expect(detail.title).toBe("Port disruption raises freight risk");
		expect(detail.subtitle).toBe("Example");
		expect(detail.primaryMeta).toContain("gnews");
		expect(detail.secondaryMeta).toEqual(["neutral"]);
	});

	it("builds shared conflict selection summaries", () => {
		const strikeDetail = buildGeoConflictStrikeSelectionDetail({
			id: "strike-1",
			eventId: "event-1",
			title: "Port disruption",
			severity: 4,
			coordinates: [31.24, 30.04],
			selected: true,
		});
		const targetDetail = buildGeoConflictTargetSelectionDetail({
			id: "target-1",
			eventId: "event-1",
			title: "Port disruption",
			severity: 4,
			coordinates: [31.5, 30.4],
			index: 1,
		});
		const assetDetail = buildGeoConflictAssetSelectionDetail({
			id: "event-1:asset-1",
			eventId: "event-1",
			symbol: "XAUUSD",
			assetClass: "commodity",
			relation: "hedge",
			coordinates: [31.24, 30.04],
			weight: 0.7,
		});
		const zoneDetail = buildGeoConflictZoneSelectionDetail({
			type: "Feature",
			properties: {
				id: "zone-event-1",
				eventId: "event-1",
				title: "Port disruption",
				severity: 4,
				pointCount: 2,
			},
			geometry: {
				type: "Polygon",
				coordinates: [
					[
						[31, 30],
						[32, 30],
						[32, 31],
						[31, 31],
						[31, 30],
					],
				],
			},
		} satisfies GeoFlatViewConflictZoneFeature);
		const heatDetail = buildGeoConflictHeatSelectionDetail({
			id: "heat-30:31",
			coordinates: [31.24, 30.04],
			eventIds: ["event-1", "event-2"],
			intensity: 9,
			maxSeverity: 5,
		} satisfies GeoFlatViewConflictHeatCell);

		expect(strikeDetail.kind).toBe("strike");
		expect(strikeDetail.linkedEventId).toBe("event-1");
		expect(targetDetail.kind).toBe("target");
		expect(targetDetail.subtitle).toBe("Target 1");
		expect(assetDetail.kind).toBe("asset");
		expect(assetDetail.secondaryMeta).toContain("weight 0.70");
		expect(zoneDetail.kind).toBe("zone");
		expect(zoneDetail.primaryMeta).toEqual(["S4", "2 points"]);
		expect(heatDetail.kind).toBe("heat");
		expect(heatDetail.primaryMeta).toEqual(["intensity 9", "max S5"]);
	});
});
