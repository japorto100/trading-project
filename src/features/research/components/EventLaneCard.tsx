import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ResearchEventLaneItem } from "../types";
import { researchConfidenceTone, researchImpactTone } from "../utils";

export function EventLaneCard({ item }: { item: ResearchEventLaneItem }) {
	return (
		<Link
			href={item.targetHref}
			className="rounded-2xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-sky-500/40 hover:bg-card"
		>
			<div className="mb-3 flex items-center justify-between gap-3">
				<div>
					<p className="text-xs font-medium text-foreground">{item.title}</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{item.scheduledAt} · {item.region}
					</p>
				</div>
				<Badge variant="outline" className={researchImpactTone(item.impactBand)}>
					{item.impactBand}
				</Badge>
			</div>
			<p className="text-xs text-muted-foreground">{item.playbookHint}</p>
			<p className={`mt-3 text-xs ${researchConfidenceTone(item.confidence)}`}>
				Confidence {(item.confidence * 100).toFixed(0)}%
			</p>
		</Link>
	);
}
