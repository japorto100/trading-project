"use client";

import { useEffect, useMemo, useState } from "react";
import type { GeoEvaluationSummary } from "@/lib/geopolitical/phase12-types";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";

function summarizeTimeline(timeline: GeoTimelineEntry[]) {
	let accepted = 0;
	let rejected = 0;
	let snoozed = 0;
	let contradictionCreated = 0;
	let contradictionResolved = 0;
	for (const entry of timeline) {
		if (entry.action === "candidate_accepted") accepted += 1;
		if (entry.action === "candidate_rejected") rejected += 1;
		if (entry.action === "candidate_snoozed") snoozed += 1;
		if (entry.action === "contradiction_created") contradictionCreated += 1;
		if (entry.action === "contradiction_resolved") contradictionResolved += 1;
	}
	const reviewTotal = accepted + rejected + snoozed;
	return {
		accepted,
		rejected,
		snoozed,
		reviewTotal,
		acceptRate: reviewTotal > 0 ? accepted / reviewTotal : 0,
		rejectRate: reviewTotal > 0 ? rejected / reviewTotal : 0,
		snoozeRate: reviewTotal > 0 ? snoozed / reviewTotal : 0,
		contradictionCreated,
		contradictionResolved,
	};
}

export function usePhase12Evaluation(
	events: GeoEvent[],
	candidates: GeoCandidate[],
	timeline: GeoTimelineEntry[],
) {
	const [evaluationLoading, setEvaluationLoading] = useState(false);
	const [evaluationSummary, setEvaluationSummary] = useState<GeoEvaluationSummary | null>(null);
	const [evaluationError, setEvaluationError] = useState<string | null>(null);

	const reviewStats = useMemo(() => summarizeTimeline(timeline), [timeline]);
	const openCandidates = useMemo(
		() => candidates.filter((candidate) => candidate.state === "open").length,
		[candidates],
	);

	useEffect(() => {
		let cancelled = false;
		setEvaluationLoading(true);
		setEvaluationError(null);
		void fetch("/api/geopolitical/evaluation", { cache: "no-store" })
			.then(async (response) => {
				if (!response.ok) throw new Error(`evaluation fetch failed (${response.status})`);
				const payload = (await response.json()) as {
					success?: boolean;
					summary?: GeoEvaluationSummary;
				};
				if (!cancelled) setEvaluationSummary(payload.summary ?? null);
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					setEvaluationError(error instanceof Error ? error.message : "evaluation fetch failed");
				}
			})
			.finally(() => {
				if (!cancelled) setEvaluationLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const effectiveReviewStats = evaluationSummary
		? {
				...reviewStats,
				...evaluationSummary.review,
				contradictionCreated: evaluationSummary.contradictions.created,
				contradictionResolved: evaluationSummary.contradictions.resolved,
			}
		: reviewStats;

	const effectiveCounts = evaluationSummary?.counts ?? {
		events: events.length,
		candidates: candidates.length,
		openCandidates,
		contradictions: 0,
		openContradictions: 0,
		timeline: timeline.length,
	};

	return {
		evaluationLoading,
		evaluationSummary,
		evaluationError,
		effectiveReviewStats,
		effectiveCounts,
	};
}
