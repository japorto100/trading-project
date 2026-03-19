"use client";

import { useQuery } from "@tanstack/react-query";
import { researchHomeResponseSchema } from "../schema";
import type { ResearchHomeResponse } from "../types";

async function fetchResearchHome(): Promise<ResearchHomeResponse> {
	const response = await fetch("/api/research/home", { cache: "no-store" });
	if (!response.ok) {
		throw new Error(`Research home request failed (${response.status})`);
	}

	const raw = await response.json();
	const parsed = researchHomeResponseSchema.safeParse(raw);
	if (!parsed.success) {
		throw new Error("Research home response schema mismatch");
	}

	return parsed.data;
}

export function useResearchHome() {
	return useQuery({
		queryKey: ["research", "home"],
		queryFn: fetchResearchHome,
		retry: false,
		staleTime: 60_000,
		gcTime: 5 * 60_000,
	});
}
