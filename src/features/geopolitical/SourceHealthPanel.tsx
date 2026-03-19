"use client";

import { buildGeoSourceHealthSummary } from "@/features/geopolitical/source-health-contract";

interface SourceHealthEntry {
	id: string;
	label: string;
	tier: "A" | "B" | "C";
	type: "hard_signal" | "soft_signal" | "news";
	ok: boolean;
	enabled: boolean;
	message?: string;
}

interface SourceHealthPanelProps {
	entries: SourceHealthEntry[];
}

export function SourceHealthPanel({ entries }: SourceHealthPanelProps) {
	const summary = buildGeoSourceHealthSummary(entries);

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-sm font-semibold">Source Health</h2>
				<span
					className={
						summary.severity === "healthy"
							? "text-[11px] font-medium text-status-success"
							: summary.severity === "outage"
								? "text-[11px] font-medium text-status-error"
								: summary.severity === "degraded"
									? "text-[11px] font-medium text-status-warning"
									: "text-[11px] font-medium text-muted-foreground"
					}
				>
					{summary.severity}
				</span>
			</div>
			<p className="mt-2 text-[11px] text-muted-foreground">{summary.summary}</p>
			<div className="mt-2 grid gap-2 md:grid-cols-4">
				<div className="rounded border border-border bg-background px-2 py-2 text-[11px]">
					total: {summary.total}
				</div>
				<div className="rounded border border-border bg-background px-2 py-2 text-[11px]">
					ok: {summary.okCount}
				</div>
				<div className="rounded border border-border bg-background px-2 py-2 text-[11px]">
					warn: {summary.warnCount}
				</div>
				<div className="rounded border border-border bg-background px-2 py-2 text-[11px]">
					disabled: {summary.disabledCount}
				</div>
			</div>
			<div
				className="mt-2 max-h-52 space-y-2 overflow-y-auto pr-1"
				tabIndex={0}
				aria-label="Source health entries"
			>
				{entries.length === 0 ? (
					<p className="text-xs text-muted-foreground">No source health data loaded.</p>
				) : (
					entries.map((entry) => (
						<div
							key={entry.id}
							className="rounded-md border border-border bg-background px-2 py-2 text-xs"
						>
							<div className="flex items-center justify-between gap-2">
								<span className="font-medium">{entry.label}</span>
								<span className={entry.ok ? "text-emerald-500" : "text-amber-500"}>
									{entry.ok ? "ok" : "warn"}
								</span>
							</div>
							<p className="mt-1 text-[11px] text-muted-foreground">
								tier {entry.tier} | {entry.type} | {entry.enabled ? "enabled" : "disabled"}
							</p>
							{entry.message && (
								<p className="mt-1 text-[11px] text-muted-foreground">{entry.message}</p>
							)}
						</div>
					))
				)}
			</div>
		</section>
	);
}
