import type { GeoInteractionStatusItem } from "@/features/geopolitical/drawing/drawing-workflow";

interface MapInteractionStatusOverlayProps {
	items: GeoInteractionStatusItem[];
	workflowHint: string;
}

const toneClassMap: Record<GeoInteractionStatusItem["tone"], string> = {
	neutral: "border-border/70 bg-background/70 text-muted-foreground",
	active: "border-primary/30 bg-primary/10 text-primary",
	warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
};

export function MapInteractionStatusOverlay({
	items,
	workflowHint,
}: MapInteractionStatusOverlayProps) {
	return (
		<div className="pointer-events-none absolute bottom-3 left-3 z-30 max-w-[24rem] rounded-lg border border-border/70 bg-card/90 p-3 shadow-xl backdrop-blur">
			<div className="flex flex-wrap gap-1.5">
				{items.map((item) => (
					<span
						key={item.id}
						className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold tracking-wide ${toneClassMap[item.tone]}`}
					>
						{item.label}
					</span>
				))}
			</div>
			<p className="mt-2 text-[11px] leading-5 text-muted-foreground">{workflowHint}</p>
		</div>
	);
}
