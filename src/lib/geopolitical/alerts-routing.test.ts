// @ts-nocheck
import { describe, expect, it } from "bun:test";
import { computeEligibleAlerts } from "@/lib/geopolitical/alerts-routing";
import type { GeoEvent } from "@/lib/geopolitical/types";

function makeEvent(input: Partial<GeoEvent> & { id: string; updatedAt: string }): GeoEvent {
	return {
		id: input.id,
		title: input.title ?? input.id,
		category: input.category ?? "sanctions_export_controls",
		status: input.status ?? "confirmed",
		severity: input.severity ?? 4,
		confidence: input.confidence ?? 3,
		countryCodes: input.countryCodes ?? [],
		regionIds: input.regionIds ?? ["europe"],
		coordinates: input.coordinates ?? [{ lat: 50, lng: 10 }],
		sources: input.sources ?? [],
		assets: input.assets ?? [],
		createdAt: input.createdAt ?? input.updatedAt,
		updatedAt: input.updatedAt,
		createdBy: input.createdBy ?? "test",
		updatedBy: input.updatedBy ?? "test",
		symbol: input.symbol ?? "gavel",
		summary: input.summary,
		analystNote: input.analystNote,
		subcategory: input.subcategory,
		hotspotIds: input.hotspotIds,
		validFrom: input.validFrom,
		validTo: input.validTo,
	};
}

describe("alert routing", () => {
	it("routes only one alert within cooldown bucket", () => {
		const now = Date.now();
		const events: GeoEvent[] = [
			makeEvent({ id: "e1", updatedAt: new Date(now).toISOString() }),
			makeEvent({ id: "e2", updatedAt: new Date(now - 15 * 60_000).toISOString() }),
			makeEvent({
				id: "e3",
				category: "monetary_policy_rates",
				updatedAt: new Date(now - 20 * 60_000).toISOString(),
			}),
		];

		const routing = computeEligibleAlerts(events, 45);

		expect(routing.eligible.map((event) => event.id)).toContain("e1");
		expect(routing.eligible.map((event) => event.id)).toContain("e3");
		expect(routing.suppressed.map((event) => event.id)).toContain("e2");
	});
});
