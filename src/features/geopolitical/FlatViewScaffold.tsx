import { Button } from "@/components/ui/button";
import { FlatViewOverlay } from "@/features/geopolitical/FlatViewOverlay";
import { FlatViewViewport } from "@/features/geopolitical/FlatViewViewport";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view-state";
import type { GeoEvent } from "@/lib/geopolitical/types";

interface FlatViewScaffoldProps {
	state: GeoFlatViewState;
	events: GeoEvent[];
	selectedEventId: string | null;
	onBackToGlobe: () => void;
}

function formatRange(range: [number, number] | null): string {
	if (!range) return "none";
	return `${new Date(range[0]).toISOString()} -> ${new Date(range[1]).toISOString()}`;
}

export function FlatViewScaffold({
	state,
	events,
	selectedEventId,
	onBackToGlobe,
}: FlatViewScaffoldProps) {
	return (
		<div className="flex h-full w-full flex-col rounded-xl border border-border/70 bg-card/70 p-4 backdrop-blur">
			<div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
				<div>
					<h2 className="text-sm font-semibold">Flat / Regional Analyst View</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Scaffold for the future deck.gl + MapLibre renderer. Shared filters, focus and time
						window already flow through the Geo workspace.
					</p>
				</div>
				<Button type="button" size="sm" variant="outline" onClick={onBackToGlobe}>
					Back to Globe
				</Button>
			</div>

			<div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
				<section className="flex min-h-[18rem] flex-col rounded-lg border border-border/70 bg-background/70">
					<div className="border-b border-border/60 px-4 py-3">
						<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Flat Viewport
						</div>
					</div>
					<div className="flex flex-1 p-4">
						<div className="relative h-full w-full">
							<FlatViewViewport state={state} />
							<FlatViewOverlay state={state} events={events} selectedEventId={selectedEventId} />
						</div>
					</div>
				</section>

				<section className="space-y-3 overflow-auto rounded-lg border border-border/70 bg-background/70 p-4">
					<div>
						<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Focus
						</div>
						<div className="mt-2 rounded-md border border-border/60 bg-card/70 p-3 text-sm">
							<div>kind: {state.focus?.kind ?? "none"}</div>
							<div>id: {state.focus?.id ?? "none"}</div>
							<div>region: {state.focus?.regionId ?? "none"}</div>
						</div>
					</div>

					<div>
						<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Bounds
						</div>
						<div className="mt-2 rounded-md border border-border/60 bg-card/70 p-3 text-sm">
							{state.bounds ? (
								<>
									<div>south: {state.bounds.south.toFixed(2)}</div>
									<div>west: {state.bounds.west.toFixed(2)}</div>
									<div>north: {state.bounds.north.toFixed(2)}</div>
									<div>east: {state.bounds.east.toFixed(2)}</div>
								</>
							) : (
								<div className="text-muted-foreground">none</div>
							)}
						</div>
					</div>

					<div>
						<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Layer Families
						</div>
						<div className="mt-2 flex flex-wrap gap-2">
							{state.layerFamilies.map((family) => (
								<span
									key={family}
									className="rounded border border-border/70 bg-card px-2 py-1 text-xs"
								>
									{family}
								</span>
							))}
						</div>
					</div>

					<div>
						<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Temporal Contract
						</div>
						<div className="mt-2 rounded-md border border-border/60 bg-card/70 p-3 text-sm">
							<div>view: {formatRange(state.temporal.viewRangeMs)}</div>
							<div>filter: {formatRange(state.temporal.filterRangeMs)}</div>
							<div>selected time: {state.temporal.selectedTimeMs ?? "none"}</div>
						</div>
					</div>

					<div>
						<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Basemap Policy
						</div>
						<div className="mt-2 rounded-md border border-border/60 bg-card/70 p-3 text-sm">
							<div>richness: {state.basemapPolicy.richness}</div>
							<div>min features: {state.basemapPolicy.minimumFeatures.join(", ")}</div>
							<div>optional: {state.basemapPolicy.optionalFeatures.join(", ") || "none"}</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
