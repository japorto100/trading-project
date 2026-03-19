"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const geoSourceRefSchema = z.object({
	id: z.string(),
	provider: z.string(),
	url: z.string(),
	title: z.string().optional(),
	publishedAt: z.string().optional(),
	fetchedAt: z.string(),
	sourceTier: z.enum(["A", "B", "C"]),
	reliability: z.number(),
});

const geoAssetLinkSchema = z.object({
	id: z.string(),
	symbol: z.string(),
	assetClass: z.enum(["equity", "etf", "fx", "commodity", "crypto", "index"]),
	relation: z.enum(["beneficiary", "exposed", "hedge", "uncertain"]),
	weight: z.number().optional(),
	rationale: z.string().optional(),
});

const geoEventSchema = z.object({
	id: z.string(),
	title: z.string(),
	category: z.string(),
	subcategory: z.string().optional(),
	status: z.enum(["candidate", "confirmed", "persistent", "archived"]),
	severity: z.number(),
	confidence: z.number(),
	countryCodes: z.array(z.string()),
	regionIds: z.array(z.string()),
	summary: z.string().optional(),
	analystNote: z.string().optional(),
	sources: z.array(geoSourceRefSchema),
	assets: z.array(geoAssetLinkSchema),
	createdAt: z.string(),
	updatedAt: z.string(),
	validFrom: z.string().optional(),
	validTo: z.string().optional(),
	createdBy: z.string(),
	updatedBy: z.string(),
	symbol: z.string(),
});

const researchEventDetailResponseSchema = z.object({
	success: z.literal(true),
	event: geoEventSchema,
});

export type ResearchEventDetail = z.infer<typeof geoEventSchema>;

async function fetchResearchEventDetail(eventId: string): Promise<ResearchEventDetail> {
	const response = await fetch(`/api/geopolitical/events/${encodeURIComponent(eventId)}`, {
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error(`Research event request failed (${response.status})`);
	}

	const raw = await response.json();
	const parsed = researchEventDetailResponseSchema.safeParse(raw);
	if (!parsed.success) {
		throw new Error("Research event response schema mismatch");
	}

	return parsed.data.event;
}

export function useResearchEventDetail(eventId: string) {
	return useQuery({
		queryKey: ["research", "event-detail", eventId],
		queryFn: () => fetchResearchEventDetail(eventId),
		enabled: eventId.length > 0,
		retry: false,
		staleTime: 60_000,
		gcTime: 5 * 60_000,
	});
}
