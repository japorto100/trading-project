"use client";

import { useQuery } from "@tanstack/react-query";
import { intelligenceCalendarResponseSchema } from "../schema";
import type { IntelligenceCalendarResponse } from "../types";

async function fetchIntelligenceCalendar(): Promise<IntelligenceCalendarResponse> {
	const response = await fetch("/api/intelligence-calendar/events", { cache: "no-store" });
	if (!response.ok) {
		throw new Error(`Intelligence calendar request failed (${response.status})`);
	}

	const raw = await response.json();
	const parsed = intelligenceCalendarResponseSchema.safeParse(raw);
	if (!parsed.success) {
		throw new Error("Intelligence calendar response schema mismatch");
	}

	return parsed.data;
}

export function useIntelligenceCalendar() {
	return useQuery({
		queryKey: ["intelligence-calendar", "events"],
		queryFn: fetchIntelligenceCalendar,
		retry: false,
		staleTime: 60_000,
		gcTime: 5 * 60_000,
	});
}
