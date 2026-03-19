import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ResearchMatter } from "../types";
import { researchConfidenceTone } from "../utils";

export function MatterCard({ item }: { item: ResearchMatter }) {
	return (
		<Link
			href={item.targetHref}
			className="rounded-2xl border border-border/70 bg-card/70 p-4 transition-colors hover:border-emerald-500/40 hover:bg-card"
		>
			<div className="mb-3 flex items-start justify-between gap-3">
				<div className="space-y-2">
					<Badge variant="outline" className="text-[10px] uppercase tracking-[0.24em]">
						{item.type}
					</Badge>
					<h3 className="text-sm font-semibold leading-5 text-foreground">{item.title}</h3>
				</div>
				<div className="text-right">
					<p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Score</p>
					<p className="text-lg font-semibold text-foreground">{item.score}</p>
				</div>
			</div>
			<p className="text-xs text-muted-foreground">{item.reason}</p>
			<div className="mt-4 flex items-center justify-between text-xs">
				<span className={researchConfidenceTone(item.confidence)}>
					Confidence {(item.confidence * 100).toFixed(0)}%
				</span>
				<span className="text-muted-foreground">{item.freshnessLabel}</span>
			</div>
		</Link>
	);
}
