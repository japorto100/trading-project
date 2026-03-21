"use client";

import { buildGeoContextSelectionDetail } from "@/features/geopolitical/selection-detail";
import { GeoPanelFrame } from "@/features/geopolitical/shell/panels/GeoPanelFrame";
import { GeoPanelRuntimeMeta } from "@/features/geopolitical/shell/panels/GeoPanelRuntimeMeta";
import { GeoPanelStateNotice } from "@/features/geopolitical/shell/panels/GeoPanelStateNotice";
import type { GeoContextItem } from "@/features/geopolitical/shell/types";

type ContextSource = "all" | "cfr" | "crisiswatch";

interface GeopoliticalContextPanelProps {
	source: ContextSource;
	items: GeoContextItem[];
	loading: boolean;
	onSourceChange: (source: ContextSource) => void;
	onRetry?: () => void;
}

function sourceLabel(source: string): string {
	if (source === "cfr") return "CFR";
	if (source === "crisiswatch") return "CrisisWatch";
	return source;
}

export function GeopoliticalContextPanel({
	source,
	items,
	loading,
	onSourceChange,
	onRetry,
}: GeopoliticalContextPanelProps) {
	const panelStatus = loading ? "cached" : items.length > 0 ? "live" : "unavailable";
	const panelStatusLabel = loading ? "cached" : items.length > 0 ? "live" : "unavailable";
	return (
		<GeoPanelFrame
			title="Conflict Context"
			description="Link-first context layer (CFR) + RSS updates (CrisisWatch)."
			status={panelStatus}
			statusLabel={panelStatusLabel}
			meta={
				<GeoPanelRuntimeMeta
					items={["context feed", sourceLabel(source), `${items.length} items`]}
				/>
			}
			actions={
				<select
					id="geo-context-source-filter"
					name="geo_context_source_filter"
					className="h-8 rounded-md border border-input bg-background px-2 text-xs"
					value={source}
					onChange={(event) => onSourceChange(event.target.value as ContextSource)}
					aria-label="Context source filter"
				>
					<option value="all">All</option>
					<option value="cfr">CFR</option>
					<option value="crisiswatch">CrisisWatch</option>
				</select>
			}
		>
			<div className="space-y-2">
				{loading ? (
					<GeoPanelStateNotice
						message="Refreshing context feed..."
						retryLabel="Reload"
						onRetry={onRetry}
					/>
				) : items.length === 0 ? (
					<GeoPanelStateNotice
						message="No context items for current filters."
						tone="warning"
						onRetry={onRetry}
						retryLabel="Reload"
					/>
				) : (
					items.slice(0, 10).map((item) => {
						const detail = buildGeoContextSelectionDetail(item);
						return (
							<article key={item.id} className="rounded border border-border/70 bg-background p-2">
								<div className="mb-1 flex flex-wrap items-center gap-1">
									<span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase">
										{sourceLabel(item.source)}
									</span>
									{detail.primaryMeta.slice(1).map((meta) => (
										<span key={`${item.id}-${meta}`} className="text-[10px] text-muted-foreground">
											{meta}
										</span>
									))}
									{detail.secondaryMeta.map((meta) => (
										<span key={`${item.id}-${meta}`} className="text-[10px] text-muted-foreground">
											{meta}
										</span>
									))}
								</div>
								<a
									href={item.url}
									target="_blank"
									rel="noreferrer"
									className="text-xs font-medium leading-snug hover:underline"
								>
									{detail.title}
								</a>
								{detail.summary ? (
									<p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
										{detail.summary}
									</p>
								) : null}
							</article>
						);
					})
				)}
			</div>
		</GeoPanelFrame>
	);
}
