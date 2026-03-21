import { FlatViewOverlay } from "@/features/geopolitical/flat-view/FlatViewOverlay";
import { FlatViewViewport } from "@/features/geopolitical/flat-view/FlatViewViewport";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view/flat-view-state";
import type { FlatViewRendererContract } from "@/features/geopolitical/flat-view/scaffold/types";

interface FlatViewViewportStageProps {
	layerFamilies: GeoFlatViewState["layerFamilies"];
	rendererContract: FlatViewRendererContract;
	visibleEventCount: number;
	selectedBucketLabel: string | null;
	onSelectEvent: (eventId: string) => void;
}

export function FlatViewViewportStage({
	layerFamilies,
	rendererContract,
	visibleEventCount,
	selectedBucketLabel,
	onSelectEvent,
}: FlatViewViewportStageProps) {
	return (
		<section className="flex min-h-[20rem] flex-col rounded-lg border border-border/70 bg-background/70">
			<div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
				<div>
					<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Flat Viewport
					</div>
					<p className="mt-1 text-[11px] text-muted-foreground">
						{visibleEventCount} visible events in current handoff window
					</p>
					{selectedBucketLabel ? (
						<p className="mt-1 text-[11px] text-sky-300">Timeline focus: {selectedBucketLabel}</p>
					) : null}
				</div>
				<div className="flex flex-wrap gap-2">
					{layerFamilies.map((family) => (
						<span
							key={family}
							className="rounded border border-border/70 bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
						>
							{family}
						</span>
					))}
				</div>
			</div>
			<div className="flex flex-1 p-4">
				<div className="relative h-full w-full">
					<FlatViewViewport contract={rendererContract} />
					<FlatViewOverlay contract={rendererContract} onSelectEvent={onSelectEvent} />
				</div>
			</div>
		</section>
	);
}
