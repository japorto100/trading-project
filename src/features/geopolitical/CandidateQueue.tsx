"use client";

import { Button } from "@/components/ui/button";
import type { GeoCandidate } from "@/lib/geopolitical/types";

interface CandidateQueueProps {
	candidates: GeoCandidate[];
	busy: boolean;
	onAccept: (candidateId: string) => void;
	onReject: (candidateId: string) => void;
	onSnooze: (candidateId: string) => void;
}

export function CandidateQueue({
	candidates,
	busy,
	onAccept,
	onReject,
	onSnooze,
}: CandidateQueueProps) {
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
					candidates.map((candidate) => (
						<div key={candidate.id} className="rounded-md border border-border bg-background p-2">
							<div className="flex items-center justify-between gap-2">
								<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									{candidate.triggerType}
								</span>
								<span className="text-[11px] text-muted-foreground">
									conf {candidate.confidence.toFixed(2)} | S{candidate.severityHint}
								</span>
							</div>
							<p className="mt-1 text-sm">{candidate.headline}</p>
							{candidate.regionHint && (
								<p className="mt-1 text-[11px] text-muted-foreground">
									region: {candidate.regionHint}
								</p>
							)}
							<div className="mt-2 flex gap-2">
								<Button
									size="sm"
									disabled={busy}
									onClick={() => onAccept(candidate.id)}
									aria-label={`Accept candidate ${candidate.headline}`}
								>
									Accept
								</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={busy}
									onClick={() => onSnooze(candidate.id)}
									aria-label={`Snooze candidate ${candidate.headline}`}
								>
									Snooze
								</Button>
								<Button
									size="sm"
									variant="destructive"
									disabled={busy}
									onClick={() => onReject(candidate.id)}
									aria-label={`Reject candidate ${candidate.headline}`}
								>
									Reject
								</Button>
							</div>
						</div>
					))
				)}
			</div>
		</section>
	);
}
