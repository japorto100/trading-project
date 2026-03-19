import type {
	ResearchDegradationReason,
	ResearchHomePayload,
	ResearchHomeResponse,
	ResearchModuleState,
} from "./types";

export const researchHomeMockPayload: ResearchHomePayload = {
	marketSummary: {
		regime: "Risk-sensitive cross-asset setup",
		confidence: 0.71,
		freshnessLabel: "Updated 6m ago",
	},
	mattersNow: [
		{
			id: "matter-fed",
			type: "event",
			title: "Central-bank messaging is driving the next macro window",
			score: 92,
			confidence: 0.82,
			reason: "Policy event incoming with watchlist overlap",
			freshnessLabel: "Fresh",
			targetHref: "/geopolitical-map",
		},
		{
			id: "matter-energy",
			type: "headline",
			title: "Energy shipping risk is widening regional dispersion",
			score: 81,
			confidence: 0.67,
			reason: "Cross-asset spillover and source clustering",
			freshnessLabel: "Updated 18m ago",
			targetHref: "/geopolitical-map",
		},
		{
			id: "matter-vol",
			type: "narrative",
			title: "Rates-sensitive growth names remain vulnerable to repricing",
			score: 76,
			confidence: 0.63,
			reason: "Narrative persistence with elevated volatility",
			freshnessLabel: "Updated 24m ago",
			targetHref: "/trading",
		},
	],
	eventLane: [
		{
			id: "event-1",
			title: "US CPI release",
			scheduledAt: "Today · 14:30 CET",
			region: "US",
			impactBand: "critical",
			confidence: 0.85,
			playbookHint: "Watch rates, USD, and equity duration names",
			targetHref: "/trading",
		},
		{
			id: "event-2",
			title: "ECB policy communication",
			scheduledAt: "Tomorrow · 09:00 CET",
			region: "EU",
			impactBand: "high",
			confidence: 0.78,
			playbookHint: "Track EUR rates curve and bank sensitivity",
			targetHref: "/trading",
		},
	],
	narrativeLane: [
		{
			id: "narrative-1",
			title: "Energy corridor pressure",
			kind: "narrative",
			volProbability: 0.72,
			confidence: 0.64,
			affectedAssets: ["Brent", "EURUSD", "EU equities"],
		},
		{
			id: "narrative-2",
			title: "Election-cycle fiscal messaging",
			kind: "actor",
			volProbability: 0.58,
			confidence: 0.61,
			affectedAssets: ["Rates", "banks", "broad indices"],
		},
	],
	actionRail: [
		{
			id: "action-1",
			label: "Open Trading Workspace",
			description: "Move from context into execution without changing the default landing flow.",
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

function buildModuleStates(degradedReasons: ResearchDegradationReason[]): ResearchModuleState[] {
	const status = degradedReasons.length > 0 ? "degraded" : "ready";
	const sharedReasons = degradedReasons;

	return [
		{ key: "marketSummary", status, reasons: sharedReasons },
		{ key: "mattersNow", status, reasons: sharedReasons },
		{ key: "eventLane", status, reasons: sharedReasons },
		{ key: "narrativeLane", status, reasons: sharedReasons },
		{ key: "actionRail", status: "ready", reasons: [] },
	];
}

export function buildResearchHomeFallbackResponse(
	requestId: string,
	degradedReasons: ResearchDegradationReason[],
): ResearchHomeResponse {
	return {
		payload: researchHomeMockPayload,
		degraded: degradedReasons.length > 0,
		degradedReasons,
		moduleStates: buildModuleStates(degradedReasons),
		requestId,
		source: "fallback",
	};
}
