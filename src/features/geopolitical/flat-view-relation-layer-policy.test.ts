import { describe, expect, it } from "bun:test";
import { getGeoFlatRelationLayerPolicy } from "@/features/geopolitical/flat-view-relation-layer-policy";

describe("flat-view-relation-layer-policy", () => {
	it("keeps missile and relational overlays as explicit follow-up decisions", () => {
		const policy = getGeoFlatRelationLayerPolicy();

		expect(policy).toEqual([
			{
				optionId: "missiles",
				status: "follow-up",
				rationale:
					"Keep missile-specific payloads separate from the current strike/target v2 payloads and only add them once dedicated path or track semantics exist.",
				sourceRefs: ["pharos-ai", "conflict_globe_gl"],
			},
			{
				optionId: "arcs",
				status: "defer-v3",
				rationale:
					"Relational arc overlays stay out of the current flat closeout until the later globe/global-view track revisits graph-style overlays.",
				sourceRefs: ["conflict_globe_gl"],
			},
			{
				optionId: "paths",
				status: "defer-v3",
				rationale:
					"Path rendering depends on explicit route or track contracts and is deferred instead of being implied by current conflict points.",
				sourceRefs: ["conflict_globe_gl"],
			},
			{
				optionId: "rings",
				status: "defer-v3",
				rationale:
					"Ring overlays remain a later visual density layer once live conflict rendering and globe parity are verified.",
				sourceRefs: ["conflict_globe_gl"],
			},
			{
				optionId: "hexbin",
				status: "defer-v3",
				rationale:
					"Hexbin aggregation stays as a later density experiment after the simpler heat-cell contract has live evidence.",
				sourceRefs: ["conflict_globe_gl"],
			},
		]);
	});
});
