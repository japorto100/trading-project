import { shouldTriggerEventAlert } from "@/lib/geopolitical/anti-noise";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface AlertRoutingResult {
	eligible: GeoEvent[];
	suppressed: GeoEvent[];
}

export function computeEligibleAlerts(
	events: GeoEvent[],
	cooldownMinutes: number,
): AlertRoutingResult {
	const eligible: GeoEvent[] = [];
	const suppressed: GeoEvent[] = [];
	const recentAccepted: GeoEvent[] = [];

	for (const event of events) {
		if (shouldTriggerEventAlert(event, recentAccepted, cooldownMinutes)) {
			eligible.push(event);
			recentAccepted.push(event);
		} else {
			suppressed.push(event);
		}
	}

	return { eligible, suppressed };
}
