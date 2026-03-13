"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buildGeoCandidateSelectionDetail } from "@/features/geopolitical/selection-detail";
import type { GeoCandidate } from "@/lib/geopolitical/types";

interface CandidateQueueProps {
	candidates: GeoCandidate[];
	busy: boolean;
	onAccept: (candidateId: string) => void;
	onReject: (candidateId: string) => void;
	onSnooze: (candidateId: string) => void;
	onReclassify: (candidateId: string) => void;
	onQuickImport: (rawText: string) => void;
}

export function CandidateQueue({
	candidates,
	busy,
	onAccept,
	onReject,
	onSnooze,
	onReclassify,
	onQuickImport,
}: CandidateQueueProps) {
	const [quickImportText, setQuickImportText] = useState("");

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Candidate Queue</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				Hard/soft signals enter here before map persistence.
			</p>
			<div
				className="mt-3 max-h-[260px] space-y-2 overflow-y-auto pr-1"
				tabIndex={0}
				aria-label="Candidate queue list"
			>
				{candidates.length === 0 ? (
					<p className="text-xs text-muted-foreground">No open candidates.</p>
				) : (
					candidates.map((candidate) => {
						const detail = buildGeoCandidateSelectionDetail(candidate);
						return (
							<div key={candidate.id} className="rounded-md border border-border bg-background p-2">
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										{detail.subtitle ?? candidate.triggerType}
									</span>
									<span className="text-[11px] text-muted-foreground">
										{detail.primaryMeta.join(" | ")}
									</span>
								</div>
								<p className="mt-1 text-sm">{detail.title}</p>
								{detail.summary ? (
									<p className="mt-1 text-[11px] text-muted-foreground">{detail.summary}</p>
								) : null}
								{detail.secondaryMeta.length > 0 ? (
									<p className="mt-1 text-[11px] text-muted-foreground">
										{detail.secondaryMeta.join(" • ")}
									</p>
								) : null}
								<div className="mt-2 flex gap-2">
									<Button
										size="sm"
										disabled={busy}
										onClick={() => onAccept(candidate.id)}
										aria-label={`Accept candidate ${candidate.headline}`}
									>
										Signal
									</Button>
									<Button
										size="sm"
										variant="outline"
										disabled={busy}
										onClick={() => onSnooze(candidate.id)}
										aria-label={`Snooze candidate ${candidate.headline}`}
									>
										Uncertain
									</Button>
									<Button
										size="sm"
										variant="destructive"
										disabled={busy}
										onClick={() => onReject(candidate.id)}
										aria-label={`Reject candidate ${candidate.headline}`}
									>
										Noise
									</Button>
									<Button
										size="sm"
										variant="ghost"
										disabled={busy}
										onClick={() => onReclassify(candidate.id)}
										aria-label={`Reclassify candidate ${candidate.headline}`}
									>
										Reclassify
									</Button>
								</div>
							</div>
						);
					})
				)}
			</div>
			<div className="mt-3 rounded-md border border-border bg-background p-2">
				<label htmlFor="candidate-quick-import" className="text-[11px] text-muted-foreground">
					Quick Import (Ctrl+V / paste text)
				</label>
				<textarea
					id="candidate-quick-import"
					name="candidate_quick_import"
					className="mt-1 min-h-[64px] w-full rounded border border-border bg-background px-2 py-1 text-xs"
					value={quickImportText}
					onChange={(event) => setQuickImportText(event.target.value)}
					placeholder="Paste headline, note, URL, or transcript snippet"
				/>
				<div className="mt-2">
					<Button
						size="sm"
						disabled={busy || quickImportText.trim().length < 6}
						onClick={() => {
							onQuickImport(quickImportText.trim());
							setQuickImportText("");
						}}
					>
						Import & Classify
					</Button>
				</div>
			</div>
		</section>
	);
}
