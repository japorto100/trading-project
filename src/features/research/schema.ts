import { z } from "zod";

export const researchDegradationReasonSchema = z.enum([
	"NO_LOCAL_EVENTS",
	"INSUFFICIENT_EVENT_CONTEXT",
	"INVALID_LOCAL_RESEARCH_SHAPE",
	"LOCAL_RESEARCH_BUILD_FAILED",
]);

export const researchMatterSchema = z.object({
	id: z.string().min(1),
	type: z.enum(["event", "headline", "narrative"]),
	title: z.string().min(1),
	score: z.number(),
	confidence: z.number().min(0).max(1),
	reason: z.string().min(1),
	freshnessLabel: z.string().min(1),
	targetHref: z.string().min(1),
});

export const researchEventLaneItemSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	scheduledAt: z.string().min(1),
	region: z.string().min(1),
	impactBand: z.enum(["low", "medium", "high", "critical"]),
	confidence: z.number().min(0).max(1),
	playbookHint: z.string().min(1),
	targetHref: z.string().min(1),
});

export const researchNarrativeLaneItemSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	kind: z.enum(["actor", "narrative", "event"]),
	volProbability: z.number().min(0).max(1),
	confidence: z.number().min(0).max(1),
	affectedAssets: z.array(z.string().min(1)),
});

export const researchActionRailItemSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
	description: z.string().min(1),
	href: z.string().min(1),
});

export const researchModuleStateSchema = z.object({
	key: z.enum(["marketSummary", "mattersNow", "eventLane", "narrativeLane", "actionRail"]),
	status: z.enum(["ready", "degraded"]),
	reasons: z.array(researchDegradationReasonSchema),
});

export const researchHomePayloadSchema = z.object({
	marketSummary: z.object({
		regime: z.string().min(1),
		confidence: z.number().min(0).max(1),
		freshnessLabel: z.string().min(1),
	}),
	mattersNow: z.array(researchMatterSchema),
	eventLane: z.array(researchEventLaneItemSchema),
	narrativeLane: z.array(researchNarrativeLaneItemSchema),
	actionRail: z.array(researchActionRailItemSchema),
});

export const researchHomeResponseSchema = z.object({
	payload: researchHomePayloadSchema,
	degraded: z.boolean(),
	degradedReasons: z.array(researchDegradationReasonSchema),
	moduleStates: z.array(researchModuleStateSchema),
	requestId: z.string().min(1),
	source: z.enum(["local", "fallback"]),
});

export type ResearchHomeResponseSchema = z.infer<typeof researchHomeResponseSchema>;
