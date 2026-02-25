"use client";

import { useCallback, useEffect, useState } from "react";
import type { GeoContradiction, GeoContradictionResolution } from "@/lib/geopolitical/types";

interface GeoContradictionsResponse {
	success: boolean;
	contradictions?: GeoContradiction[];
	error?: string;
}

type ContradictionFilter = "open" | "resolved" | "all";

type ContradictionResolutionOutcome = GeoContradictionResolution["outcome"];

interface ContradictionDraftState {
	summary: string;
	resolutionOutcome: ContradictionResolutionOutcome;
	resolutionNote: string;
	mergedEventId: string;
	mergedCandidateId: string;
	evidenceKind: "source" | "note" | "candidate_link" | "event_link";
	evidenceLabel: string;
	evidenceNote: string;
	evidenceUrl: string;
	evidenceEventId: string;
	evidenceCandidateId: string;
}

const DEFAULT_RESOLUTION_OUTCOME: ContradictionResolutionOutcome = "defer_monitoring";

function createDraftFromContradiction(item: GeoContradiction): ContradictionDraftState {
	return {
		summary: item.summary ?? "",
		resolutionOutcome: item.resolution?.outcome ?? DEFAULT_RESOLUTION_OUTCOME,
		resolutionNote: item.resolution?.note ?? "",
		mergedEventId: item.resolution?.mergedEventId ?? "",
		mergedCandidateId: item.resolution?.mergedCandidateId ?? "",
		evidenceKind: "note",
		evidenceLabel: "",
		evidenceNote: "",
		evidenceUrl: "",
		evidenceEventId: "",
		evidenceCandidateId: "",
	};
}

export function GeoContradictionsPanel() {
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

	const openDetails = useCallback((item: GeoContradiction) => {
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

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<div className="flex items-center justify-between gap-2">
				<div>
					<h2 className="text-sm font-semibold">Contradictions</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Cross-source conflicts ({items.length})
					</p>
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50"
						onClick={() => void fetchContradictions()}
						disabled={loading || actionBusyId !== null}
					>
						{loading ? "Loading..." : "Refresh"}
					</button>
				</div>
			</div>
			<div className="mt-2 flex flex-wrap gap-1">
				{(
					[
						["open", "Open"],
						["resolved", "Resolved"],
						["all", "All"],
					] as const
				).map(([value, label]) => (
					<button
						key={value}
						type="button"
						className={`rounded border px-2 py-1 text-[11px] ${
							stateFilter === value
								? "border-primary bg-primary/10 text-primary"
								: "border-border hover:bg-muted/50"
						}`}
						onClick={() => setStateFilter(value)}
						disabled={loading || actionBusyId !== null}
					>
						{label}
					</button>
				))}
			</div>
			{error ? (
				<div className="mt-2 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400">
					{error}
				</div>
			) : null}
			<div className="mt-2 space-y-2">
				{items.length === 0 && !loading ? (
					<div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
						No contradictions for this filter.
					</div>
				) : (
					items.slice(0, 8).map((item) => (
						<div
							key={item.id}
							className="rounded-md border border-border bg-background px-3 py-2 text-xs"
						>
							<div className="flex items-center justify-between gap-2">
								<p className="font-medium">{item.title}</p>
								<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
									<span
										className={`rounded border px-1.5 py-0.5 ${
											item.state === "resolved"
												? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
												: "border-amber-500/30 bg-amber-500/10 text-amber-200"
										}`}
									>
										{item.state}
									</span>
									<span>
										S{item.severityHint} {item.regionId ? `· ${item.regionId}` : ""}
									</span>
								</div>
							</div>
							{item.summary ? <p className="mt-1 text-muted-foreground">{item.summary}</p> : null}
							<div className="mt-2 space-y-1">
								<p className="rounded bg-muted/40 px-2 py-1 text-[11px]">A: {item.statementA}</p>
								<p className="rounded bg-muted/40 px-2 py-1 text-[11px]">B: {item.statementB}</p>
							</div>
							<div className="mt-2 flex items-center justify-between gap-2">
								<p className="text-[11px] text-muted-foreground">
									Updated {new Date(item.updatedAt).toLocaleString()}
								</p>
								<div className="flex items-center gap-1">
									<button
										type="button"
										className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
										onClick={() => openDetails(item)}
										disabled={loading || actionBusyId !== null}
									>
										{expandedId === item.id ? "Hide" : "Details"}
									</button>
									<button
										type="button"
										className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
										onClick={() =>
											void setContradictionState(
												item.id,
												item.state === "open" ? "resolved" : "open",
											)
										}
										disabled={loading || actionBusyId !== null}
									>
										{actionBusyId === item.id
											? "Saving..."
											: item.state === "open"
												? "Resolve"
												: "Reopen"}
									</button>
								</div>
							</div>
							{item.resolution ? (
								<div className="mt-2 rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[11px]">
									<div className="flex items-center justify-between gap-2">
										<span className="font-medium">Resolution: {item.resolution.outcome}</span>
										<span className="text-muted-foreground">
											{new Date(item.resolution.resolvedAt).toLocaleString()}
										</span>
									</div>
									{item.resolution.note ? (
										<p className="mt-1 text-muted-foreground">{item.resolution.note}</p>
									) : null}
									{item.resolution.mergedEventId || item.resolution.mergedCandidateId ? (
										<p className="mt-1 text-muted-foreground">
											{item.resolution.mergedEventId
												? `event=${item.resolution.mergedEventId} `
												: ""}
											{item.resolution.mergedCandidateId
												? `candidate=${item.resolution.mergedCandidateId}`
												: ""}
										</p>
									) : null}
								</div>
							) : null}
							{item.evidence.length > 0 ? (
								<div className="mt-2 rounded border border-border/70 bg-muted/20 px-2 py-1 text-[11px]">
									<p className="font-medium">Evidence ({item.evidence.length})</p>
									<div className="mt-1 space-y-1">
										{item.evidence
											.slice(0, expandedId === item.id ? item.evidence.length : 2)
											.map((evidence) => (
												<div key={evidence.id} className="rounded bg-background/70 px-2 py-1">
													<div className="flex items-center justify-between gap-2">
														<span>
															[{evidence.kind}] {evidence.label}
														</span>
														{expandedId === item.id ? (
															<button
																type="button"
																className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted/50 disabled:opacity-50"
																onClick={() => void removeEvidence(item.id, evidence.id)}
																disabled={loading || actionBusyId !== null}
															>
																Remove
															</button>
														) : null}
													</div>
													{evidence.note ? (
														<p className="mt-1 text-muted-foreground">{evidence.note}</p>
													) : null}
												</div>
											))}
									</div>
								</div>
							) : null}
							{expandedId === item.id ? (
								<div className="mt-2 space-y-2 rounded border border-border bg-muted/10 p-2">
									<div className="grid gap-2 md:grid-cols-2">
										<label className="space-y-1">
											<span className="text-[11px] text-muted-foreground">Resolution outcome</span>
											<select
												className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
												value={
													(drafts[item.id] ?? createDraftFromContradiction(item)).resolutionOutcome
												}
												onChange={(event) =>
													updateDraft(item.id, (prev) => ({
														...prev,
														resolutionOutcome: event.target.value as ContradictionResolutionOutcome,
													}))
												}
												disabled={loading || actionBusyId !== null}
											>
												<option value="defer_monitoring">defer_monitoring</option>
												<option value="prefer_statement_a">prefer_statement_a</option>
												<option value="prefer_statement_b">prefer_statement_b</option>
												<option value="merged_into_event">merged_into_event</option>
												<option value="merged_into_candidate">merged_into_candidate</option>
												<option value="insufficient_evidence">insufficient_evidence</option>
											</select>
										</label>
										<label className="space-y-1">
											<span className="text-[11px] text-muted-foreground">Summary</span>
											<input
												className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
												value={(drafts[item.id] ?? createDraftFromContradiction(item)).summary}
												onChange={(event) =>
													updateDraft(item.id, (prev) => ({ ...prev, summary: event.target.value }))
												}
												disabled={loading || actionBusyId !== null}
											/>
										</label>
									</div>
									<div className="grid gap-2 md:grid-cols-2">
										<label className="space-y-1">
											<span className="text-[11px] text-muted-foreground">Merged event ID</span>
											<input
												className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
												placeholder="ge_..."
												value={
													(drafts[item.id] ?? createDraftFromContradiction(item)).mergedEventId
												}
												onChange={(event) =>
													updateDraft(item.id, (prev) => ({
														...prev,
														mergedEventId: event.target.value,
													}))
												}
												disabled={loading || actionBusyId !== null}
											/>
										</label>
										<label className="space-y-1">
											<span className="text-[11px] text-muted-foreground">Merged candidate ID</span>
											<input
												className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
												placeholder="gc_..."
												value={
													(drafts[item.id] ?? createDraftFromContradiction(item)).mergedCandidateId
												}
												onChange={(event) =>
													updateDraft(item.id, (prev) => ({
														...prev,
														mergedCandidateId: event.target.value,
													}))
												}
												disabled={loading || actionBusyId !== null}
											/>
										</label>
									</div>
									<label className="block space-y-1">
										<span className="text-[11px] text-muted-foreground">Resolution note</span>
										<textarea
											className="min-h-16 w-full rounded border border-border bg-background px-2 py-1 text-xs"
											value={(drafts[item.id] ?? createDraftFromContradiction(item)).resolutionNote}
											onChange={(event) =>
												updateDraft(item.id, (prev) => ({
													...prev,
													resolutionNote: event.target.value,
												}))
											}
											disabled={loading || actionBusyId !== null}
										/>
									</label>
									<div className="flex flex-wrap gap-1">
										<button
											type="button"
											className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
											onClick={() => void saveResolutionDetails(item)}
											disabled={loading || actionBusyId !== null}
										>
											Save details
										</button>
										<button
											type="button"
											className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
											onClick={() => void clearResolutionDetails(item)}
											disabled={loading || actionBusyId !== null}
										>
											Clear resolution
										</button>
									</div>

									<div className="border-t border-border pt-2">
										<p className="mb-1 text-[11px] font-medium text-muted-foreground">
											Add evidence
										</p>
										<div className="grid gap-2 md:grid-cols-2">
											<label className="space-y-1">
												<span className="text-[11px] text-muted-foreground">Kind</span>
												<select
													className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
													value={
														(drafts[item.id] ?? createDraftFromContradiction(item)).evidenceKind
													}
													onChange={(event) =>
														updateDraft(item.id, (prev) => ({
															...prev,
															evidenceKind: event.target
																.value as ContradictionDraftState["evidenceKind"],
														}))
													}
													disabled={loading || actionBusyId !== null}
												>
													<option value="note">note</option>
													<option value="source">source</option>
													<option value="event_link">event_link</option>
													<option value="candidate_link">candidate_link</option>
												</select>
											</label>
											<label className="space-y-1">
												<span className="text-[11px] text-muted-foreground">Label</span>
												<input
													className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
													value={
														(drafts[item.id] ?? createDraftFromContradiction(item)).evidenceLabel
													}
													onChange={(event) =>
														updateDraft(item.id, (prev) => ({
															...prev,
															evidenceLabel: event.target.value,
														}))
													}
													disabled={loading || actionBusyId !== null}
												/>
											</label>
										</div>
										<div className="mt-2 grid gap-2 md:grid-cols-2">
											<label className="space-y-1">
												<span className="text-[11px] text-muted-foreground">URL (optional)</span>
												<input
													className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
													value={
														(drafts[item.id] ?? createDraftFromContradiction(item)).evidenceUrl
													}
													onChange={(event) =>
														updateDraft(item.id, (prev) => ({
															...prev,
															evidenceUrl: event.target.value,
														}))
													}
													disabled={loading || actionBusyId !== null}
												/>
											</label>
											<label className="space-y-1">
												<span className="text-[11px] text-muted-foreground">
													Event/Candidate link IDs
												</span>
												<div className="grid grid-cols-2 gap-1">
													<input
														className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
														placeholder="eventId"
														value={
															(drafts[item.id] ?? createDraftFromContradiction(item))
																.evidenceEventId
														}
														onChange={(event) =>
															updateDraft(item.id, (prev) => ({
																...prev,
																evidenceEventId: event.target.value,
															}))
														}
														disabled={loading || actionBusyId !== null}
													/>
													<input
														className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
														placeholder="candidateId"
														value={
															(drafts[item.id] ?? createDraftFromContradiction(item))
																.evidenceCandidateId
														}
														onChange={(event) =>
															updateDraft(item.id, (prev) => ({
																...prev,
																evidenceCandidateId: event.target.value,
															}))
														}
														disabled={loading || actionBusyId !== null}
													/>
												</div>
											</label>
										</div>
										<label className="mt-2 block space-y-1">
											<span className="text-[11px] text-muted-foreground">Evidence note</span>
											<textarea
												className="min-h-14 w-full rounded border border-border bg-background px-2 py-1 text-xs"
												value={(drafts[item.id] ?? createDraftFromContradiction(item)).evidenceNote}
												onChange={(event) =>
													updateDraft(item.id, (prev) => ({
														...prev,
														evidenceNote: event.target.value,
													}))
												}
												disabled={loading || actionBusyId !== null}
											/>
										</label>
										<div className="mt-2">
											<button
												type="button"
												className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
												onClick={() => void addEvidence(item)}
												disabled={loading || actionBusyId !== null}
											>
												Add evidence
											</button>
										</div>
									</div>
								</div>
							) : null}
						</div>
					))
				)}
			</div>
		</section>
	);
}
