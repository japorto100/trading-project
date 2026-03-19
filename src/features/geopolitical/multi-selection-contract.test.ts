import { describe, expect, it } from "bun:test";
import { buildGeoMultiSelectionState } from "@/features/geopolitical/multi-selection-contract";

describe("multi-selection-contract", () => {
	it("replaces the current event selection deterministically", () => {
		expect(
			buildGeoMultiSelectionState({
				currentEventIds: ["evt-1"],
				nextEventIds: ["evt-2", "evt-3"],
				mode: "replace",
			}),
		).toEqual({ eventIds: ["evt-2", "evt-3"] });
	});

	it("appends new events without duplicating ids", () => {
		expect(
			buildGeoMultiSelectionState({
				currentEventIds: ["evt-1", "evt-2"],
				nextEventIds: ["evt-2", "evt-3"],
				mode: "append",
			}),
		).toEqual({ eventIds: ["evt-1", "evt-2", "evt-3"] });
	});

	it("toggles cluster members in and out of the selection set", () => {
		expect(
			buildGeoMultiSelectionState({
				currentEventIds: ["evt-1", "evt-2"],
				nextEventIds: ["evt-2", "evt-3", "evt-4"],
				mode: "toggle",
			}),
		).toEqual({ eventIds: ["evt-1", "evt-3", "evt-4"] });
	});

	it("clears the full multi-selection state", () => {
		expect(
			buildGeoMultiSelectionState({
				currentEventIds: ["evt-1", "evt-2"],
				mode: "clear",
			}),
		).toEqual({ eventIds: [] });
	});
});
