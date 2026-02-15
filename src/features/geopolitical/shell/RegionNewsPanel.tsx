import type { MarketNewsArticle } from "@/lib/news/types";

interface RegionNewsPanelProps {
	activeRegionLabel: string;
	news: MarketNewsArticle[];
}

export function RegionNewsPanel({ activeRegionLabel, news }: RegionNewsPanelProps) {
	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Region News</h2>
			<p className="mt-1 text-xs text-muted-foreground">{activeRegionLabel}</p>
			<div
				className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1"
				tabIndex={0}
				aria-label={`News list for ${activeRegionLabel}`}
			>
				{news.length === 0 ? (
					<p className="text-xs text-muted-foreground">No region news loaded.</p>
				) : (
					news.map((article) => (
						<a
							key={article.id}
							href={article.url}
							target="_blank"
							rel="noreferrer"
							className="block rounded-md border border-border bg-background px-2 py-2 text-xs hover:bg-accent"
							aria-label={`Open news article ${article.title}`}
						>
							<p className="font-medium">{article.title}</p>
							<p className="mt-1 text-[11px] text-muted-foreground">{article.source}</p>
						</a>
					))
				)}
			</div>
		</section>
	);
}
