"use client";

import type { GeoContextItem } from "@/features/geopolitical/shell/types";

type ContextSource = "all" | "cfr" | "crisiswatch";

interface GeopoliticalContextPanelProps {
	source: ContextSource;
	items: GeoContextItem[];
	loading: boolean;
	onSourceChange: (source: ContextSource) => void;
}

function sourceLabel(source: string): string {
	if (source === "cfr") return "CFR";
	if (source === "crisiswatch") return "CrisisWatch";
	return source;
}

function shortDate(value?: string): string {
	if (!value) return "n/a";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toISOString().slice(0, 10);
}

export function GeopoliticalContextPanel({
	source,
	items,
	loading,
	onSourceChange,
}: GeopoliticalContextPanelProps) {
	return (
		<section className="rounded-md border border-border bg-card p-3">
			<div className="flex items-center justify-between gap-2">
				<h2 className="text-sm font-semibold">Conflict Context</h2>
				<select
					className="h-8 rounded-md border border-input bg-background px-2 text-xs"
					value={source}
					onChange={(event) => onSourceChange(event.target.value as ContextSource)}
					aria-label="Context source filter"
				>
					<option value="all">All</option>
					<option value="cfr">CFR</option>
					<option value="crisiswatch">CrisisWatch</option>
				</select>
			</div>

			<p className="mt-1 text-xs text-muted-foreground">
				Link-first context layer (CFR) + RSS updates (CrisisWatch).
			</p>

			<div className="mt-3 space-y-2">
				{loading ? (
					<p className="text-xs text-muted-foreground">Loading context feed...</p>
				) : items.length === 0 ? (
					<p className="text-xs text-muted-foreground">No context items for current filters.</p>
				) : (
					items.slice(0, 10).map((item) => (
						<article key={item.id} className="rounded border border-border/70 bg-background p-2">
							<div className="mb-1 flex flex-wrap items-center gap-1">
								<span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase">
									{sourceLabel(item.source)}
								</span>
								<span className="text-[10px] text-muted-foreground">
									{shortDate(item.publishedAt)}
								</span>
								{item.region ? (
									<span className="text-[10px] text-muted-foreground">{item.region}</span>
								) : null}
							</div>
							<a
								href={item.url}
								target="_blank"
								rel="noreferrer"
								className="text-xs font-medium leading-snug hover:underline"
							>
								{item.title}
							</a>
							{item.summary ? (
								<p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
									{item.summary}
								</p>
							) : null}
						</article>
					))
				)}
			</div>
		</section>
	);
}
