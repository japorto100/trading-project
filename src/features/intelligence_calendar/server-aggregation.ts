import { buildEventDetailHref } from "@/lib/event-detail";
import type { GeoEvent } from "@/lib/geopolitical/types";
import { listGeoEvents } from "@/lib/server/geopolitical-events-store";
import { buildIntelligenceCalendarFallbackResponse } from "./mock-data";
import type {
	IntelligenceCalendarDegradationReason,
	IntelligenceCalendarEvent,
	IntelligenceCalendarResponse,
} from "./types";
import { dedupeIntelligenceCalendarEvents } from "./utils";

function impactBandFromSeverity(severity: number): IntelligenceCalendarEvent["impactBand"] {
	if (severity >= 5) return "critical";
	if (severity >= 4) return "high";
	if (severity >= 3) return "medium";
	return "low";
}

function confidenceFromGeo(confidence: number): number {
	return Math.max(0, Math.min(1, confidence / 4));
}

function freshnessLabel(updatedAt: string): string {
	const updated = new Date(updatedAt);
	if (Number.isNaN(updated.getTime())) return "Unknown freshness";
	const diffMinutes = Math.max(0, Math.floor((Date.now() - updated.getTime()) / 60_000));
	if (diffMinutes < 1) return "Updated now";
	if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
	return `Updated ${Math.floor(diffMinutes / 60)}h ago`;
}

function categoryFromEvent(event: GeoEvent): IntelligenceCalendarEvent["category"] {
	if (event.category.toLowerCase().includes("central")) return "central_bank";
	if (event.category.toLowerCase().includes("earn")) return "earnings";
	if (event.category.toLowerCase().includes("macro")) return "macro";
	if (event.category.toLowerCase().includes("geo")) return "geopolitical";
	return "other";
}

function toCalendarEvent(event: GeoEvent): IntelligenceCalendarEvent {
	const degradationReasons: IntelligenceCalendarDegradationReason[] = [];
	if (event.sources.length === 0) {
		degradationReasons.push("NO_PROVIDER_DATA");
	}
	if (event.confidence <= 1) {
		degradationReasons.push("LOW_CONFIDENCE");
	}
	degradationReasons.push("MISSING_EXPECTED_RANGE");

	return {
		eventId: event.id,
		updatedAt: event.updatedAt,
		title: event.title,
		region: event.regionIds[0] || event.countryCodes[0] || "Global",
		category: categoryFromEvent(event),
		scheduledAt: event.validFrom ? new Date(event.validFrom).toLocaleString() : "Active now",
		expectedRange: undefined,
		actual: null,
		surpriseState: event.validFrom ? "pending" : "unknown",
		impactBand: impactBandFromSeverity(event.severity),
		affectedAssets:
			event.assets.length > 0
				? event.assets.slice(0, 4).map((item) => item.symbol)
				: ["Geo spillover"],
		playbook: [
			{
				scenario: "base_case",
				bias: "investigate_spillover",
				note:
					event.assets.length > 0
						? `Watch ${event.assets
								.slice(0, 3)
								.map((item) => item.symbol)
								.join(", ")}`
						: "Use GeoMap and Trading Workspace drilldowns.",
			},
		],
		confidence: confidenceFromGeo(event.confidence),
		freshnessLabel: freshnessLabel(event.updatedAt),
		sources: event.sources.slice(0, 3).map((source) => ({
			name: source.title || source.provider,
			url: source.url,
		})),
		degradationReasons,
		targetHref: buildEventDetailHref(event.id, "/calendar"),
	};
}

export async function buildLocalIntelligenceCalendarResponse(
	requestId: string,
): Promise<IntelligenceCalendarResponse> {
	const events = await listGeoEvents({ minSeverity: 2 });
	if (events.length === 0) {
		return buildIntelligenceCalendarFallbackResponse(requestId, ["NO_LOCAL_EVENTS"]);
	}

	const sorted = [...events].sort(
		(left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
	);
	const calendarEvents = dedupeIntelligenceCalendarEvents(sorted.slice(0, 12).map(toCalendarEvent));
	const degraded = calendarEvents.some((event) => event.degradationReasons.length > 0);
	const degradedReasons = Array.from(
		new Set(calendarEvents.flatMap((event) => event.degradationReasons)),
	);

	return {
		events: calendarEvents,
		degraded,
		degradedReasons,
		requestId,
		source: "local",
	};
}
