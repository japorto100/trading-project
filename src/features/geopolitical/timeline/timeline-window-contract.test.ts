import { describe, expect, it } from "bun:test";
import {
	copyGeoReplayRangeMs,
	getGeoTimelineWindowRelationship,
} from "@/features/geopolitical/timeline/timeline-window-contract";

describe("timeline window contract", () => {
	it("copies replay ranges without returning the same reference", () => {
		const range: [number, number] = [1, 2];
		const result = copyGeoReplayRangeMs(range);

		expect(result).toEqual([1, 2]);
		expect(result).not.toBe(range);
	});

	it("describes neutral, single-window and linked states", () => {
		expect(getGeoTimelineWindowRelationship(null, null).mode).toBe("neutral");
		expect(getGeoTimelineWindowRelationship([1, 2], null).mode).toBe("view_only");
		expect(getGeoTimelineWindowRelationship(null, [1, 2]).mode).toBe("filter_only");
		expect(getGeoTimelineWindowRelationship([1, 2], [1, 2]).mode).toBe("linked");
	});

	it("describes independent view and filter windows", () => {
		const result = getGeoTimelineWindowRelationship([1, 5], [2, 4]);

		expect(result.mode).toBe("independent");
		expect(result.windowsAligned).toBe(false);
		expect(result.hasViewWindow).toBe(true);
		expect(result.hasFilterWindow).toBe(true);
	});
});
