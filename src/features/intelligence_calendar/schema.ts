import { z } from "zod";

export const intelligenceCalendarDegradationReasonSchema = z.enum([
	"NO_PROVIDER_DATA",
	"STALE_DATA",
	"MISSING_EXPECTED_RANGE",
	"LOW_CONFIDENCE",
	"SERVICE_DEGRADED",
	"NO_LOCAL_EVENTS",
	"INVALID_LOCAL_CALENDAR_SHAPE",
	"LOCAL_CALENDAR_BUILD_FAILED",
]);

export const intelligenceCalendarEventSchema = z.object({
	eventId: z.string().min(1),
	updatedAt: z.string().min(1),
	title: z.string().min(1),
	region: z.string().min(1),
	category: z.enum(["macro", "central_bank", "earnings", "geopolitical", "other"]),
	scheduledAt: z.string().min(1),
	expectedRange: z
		.object({
			min: z.number().optional(),
			consensus: z.number().optional(),
			max: z.number().optional(),
			previous: z.union([z.number(), z.string(), z.null()]).optional(),
		})
		.optional(),
	actual: z.union([z.number(), z.string(), z.null()]).optional(),
	surpriseState: z.enum(["unknown", "pending", "in_range", "above_range", "below_range"]),
	impactBand: z.enum(["low", "medium", "high", "critical"]),
	affectedAssets: z.array(z.string()),
	playbook: z.array(
		z.object({
			scenario: z.string().min(1),
			bias: z.string().min(1),
			note: z.string().optional(),
		}),
	),
	confidence: z.number().min(0).max(1),
	freshnessLabel: z.string().min(1),
	sources: z.array(
		z.object({
			name: z.string().min(1),
			url: z.string().min(1),
		}),
	),
	degradationReasons: z.array(intelligenceCalendarDegradationReasonSchema),
	targetHref: z.string().min(1),
});

export const intelligenceCalendarResponseSchema = z.object({
	events: z.array(intelligenceCalendarEventSchema),
	degraded: z.boolean(),
	degradedReasons: z.array(intelligenceCalendarDegradationReasonSchema),
	requestId: z.string().min(1),
	source: z.enum(["local", "fallback"]),
});
