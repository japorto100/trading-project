"use client";

import { GeoPanelFrame } from "@/features/geopolitical/shell/panels/GeoPanelFrame";
import { GeoPanelRuntimeMeta } from "@/features/geopolitical/shell/panels/GeoPanelRuntimeMeta";
import { GeoPanelStateNotice } from "@/features/geopolitical/shell/panels/GeoPanelStateNotice";
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
	onRetry?: () => void;
}

export function SourceHealthPanel({ entries, onRetry }: SourceHealthPanelProps) {
	const summary = buildGeoSourceHealthSummary(entries);
	const panelStatus =
		summary.severity === "healthy"
			? "live"
			: summary.severity === "degraded"
				? "degraded"
				: summary.severity === "outage"
					? "unavailable"
					: "cached";

	return (
		<GeoPanelFrame
			title="Source Health"
			description={summary.summary}
			status={panelStatus}
			statusLabel={summary.severity}
			meta={
				<GeoPanelRuntimeMeta
					items={[
						"health snapshot",
						`${summary.total} providers`,
						`${summary.okCount} ok`,
						`${summary.warnCount} warn`,
					]}
				/>
			}
		>
			<div className="grid gap-2 md:grid-cols-4">
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
					<GeoPanelStateNotice
						message="No source health data loaded."
						tone="warning"
						onRetry={onRetry}
						retryLabel="Refresh"
					/>
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
							{entry.message ? (
								<p className="mt-1 text-[11px] text-muted-foreground">{entry.message}</p>
							) : null}
						</div>
					))
				)}
			</div>
		</GeoPanelFrame>
	);
}
