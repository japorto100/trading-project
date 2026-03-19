import { Globe, LayoutDashboard, Sparkles, TrendingUp } from "lucide-react";
import type { ResearchActionRailItem } from "../types";
import { ActionRailCard } from "./ActionRailCard";

export function ResearchActionRail({ items }: { items: ResearchActionRailItem[] }) {
	return (
		<aside className="space-y-4">
			<div className="rounded-3xl border border-border/70 bg-card/60 p-5">
				<div className="mb-4 flex items-center gap-2">
					<LayoutDashboard className="h-4 w-4 text-muted-foreground" />
					<h2 className="text-lg font-semibold text-foreground">Action Rail</h2>
				</div>
				<div className="space-y-3">
					{items.map((item) => (
						<ActionRailCard key={item.id} item={item} />
					))}
				</div>
			</div>

			<div className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-5">
				<p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
					Phase 1 boundaries
				</p>
				<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
					<li className="flex items-start gap-2">
						<TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
						<span>Post-login and root redirect stay on /trading for now.</span>
					</li>
					<li className="flex items-start gap-2">
						<Globe className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
						<span>
							GeoMap remains the main event drilldown surface until dedicated event pages exist.
						</span>
					</li>
					<li className="flex items-start gap-2">
						<Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
						<span>
							Real research/home payloads, reason enums, and degraded states are the next contract
							slice.
						</span>
					</li>
				</ul>
			</div>
		</aside>
	);
}
