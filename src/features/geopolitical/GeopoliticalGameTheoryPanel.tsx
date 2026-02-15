"use client";

import type { GeoGameTheoryItem, GeoGameTheorySummary } from "@/features/geopolitical/shell/types";

interface GeopoliticalGameTheoryPanelProps {
	enabled: boolean;
	loading: boolean;
	items: GeoGameTheoryItem[];
	summary: GeoGameTheorySummary | null;
}

function formatDate(raw: string): string {
	const parsed = new Date(raw);
	if (Number.isNaN(parsed.getTime())) return raw || "n/a";
	return parsed.toISOString().slice(0, 10);
}

function asPercent(value: number): string {
	return `${Math.round(value * 100)}%`;
}

function biasClass(bias: GeoGameTheoryItem["marketBias"]): string {
	if (bias === "risk_off") return "border-red-500/40 text-red-300";
	if (bias === "risk_on") return "border-emerald-500/40 text-emerald-300";
	return "border-border text-muted-foreground";
}

export function GeopoliticalGameTheoryPanel({
	enabled,
	loading,
	items,
	summary,
}: GeopoliticalGameTheoryPanelProps) {
	return (
		<section className="rounded-md border border-border bg-card p-3">
			<div className="flex items-center justify-between gap-2">
				<h2 className="text-sm font-semibold">GameTheory Impact</h2>
				<span className="text-[10px] text-muted-foreground">heuristic v1</span>
			</div>

			<p className="mt-1 text-xs text-muted-foreground">
				ACLED events to Python impact score to market bias and symbol basket.
			</p>

			{!enabled ? (
				<p className="mt-3 text-xs text-muted-foreground">
					Enable ACLED source to load GameTheory impact analysis.
				</p>
			) : loading ? (
				<p className="mt-3 text-xs text-muted-foreground">Scoring geopolitical impact...</p>
			) : items.length === 0 ? (
				<p className="mt-3 text-xs text-muted-foreground">
					No impact items for the current ACLED filters.
				</p>
			) : (
				<>
					{summary ? (
						<div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
							<div className="rounded border border-border/70 bg-background p-2">
								<p className="text-muted-foreground">Analyzed</p>
								<p className="font-medium">{summary.analyzedEvents}</p>
							</div>
							<div className="rounded border border-border/70 bg-background p-2">
								<p className="text-muted-foreground">Avg Impact</p>
								<p className="font-medium">{asPercent(summary.avgImpactScore)}</p>
							</div>
							<div className="rounded border border-border/70 bg-background p-2">
								<p className="text-muted-foreground">Risk Off</p>
								<p className="font-medium">{summary.riskOffCount}</p>
							</div>
							<div className="rounded border border-border/70 bg-background p-2">
								<p className="text-muted-foreground">Top Region</p>
								<p className="font-medium">{summary.topRegion || "n/a"}</p>
							</div>
						</div>
					) : null}

					<div className="mt-3 space-y-2">
						{items.slice(0, 6).map((item) => (
							<article key={item.id} className="rounded border border-border/70 bg-background p-2">
								<div className="mb-1 flex flex-wrap items-center gap-1">
									<span
										className={`rounded border px-1.5 py-0.5 text-[10px] uppercase ${biasClass(item.marketBias)}`}
									>
										{item.marketBias.replace("_", " ")}
									</span>
									<span className="text-[10px] text-muted-foreground">
										impact {asPercent(item.impactScore)}
									</span>
									<span className="text-[10px] text-muted-foreground">
										conf {asPercent(item.confidence)}
									</span>
									<span className="text-[10px] text-muted-foreground">
										{formatDate(item.eventDate)}
									</span>
								</div>
								<p className="text-xs font-medium">{item.eventTitle}</p>
								<p className="mt-1 text-[11px] text-muted-foreground">
									{item.region} | {item.symbols.slice(0, 4).join(", ") || "no symbol mapping"}
								</p>
							</article>
						))}
					</div>
				</>
			)}
		</section>
	);
}
