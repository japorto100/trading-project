import type { BodyPointLayerLegendEntry } from "@/features/geopolitical/layers/bodyPointLayerCatalog";
import type { GeoMapBody } from "@/features/geopolitical/store";

interface MapBodyLayerLegendOverlayProps {
	mapBody: GeoMapBody;
	legends: BodyPointLayerLegendEntry[];
	bodyPointLayerVisibility: Partial<Record<string, boolean>>;
	onToggleBodyPointLayerVisibility: (layerId: string) => void;
	onResetBodyPointLayerVisibility: () => void;
}

export function MapBodyLayerLegendOverlay({
	mapBody,
	legends,
	bodyPointLayerVisibility,
	onToggleBodyPointLayerVisibility,
	onResetBodyPointLayerVisibility,
}: MapBodyLayerLegendOverlayProps) {
	if (legends.length === 0) return null;

	return (
		<div className="absolute bottom-3 left-3 z-10 max-w-80 rounded-lg border border-white/15 bg-background/85 p-3 shadow-lg backdrop-blur">
			<div className="mb-2 flex items-center justify-between gap-2">
				<div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
					{mapBody === "moon" ? "Moon Layers" : "Body Layers"}
				</div>
				<button
					type="button"
					onClick={onResetBodyPointLayerVisibility}
					className="rounded border border-white/15 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/60"
				>
					Reset
				</button>
			</div>
			<div className="space-y-3">
				{legends.map(({ id, name, legend }) => {
					const visible = bodyPointLayerVisibility[id] ?? true;
					return (
						<div key={id} className="space-y-1.5">
							<div className="flex items-center justify-between gap-2">
								<div className="text-xs font-medium text-foreground">{legend.title ?? name}</div>
								<button
									type="button"
									onClick={() => onToggleBodyPointLayerVisibility(id)}
									className={
										visible
											? "rounded border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300"
											: "rounded border border-white/15 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
									}
									aria-pressed={visible}
									aria-label={`${visible ? "Hide" : "Show"} layer ${legend.title ?? name}`}
								>
									{visible ? "On" : "Off"}
								</button>
							</div>
							<div className="space-y-1">
								{legend.items.map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground"
									>
										<div className="flex min-w-0 items-center gap-2">
											<span
												aria-hidden
												className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-white/20"
												style={{ backgroundColor: item.color }}
											/>
											<span className="truncate">{item.label}</span>
										</div>
										{item.description ? (
											<span className="truncate text-[10px] opacity-80">{item.description}</span>
										) : null}
									</div>
								))}
							</div>
							{legend.note ? (
								<div className="text-[10px] text-muted-foreground/90">{legend.note}</div>
							) : null}
						</div>
					);
				})}
			</div>
		</div>
	);
}
