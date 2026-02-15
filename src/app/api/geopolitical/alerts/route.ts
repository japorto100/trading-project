import { type NextRequest, NextResponse } from "next/server";
import { computeEligibleAlerts } from "@/lib/geopolitical/alerts-routing";
import { listGeoEvents } from "@/lib/server/geopolitical-events-store";

export async function GET(request: NextRequest) {
	const cooldownRaw = Number(request.nextUrl.searchParams.get("cooldownMinutes") ?? "45");
	const cooldownMinutes = Number.isFinite(cooldownRaw)
		? Math.max(5, Math.min(360, cooldownRaw))
		: 45;

	const events = await listGeoEvents();
	const routing = computeEligibleAlerts(events, cooldownMinutes);

	return NextResponse.json({
		success: true,
		cooldownMinutes,
		totalEvents: events.length,
		eligibleAlerts: routing.eligible.length,
		suppressedAlerts: routing.suppressed.length,
		events: routing.eligible,
	});
}
