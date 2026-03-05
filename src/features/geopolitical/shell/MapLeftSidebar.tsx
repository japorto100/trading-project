import { MapPinPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMarkerSeverityColor } from "@/features/geopolitical/d3/scales";
import { getMarkerSymbolPath, MARKER_SYMBOL_LEGEND } from "@/features/geopolitical/markerSymbols";

const severityLevels = [1, 2, 3, 4, 5] as const;

interface MapLeftSidebarProps {
	markerPlacementArmed: boolean;
	onToggleMarkerPlacement: () => void;
}

export function MapLeftSidebar({
	markerPlacementArmed,
	onToggleMarkerPlacement,
}: MapLeftSidebarProps) {
	return (
		<aside className="flex h-full w-full flex-col overflow-hidden bg-transparent">
			<div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-accent/10 px-3">
				<div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-foreground uppercase">
					Map Controls
				</div>
			</div>
			<ScrollArea className="flex-1">
				<div className="space-y-3 p-3">
					<section className="rounded-md border border-border bg-card p-3">
						<h2 className="text-sm font-semibold">Marker Actions</h2>
						<p className="mt-1 text-xs text-muted-foreground">
							Arm marker mode, then click on the globe to place a marker.
						</p>
						<Button
							type="button"
							size="sm"
							variant={markerPlacementArmed ? "default" : "outline"}
							className="mt-3 w-full"
							onClick={onToggleMarkerPlacement}
							aria-pressed={markerPlacementArmed}
							aria-label="Toggle marker placement mode"
						>
							<MapPinPlus className="mr-2 h-4 w-4" />
							{markerPlacementArmed ? "Set Marker Active" : "Set Marker"}
						</Button>
					</section>

					<section className="rounded-md border border-border bg-card p-3">
						<h2 className="text-sm font-semibold">Marker Semantics</h2>
						<p className="mt-1 text-xs text-muted-foreground">
							Color encodes severity, symbol encodes event type.
						</p>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{severityLevels.map((severity) => (
								<span
									key={`severity-${severity}`}
									className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-1 text-[10px]"
								>
									<span
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: getMarkerSeverityColor(severity) }}
									/>
									S{severity}
								</span>
							))}
						</div>
						<div className="mt-2 grid grid-cols-1 gap-1.5">
							{MARKER_SYMBOL_LEGEND.map((entry) => (
								<div
									key={entry.symbol}
									className="flex items-center rounded border border-border/70 bg-background/60 px-2 py-1"
								>
									<div className="flex items-center gap-2">
										<span className="inline-flex h-5 w-5 items-center justify-center rounded border border-border bg-muted/40">
											<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
												<path
													d={getMarkerSymbolPath(entry.symbol, 90)}
													transform="translate(12, 12)"
													fill="#e2e8f0"
													stroke="#0f172a"
													strokeWidth={0.8}
												/>
											</svg>
										</span>
										<span className="text-xs">{entry.label}</span>
									</div>
								</div>
							))}
						</div>
					</section>
				</div>
			</ScrollArea>
		</aside>
	);
}
