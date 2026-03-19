import { buildEventDetailHref } from "@/lib/event-detail";
import type { IntelligenceCalendarDegradationReason, IntelligenceCalendarResponse } from "./types";

export function buildIntelligenceCalendarFallbackResponse(
	requestId: string,
	reasons: IntelligenceCalendarDegradationReason[],
): IntelligenceCalendarResponse {
	return {
		events: [
			{
				eventId: "fallback-us-cpi",
				updatedAt: "2026-03-16T08:00:00.000Z",
				title: "US CPI release",
				region: "US",
				category: "macro",
				scheduledAt: "Today · 14:30 CET",
				expectedRange: { min: 2.7, consensus: 2.9, max: 3.1, previous: 3.0 },
				actual: null,
				surpriseState: "pending",
				impactBand: "critical",
				affectedAssets: ["DXY", "US10Y", "SPX"],
				playbook: [
					{ scenario: "above_range", bias: "hawkish_usd_up", note: "Watch rates and USD." },
					{ scenario: "in_range", bias: "neutral_wait", note: "Monitor follow-through." },
				],
				confidence: 0.78,
				freshnessLabel: "Fallback snapshot",
				sources: [{ name: "MRKT-style fallback", url: "/calendar" }],
				degradationReasons: reasons,
				targetHref: buildEventDetailHref("fallback-us-cpi", "/calendar"),
			},
		],
		degraded: true,
		degradedReasons: reasons,
		requestId,
		source: "fallback",
	};
}
