import { type NextRequest, NextResponse } from "next/server";
import { computeEligibleAlerts } from "@/lib/geopolitical/alerts-routing";
import { listGeoEvents } from "@/lib/server/geopolitical-events-store";

const SEVERITY_THRESHOLD_MAP = {
	low: 1,
	medium: 2,
	high: 3,
	critical: 4,
} as const;

export async function GET(request: NextRequest) {
	const cooldownRaw = Number(request.nextUrl.searchParams.get("cooldownMinutes") ?? "45");
	const cooldownMinutes = Number.isFinite(cooldownRaw)
		? Math.max(5, Math.min(360, cooldownRaw))
		: 45;
	const minConfidenceRaw = Number(request.nextUrl.searchParams.get("minConfidence") ?? "0");
	const minConfidence = Number.isFinite(minConfidenceRaw)
		? Math.max(0, Math.min(1, minConfidenceRaw))
		: 0;
	const minSeverityParam = (request.nextUrl.searchParams.get("minSeverity") ?? "low").toLowerCase();
	const severityThreshold =
		SEVERITY_THRESHOLD_MAP[minSeverityParam as keyof typeof SEVERITY_THRESHOLD_MAP] ?? 1;
	const regionId = request.nextUrl.searchParams.get("regionId")?.trim() || undefined;

	const events = await listGeoEvents();
	const thresholdFiltered = events.filter((event) => {
		const eventSeverityWeight = Math.min(4, Math.max(1, Number(event.severity)));
		if (eventSeverityWeight < severityThreshold) return false;
		if (Number(event.confidence) < minConfidence) return false;
		if (regionId && !event.regionIds.includes(regionId)) return false;
		return true;
	});
	const routing = computeEligibleAlerts(thresholdFiltered, cooldownMinutes);

	return NextResponse.json({
		success: true,
		cooldownMinutes,
		minConfidence,
		minSeverity: minSeverityParam,
		regionId: regionId ?? null,
		totalEvents: events.length,
		thresholdMatchedEvents: thresholdFiltered.length,
		eligibleAlerts: routing.eligible.length,
		suppressedAlerts: routing.suppressed.length,
		events: routing.eligible,
	});
}
