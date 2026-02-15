"use client";

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
	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Source Health</h2>
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
