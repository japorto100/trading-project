import { Badge } from "@/components/ui/badge";
import type { ResearchNarrativeLaneItem } from "../types";
import { researchConfidenceTone } from "../utils";

export function NarrativeCard({ item }: { item: ResearchNarrativeLaneItem }) {
	return (
		<div className="rounded-2xl border border-border/70 bg-card/60 p-4">
			<div className="mb-2 flex items-center justify-between gap-3">
				<Badge variant="outline" className="text-[10px] uppercase tracking-[0.24em]">
					{item.kind}
				</Badge>
				<span className={`text-xs ${researchConfidenceTone(item.confidence)}`}>
					{(item.confidence * 100).toFixed(0)}%
				</span>
			</div>
			<h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
			<p className="mt-3 text-xs text-muted-foreground">
				Volatility probability {(item.volProbability * 100).toFixed(0)}%
			</p>
			<p className="mt-2 text-xs text-muted-foreground">
				Affected assets: {item.affectedAssets.join(", ")}
			</p>
		</div>
	);
}
