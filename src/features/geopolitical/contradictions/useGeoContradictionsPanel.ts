import { useCallback, useEffect, useState } from "react";
import {
	type ContradictionDraftState,
	type ContradictionFilter,
	createDraftFromContradiction,
	type GeoContradictionsResponse,
} from "@/features/geopolitical/contradictions/types";
import type { GeoContradiction } from "@/lib/geopolitical/types";

export function useGeoContradictionsPanel() {
	const [items, setItems] = useState<GeoContradiction[]>([]);
	const [loading, setLoading] = useState(false);
	const [actionBusyId, setActionBusyId] = useState<string | null>(null);
	const [stateFilter, setStateFilter] = useState<ContradictionFilter>("open");
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [drafts, setDrafts] = useState<Record<string, ContradictionDraftState>>({});
	const [error, setError] = useState<string | null>(null);

	const fetchContradictions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const query =
				stateFilter === "all"
					? "/api/geopolitical/contradictions"
					: `/api/geopolitical/contradictions?state=${stateFilter}`;
			const response = await fetch(query, {
				cache: "no-store",
			});
			if (!response.ok) {
				throw new Error(`Failed to fetch contradictions (${response.status})`);
			}
			const payload = (await response.json()) as GeoContradictionsResponse;
			setItems(Array.isArray(payload.contradictions) ? payload.contradictions : []);
		} catch (fetchError) {
			setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch contradictions");
		} finally {
			setLoading(false);
		}
	}, [stateFilter]);

	const patchContradiction = useCallback(
		async (contradictionId: string, body: Record<string, unknown>) => {
			setActionBusyId(contradictionId);
			setError(null);
			try {
				const response = await fetch(`/api/geopolitical/contradictions/${contradictionId}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				});
				if (!response.ok) {
					throw new Error(`Failed to update contradiction (${response.status})`);
				}
				await fetchContradictions();
			} catch (mutationError) {
				setError(
					mutationError instanceof Error ? mutationError.message : "Failed to update contradiction",
				);
			} finally {
				setActionBusyId(null);
			}
		},
		[fetchContradictions],
	);

	const setContradictionState = useCallback(
		async (contradictionId: string, nextState: "open" | "resolved") => {
			await patchContradiction(contradictionId, { state: nextState });
		},
		[patchContradiction],
	);

	const updateDraft = useCallback(
		(
			contradictionId: string,
			updater: (prev: ContradictionDraftState) => ContradictionDraftState,
		) => {
			setDrafts((prev) => {
				const existingItem = items.find((item) => item.id === contradictionId);
				if (!prev[contradictionId] && !existingItem) return prev;
				const base =
					prev[contradictionId] ?? createDraftFromContradiction(existingItem as GeoContradiction);
				return { ...prev, [contradictionId]: updater(base) };
			});
		},
		[items],
	);

	const toggleDetails = useCallback((item: GeoContradiction) => {
		setExpandedId((current) => (current === item.id ? null : item.id));
		setDrafts((prev) => ({
			...prev,
			[item.id]: prev[item.id] ?? createDraftFromContradiction(item),
		}));
	}, []);

	const saveResolutionDetails = useCallback(
		async (item: GeoContradiction) => {
			const draft = drafts[item.id] ?? createDraftFromContradiction(item);
			await patchContradiction(item.id, {
				summary: draft.summary,
				resolution: {
					outcome: draft.resolutionOutcome,
					note: draft.resolutionNote,
					mergedEventId: draft.mergedEventId,
					mergedCandidateId: draft.mergedCandidateId,
				},
			});
		},
		[drafts, patchContradiction],
	);

	const clearResolutionDetails = useCallback(
		async (item: GeoContradiction) => {
			await patchContradiction(item.id, {
				resolution: { clear: true },
			});
			setDrafts((prev) => ({
				...prev,
				[item.id]: createDraftFromContradiction({ ...item, resolution: undefined }),
			}));
		},
		[patchContradiction],
	);

	const addEvidence = useCallback(
		async (item: GeoContradiction) => {
			const draft = drafts[item.id] ?? createDraftFromContradiction(item);
			const label = draft.evidenceLabel.trim();
			if (!label) {
				setError("Evidence label is required");
				return;
			}
			await patchContradiction(item.id, {
				addEvidence: [
					{
						kind: draft.evidenceKind,
						label,
						note: draft.evidenceNote.trim() || undefined,
						url: draft.evidenceUrl.trim() || undefined,
						eventId: draft.evidenceEventId.trim() || undefined,
						candidateId: draft.evidenceCandidateId.trim() || undefined,
					},
				],
			});
			setDrafts((prev) => ({
				...prev,
				[item.id]: {
					...(prev[item.id] ?? createDraftFromContradiction(item)),
					evidenceLabel: "",
					evidenceNote: "",
					evidenceUrl: "",
					evidenceEventId: "",
					evidenceCandidateId: "",
				},
			}));
		},
		[drafts, patchContradiction],
	);

	const removeEvidence = useCallback(
		async (contradictionId: string, evidenceId: string) => {
			await patchContradiction(contradictionId, {
				removeEvidenceIds: [evidenceId],
			});
		},
		[patchContradiction],
	);

	useEffect(() => {
		void fetchContradictions();
	}, [fetchContradictions]);

	return {
		items,
		loading,
		actionBusyId,
		stateFilter,
		expandedId,
		drafts,
		error,
		setStateFilter,
		refreshContradictions: fetchContradictions,
		toggleDetails,
		setContradictionState,
		updateDraft,
		saveResolutionDetails,
		clearResolutionDetails,
		addEvidence,
		removeEvidence,
	};
}
