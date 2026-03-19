import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ResearchActionRailItem } from "../types";

export function ActionRailCard({ item }: { item: ResearchActionRailItem }) {
	return (
		<Button
			asChild
			variant="outline"
			className="h-auto w-full justify-between rounded-2xl border-border/70 bg-card/60 p-4 text-left"
		>
			<Link href={item.href}>
				<div>
					<p className="text-sm font-semibold text-foreground">{item.label}</p>
					<p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
				</div>
				<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
			</Link>
		</Button>
	);
}
