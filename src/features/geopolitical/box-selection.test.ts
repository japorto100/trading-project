import { describe, expect, it } from "bun:test";
import {
	getGeoBoxSelectedMarkerIds,
	normalizeGeoViewportSelectionBox,
} from "@/features/geopolitical/box-selection";

describe("box-selection", () => {
	it("normalizes viewport drag boxes regardless of drag direction", () => {
		expect(
			normalizeGeoViewportSelectionBox({
				startX: 40,
				startY: 80,
				endX: 10,
				endY: 20,
			}),
		).toEqual({
			startX: 10,
			startY: 20,
			endX: 40,
			endY: 80,
		});
	});

	it("selects only visible markers inside the selection box", () => {
		expect(
			getGeoBoxSelectedMarkerIds({
				box: {
					startX: 20,
					startY: 20,
					endX: 80,
					endY: 80,
				},
				markers: [
					{
						id: "evt-1",
						symbol: "alert",
						shortLabel: "A",
						lat: 0,
						lng: 0,
						x: 30,
						y: 30,
						severity: 3,
						title: "A",
						visible: true,
						raw: {} as never,
					},
					{
						id: "evt-2",
						symbol: "alert",
						shortLabel: "B",
						lat: 0,
						lng: 0,
						x: 90,
						y: 90,
						severity: 3,
						title: "B",
						visible: true,
						raw: {} as never,
					},
					{
						id: "evt-3",
						symbol: "alert",
						shortLabel: "C",
						lat: 0,
						lng: 0,
						x: 50,
						y: 50,
						severity: 3,
						title: "C",
						visible: false,
						raw: {} as never,
					},
				],
			}),
		).toEqual(["evt-1"]);
	});

	it("ignores tiny drags that should not count as box selection", () => {
		expect(
			getGeoBoxSelectedMarkerIds({
				box: {
					startX: 20,
					startY: 20,
					endX: 24,
					endY: 24,
				},
				markers: [],
			}),
		).toEqual([]);
	});
});
