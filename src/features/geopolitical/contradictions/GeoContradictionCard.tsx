import {
	type ContradictionDraftState,
	type ContradictionResolutionOutcome,
	createDraftFromContradiction,
} from "@/features/geopolitical/contradictions/types";
import type { GeoContradiction } from "@/lib/geopolitical/types";

interface GeoContradictionCardProps {
	item: GeoContradiction;
	isExpanded: boolean;
	isBusy: boolean;
	draft?: ContradictionDraftState;
	onToggleDetails: (item: GeoContradiction) => void;
	onSetContradictionState: (
		contradictionId: string,
		nextState: "open" | "resolved",
	) => Promise<void>;
	onUpdateDraft: (
		contradictionId: string,
		updater: (prev: ContradictionDraftState) => ContradictionDraftState,
	) => void;
	onSaveResolutionDetails: (item: GeoContradiction) => Promise<void>;
	onClearResolutionDetails: (item: GeoContradiction) => Promise<void>;
	onAddEvidence: (item: GeoContradiction) => Promise<void>;
	onRemoveEvidence: (contradictionId: string, evidenceId: string) => Promise<void>;
	disabled: boolean;
}

export function GeoContradictionCard({
	item,
	isExpanded,
	isBusy,
	draft,
	onToggleDetails,
	onSetContradictionState,
	onUpdateDraft,
	onSaveResolutionDetails,
	onClearResolutionDetails,
	onAddEvidence,
	onRemoveEvidence,
	disabled,
}: GeoContradictionCardProps) {
	const currentDraft = draft ?? createDraftFromContradiction(item);

	return (
		<div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
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
						onClick={() => onToggleDetails(item)}
						disabled={disabled}
					>
						{isExpanded ? "Hide" : "Details"}
					</button>
					<button
						type="button"
						className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
						onClick={() =>
							void onSetContradictionState(item.id, item.state === "open" ? "resolved" : "open")
						}
						disabled={disabled}
					>
						{isBusy ? "Saving..." : item.state === "open" ? "Resolve" : "Reopen"}
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
							{item.resolution.mergedEventId ? `event=${item.resolution.mergedEventId} ` : ""}
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
						{item.evidence.slice(0, isExpanded ? item.evidence.length : 2).map((evidence) => (
							<div key={evidence.id} className="rounded bg-background/70 px-2 py-1">
								<div className="flex items-center justify-between gap-2">
									<span>
										[{evidence.kind}] {evidence.label}
									</span>
									{isExpanded ? (
										<button
											type="button"
											className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted/50 disabled:opacity-50"
											onClick={() => void onRemoveEvidence(item.id, evidence.id)}
											disabled={disabled}
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
			{isExpanded ? (
				<div className="mt-2 space-y-2 rounded border border-border bg-muted/10 p-2">
					<div className="grid gap-2 md:grid-cols-2">
						<label className="space-y-1">
							<span className="text-[11px] text-muted-foreground">Resolution outcome</span>
							<select
								id={`contradiction-resolution-outcome-${item.id}`}
								name={`contradiction_resolution_outcome_${item.id}`}
								className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
								value={currentDraft.resolutionOutcome}
								onChange={(event) =>
									onUpdateDraft(item.id, (prev) => ({
										...prev,
										resolutionOutcome: event.target.value as ContradictionResolutionOutcome,
									}))
								}
								disabled={disabled}
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
								id={`contradiction-summary-${item.id}`}
								name={`contradiction_summary_${item.id}`}
								className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
								value={currentDraft.summary}
								onChange={(event) =>
									onUpdateDraft(item.id, (prev) => ({ ...prev, summary: event.target.value }))
								}
								disabled={disabled}
							/>
						</label>
					</div>
					<div className="grid gap-2 md:grid-cols-2">
						<label className="space-y-1">
							<span className="text-[11px] text-muted-foreground">Merged event ID</span>
							<input
								id={`contradiction-merged-event-${item.id}`}
								name={`contradiction_merged_event_id_${item.id}`}
								className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
								placeholder="ge_..."
								value={currentDraft.mergedEventId}
								onChange={(event) =>
									onUpdateDraft(item.id, (prev) => ({ ...prev, mergedEventId: event.target.value }))
								}
								disabled={disabled}
							/>
						</label>
						<label className="space-y-1">
							<span className="text-[11px] text-muted-foreground">Merged candidate ID</span>
							<input
								id={`contradiction-merged-candidate-${item.id}`}
								name={`contradiction_merged_candidate_id_${item.id}`}
								className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
								placeholder="gc_..."
								value={currentDraft.mergedCandidateId}
								onChange={(event) =>
									onUpdateDraft(item.id, (prev) => ({
										...prev,
										mergedCandidateId: event.target.value,
									}))
								}
								disabled={disabled}
							/>
						</label>
					</div>
					<label className="block space-y-1">
						<span className="text-[11px] text-muted-foreground">Resolution note</span>
						<textarea
							id={`contradiction-resolution-note-${item.id}`}
							name={`contradiction_resolution_note_${item.id}`}
							className="min-h-16 w-full rounded border border-border bg-background px-2 py-1 text-xs"
							value={currentDraft.resolutionNote}
							onChange={(event) =>
								onUpdateDraft(item.id, (prev) => ({ ...prev, resolutionNote: event.target.value }))
							}
							disabled={disabled}
						/>
					</label>
					<div className="flex flex-wrap gap-1">
						<button
							type="button"
							className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
							onClick={() => void onSaveResolutionDetails(item)}
							disabled={disabled}
						>
							Save details
						</button>
						<button
							type="button"
							className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
							onClick={() => void onClearResolutionDetails(item)}
							disabled={disabled}
						>
							Clear resolution
						</button>
					</div>
					<div className="border-t border-border pt-2">
						<p className="mb-1 text-[11px] font-medium text-muted-foreground">Add evidence</p>
						<div className="grid gap-2 md:grid-cols-2">
							<label className="space-y-1">
								<span className="text-[11px] text-muted-foreground">Kind</span>
								<select
									id={`contradiction-evidence-kind-${item.id}`}
									name={`contradiction_evidence_kind_${item.id}`}
									className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
									value={currentDraft.evidenceKind}
									onChange={(event) =>
										onUpdateDraft(item.id, (prev) => ({
											...prev,
											evidenceKind: event.target.value as ContradictionDraftState["evidenceKind"],
										}))
									}
									disabled={disabled}
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
									id={`contradiction-evidence-label-${item.id}`}
									name={`contradiction_evidence_label_${item.id}`}
									className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
									value={currentDraft.evidenceLabel}
									onChange={(event) =>
										onUpdateDraft(item.id, (prev) => ({
											...prev,
											evidenceLabel: event.target.value,
										}))
									}
									disabled={disabled}
								/>
							</label>
						</div>
						<div className="mt-2 grid gap-2 md:grid-cols-2">
							<label className="space-y-1">
								<span className="text-[11px] text-muted-foreground">URL (optional)</span>
								<input
									id={`contradiction-evidence-url-${item.id}`}
									name={`contradiction_evidence_url_${item.id}`}
									className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
									value={currentDraft.evidenceUrl}
									onChange={(event) =>
										onUpdateDraft(item.id, (prev) => ({ ...prev, evidenceUrl: event.target.value }))
									}
									disabled={disabled}
								/>
							</label>
							<label className="space-y-1">
								<span className="text-[11px] text-muted-foreground">Event/Candidate link IDs</span>
								<div className="grid grid-cols-2 gap-1">
									<input
										id={`contradiction-evidence-event-id-${item.id}`}
										name={`contradiction_evidence_event_id_${item.id}`}
										className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
										placeholder="eventId"
										value={currentDraft.evidenceEventId}
										onChange={(event) =>
											onUpdateDraft(item.id, (prev) => ({
												...prev,
												evidenceEventId: event.target.value,
											}))
										}
										disabled={disabled}
									/>
									<input
										id={`contradiction-evidence-candidate-id-${item.id}`}
										name={`contradiction_evidence_candidate_id_${item.id}`}
										className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
										placeholder="candidateId"
										value={currentDraft.evidenceCandidateId}
										onChange={(event) =>
											onUpdateDraft(item.id, (prev) => ({
												...prev,
												evidenceCandidateId: event.target.value,
											}))
										}
										disabled={disabled}
									/>
								</div>
							</label>
						</div>
						<label className="mt-2 block space-y-1">
							<span className="text-[11px] text-muted-foreground">Evidence note</span>
							<textarea
								id={`contradiction-evidence-note-${item.id}`}
								name={`contradiction_evidence_note_${item.id}`}
								className="min-h-14 w-full rounded border border-border bg-background px-2 py-1 text-xs"
								value={currentDraft.evidenceNote}
								onChange={(event) =>
									onUpdateDraft(item.id, (prev) => ({ ...prev, evidenceNote: event.target.value }))
								}
								disabled={disabled}
							/>
						</label>
						<div className="mt-2">
							<button
								type="button"
								className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50 disabled:opacity-50"
								onClick={() => void onAddEvidence(item)}
								disabled={disabled}
							>
								Add evidence
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
