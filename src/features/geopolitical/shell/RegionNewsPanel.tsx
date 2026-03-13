import { buildGeoNewsSelectionDetail } from "@/features/geopolitical/selection-detail";
import type { MarketNewsArticle } from "@/lib/news/types";

interface RegionNewsPanelProps {
	activeRegionId: string;
	activeRegionLabel: string;
	news: MarketNewsArticle[];
	onOpenFlatViewForRegion?: (regionId: string) => void;
}

export function RegionNewsPanel({
	activeRegionId,
	activeRegionLabel,
	news,
	onOpenFlatViewForRegion,
}: RegionNewsPanelProps) {
	return (
		<section className="rounded-md border border-border bg-card p-3">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h2 className="text-sm font-semibold">Region News</h2>
					<p className="mt-1 text-xs text-muted-foreground">{activeRegionLabel}</p>
				</div>
				{activeRegionId ? (
					<button
						type="button"
						className="rounded border border-border bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground transition hover:bg-accent"
						onClick={() => onOpenFlatViewForRegion?.(activeRegionId)}
					>
						Open in flat view
					</button>
				) : null}
			</div>
			<div
				className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1"
				tabIndex={0}
				aria-label={`News list for ${activeRegionLabel}`}
			>
				{news.length === 0 ? (
					<p className="text-xs text-muted-foreground">No region news loaded.</p>
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
		</section>
	);
}
