import { buildGeoNewsSelectionDetail } from "@/features/geopolitical/selection-detail";
import { GeoPanelFrame } from "@/features/geopolitical/shell/panels/GeoPanelFrame";
import { GeoPanelRuntimeMeta } from "@/features/geopolitical/shell/panels/GeoPanelRuntimeMeta";
import { GeoPanelStateNotice } from "@/features/geopolitical/shell/panels/GeoPanelStateNotice";
import type { MarketNewsArticle } from "@/lib/news/types";

interface RegionNewsPanelProps {
	activeRegionId: string;
	activeRegionLabel: string;
	news: MarketNewsArticle[];
	onOpenFlatViewForRegion?: (regionId: string) => void;
	onRetry?: () => void;
}

export function RegionNewsPanel({
	activeRegionId,
	activeRegionLabel,
	news,
	onOpenFlatViewForRegion,
	onRetry,
}: RegionNewsPanelProps) {
	const panelStatus = activeRegionId ? (news.length > 0 ? "live" : "cached") : "unavailable";
	return (
		<GeoPanelFrame
			title="Region News"
			description={activeRegionLabel}
			status={panelStatus}
			meta={
				<GeoPanelRuntimeMeta
					items={["news snapshot", activeRegionId || "no-region", `${news.length} articles`]}
				/>
			}
			actions={
				activeRegionId ? (
					<button
						type="button"
						className="rounded border border-border bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground transition hover:bg-accent"
						onClick={() => onOpenFlatViewForRegion?.(activeRegionId)}
					>
						Open in flat view
					</button>
				) : null
			}
		>
			<div
				className="max-h-48 space-y-2 overflow-y-auto pr-1"
				tabIndex={0}
				aria-label={`News list for ${activeRegionLabel}`}
			>
				{news.length === 0 ? (
					<GeoPanelStateNotice
						message="No region news loaded."
						tone="warning"
						onRetry={onRetry}
						retryLabel="Reload"
					/>
				) : (
					news.map((article) => {
						const detail = buildGeoNewsSelectionDetail(article);
						return (
							<a
								key={article.id}
								href={article.url}
								target="_blank"
								rel="noreferrer"
								className="block rounded-md border border-border bg-background px-2 py-2 text-xs hover:bg-accent"
								aria-label={`Open news article ${detail.title}`}
							>
								<p className="font-medium">{detail.title}</p>
								<p className="mt-1 text-[11px] text-muted-foreground">
									{[detail.subtitle, ...detail.primaryMeta].filter(Boolean).join(" • ")}
								</p>
								{detail.summary ? (
									<p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
										{detail.summary}
									</p>
								) : null}
							</a>
						);
					})
				)}
			</div>
		</GeoPanelFrame>
	);
}
