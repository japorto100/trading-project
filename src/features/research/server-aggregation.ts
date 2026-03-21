import { buildEventDetailHref } from "@/lib/event-detail";
import type { GeoEvent } from "@/lib/geopolitical/types";
import { listGeoEvents } from "@/lib/server/geopolitical-events-store";
import { buildResearchHomeFallbackResponse, researchHomeMockPayload } from "./mock-data";
import type { ResearchDegradationReason, ResearchHomeResponse, ResearchModuleState } from "./types";

function confidenceFromGeo(confidence: number): number {
	return Math.max(0, Math.min(1, confidence / 4));
}

function freshnessLabel(updatedAt: string): string {
	const updated = new Date(updatedAt);
	if (Number.isNaN(updated.getTime())) return "Unknown freshness";
	const diffMinutes = Math.max(0, Math.floor((Date.now() - updated.getTime()) / 60_000));
	if (diffMinutes < 1) return "Updated now";
	if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `Updated ${diffHours}h ago`;
	return `Updated ${Math.floor(diffHours / 24)}d ago`;
}

function impactBandFromSeverity(severity: number): "low" | "medium" | "high" | "critical" {
	if (severity >= 5) return "critical";
	if (severity >= 4) return "high";
	if (severity >= 3) return "medium";
	return "low";
}

function buildModuleStates(events: GeoEvent[]): ResearchModuleState[] {
	const hasEvents = events.length > 0;
	const eventReasons: ResearchDegradationReason[] = hasEvents ? [] : ["NO_LOCAL_EVENTS"];

	return [
		{ key: "marketSummary", status: hasEvents ? "ready" : "degraded", reasons: eventReasons },
		{ key: "mattersNow", status: hasEvents ? "ready" : "degraded", reasons: eventReasons },
		{ key: "eventLane", status: hasEvents ? "ready" : "degraded", reasons: eventReasons },
		{
			key: "narrativeLane",
			status: hasEvents ? "ready" : "degraded",
			reasons: hasEvents ? [] : (["INSUFFICIENT_EVENT_CONTEXT"] as ResearchDegradationReason[]),
		},
		{ key: "actionRail", status: "ready", reasons: [] },
	];
}

export async function buildLocalResearchHomeResponse(
	requestId: string,
): Promise<ResearchHomeResponse> {
	const events = await listGeoEvents({ minSeverity: 2 });
	if (events.length === 0) {
		return buildResearchHomeFallbackResponse(requestId, ["NO_LOCAL_EVENTS"]);
	}

	const sorted = [...events].sort(
		(left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
	);
	const topEvents = sorted.slice(0, 6);
	const criticalCount = sorted.filter((event) => event.severity >= 4).length;
	const freshest = topEvents[0];

	const payload = {
		marketSummary: {
			regime:
				criticalCount > 0
					? `${criticalCount} high-severity geopolitical catalysts active`
					: "Monitoring-driven research posture",
			confidence: confidenceFromGeo(freshest?.confidence ?? 0),
			freshnessLabel: freshest ? freshnessLabel(freshest.updatedAt) : "No fresh events",
		},
		mattersNow: topEvents.slice(0, 3).map((event, index) => ({
			id: event.id,
			type: "event" as const,
			title: event.title,
			score: Math.max(40, 100 - index * 8 + event.severity * 3),
			confidence: confidenceFromGeo(event.confidence),
			reason: event.summary?.trim() || `${event.category} event with severity ${event.severity}`,
			freshnessLabel: freshnessLabel(event.updatedAt),
			targetHref: buildEventDetailHref(event.id, "/research"),
		})),
		eventLane: topEvents.slice(0, 4).map((event) => ({
			id: event.id,
			title: event.title,
			scheduledAt: event.validFrom ? new Date(event.validFrom).toLocaleString() : "Active now",
			region: event.regionIds[0] || event.countryCodes[0] || "Global",
			impactBand: impactBandFromSeverity(event.severity),
			confidence: confidenceFromGeo(event.confidence),
			playbookHint:
				event.assets.length > 0
					? `Watch ${event.assets
							.slice(0, 3)
							.map((item) => item.symbol)
							.join(", ")}`
					: "Review linked assets, regional exposure, and chart spillover",
			targetHref: buildEventDetailHref(event.id, "/research"),
		})),
		narrativeLane:
			topEvents.length > 0
				? topEvents.slice(0, 2).map((event) => ({
						id: `narrative-${event.id}`,
						title: event.category,
						kind: "event" as const,
						volProbability: Math.max(0.2, Math.min(0.95, event.severity / 5)),
						confidence: confidenceFromGeo(event.confidence),
						affectedAssets:
							event.assets.length > 0
								? event.assets.slice(0, 4).map((item) => item.symbol)
								: ["Geo spillover"],
					}))
				: researchHomeMockPayload.narrativeLane,
		actionRail: [
			{
				id: "action-1",
				label: "Open Trading Workspace",
				description:
					"Move from context into execution while keeping Research as a separate shell surface.",
				href: "/trading",
			},
			{
				id: "action-2",
				label: "Open Intelligence Calendar",
				description:
					"Switch into the operational event surface for range, surprise, and playbook views.",
				href: "/calendar",
			},
			{
				id: "action-3",
				label: "Open GeoMap",
				description: "Inspect event geography, sources, and linked context.",
				href: "/geopolitical-map",
			},
			{
				id: "action-4",
				label: "Open Control",
				description: "Use system and agent surfaces without leaving the shell.",
				href: "/control/overview",
			},
		],
	};

	return {
		payload,
		degraded: false,
		degradedReasons: [],
		moduleStates: buildModuleStates(sorted),
		requestId,
		source: "local",
	};
}
