"use client";

interface GeoEvaluationSectionProps {
	evaluationLoading: boolean;
	evaluationError: string | null;
	reviewTotal: number;
	acceptRate: number;
	rejectRate: number;
	snoozeRate: number;
	openCandidates: number;
	totalCandidates: number;
	contradictionCreated: number;
	contradictionResolved: number;
	timelineCount: number;
}

export function GeoEvaluationSection(props: GeoEvaluationSectionProps) {
	return (
		<section className="rounded border border-border bg-background p-2">
			<div className="mb-2 flex items-center justify-between">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Evaluation
				</h3>
				<span className="text-[10px] text-muted-foreground">
					{props.evaluationLoading ? "Loading…" : "API-backed preview"}
				</span>
			</div>
			{props.evaluationError ? (
				<p className="mb-2 text-[11px] text-red-400">{props.evaluationError}</p>
			) : null}
			<div className="grid gap-2 sm:grid-cols-2">
				<div className="rounded border border-border px-2 py-2 text-xs">
					<div className="text-muted-foreground">Review actions</div>
					<div className="mt-1 text-sm font-semibold">{props.reviewTotal}</div>
					<div className="mt-1 text-[11px] text-muted-foreground">
						A {Math.round(props.acceptRate * 100)}% · R {Math.round(props.rejectRate * 100)}% · S{" "}
						{Math.round(props.snoozeRate * 100)}%
					</div>
				</div>
				<div className="rounded border border-border px-2 py-2 text-xs">
					<div className="text-muted-foreground">Queue pressure</div>
					<div className="mt-1 text-sm font-semibold">{props.openCandidates}</div>
					<div className="mt-1 text-[11px] text-muted-foreground">
						open candidates · {props.totalCandidates} total candidates
					</div>
				</div>
				<div className="rounded border border-border px-2 py-2 text-xs">
					<div className="text-muted-foreground">Contradictions</div>
					<div className="mt-1 text-sm font-semibold">{props.contradictionCreated}</div>
					<div className="mt-1 text-[11px] text-muted-foreground">
						resolved {props.contradictionResolved}
					</div>
				</div>
				<div className="rounded border border-border px-2 py-2 text-xs">
					<div className="text-muted-foreground">Timeline records</div>
					<div className="mt-1 text-sm font-semibold">{props.timelineCount}</div>
					<div className="mt-1 text-[11px] text-muted-foreground">
						Use Go timeline for evaluation exports later
					</div>
				</div>
			</div>
		</section>
	);
}
