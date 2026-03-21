import { buildGeoMarkerListItemModel } from "@/features/geopolitical/markers/marker-view-model";
import type { GeoEvent } from "@/lib/geopolitical/types";

interface MarkerListPanelProps {
	events: GeoEvent[];
	selectedEventId: string | null;
	onSelectEvent: (eventId: string) => void;
}

export function MarkerListPanel({ events, selectedEventId, onSelectEvent }: MarkerListPanelProps) {
	const MAX_VISIBLE_MARKERS = 120;
	const visibleEvents = events.slice(0, MAX_VISIBLE_MARKERS);
	const hiddenCount = Math.max(0, events.length - visibleEvents.length);

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Marker List</h2>
			{hiddenCount > 0 ? (
				<p className="mt-1 text-[11px] text-muted-foreground">
					Showing latest {visibleEvents.length} markers. {hiddenCount} more available via filters.
				</p>
			) : null}
			<div
				className="mt-2 max-h-[260px] space-y-2 overflow-y-auto pr-1"
				tabIndex={0}
				aria-label="Marker list"
			>
				{visibleEvents.length === 0 ? (
					<p className="text-xs text-muted-foreground">No markers saved yet.</p>
				) : (
					visibleEvents.map((event) => {
						const active = selectedEventId === event.id;
						const itemModel = buildGeoMarkerListItemModel(event);

						return (
							<button
								key={event.id}
								type="button"
								onClick={() => onSelectEvent(event.id)}
								aria-pressed={active}
								aria-label={`Select marker ${event.title}`}
								className={`w-full rounded-md border px-2 py-2 text-left text-xs transition-colors ${
									active
										? "border-primary bg-primary/10"
										: "border-border bg-background hover:bg-accent"
								}`}
							>
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<span
											className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-900/30"
											style={{ backgroundColor: itemModel.severityColor }}
										>
											<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
												<path
													d={itemModel.symbolPath}
													transform="translate(12, 12)"
													fill="#f8fafc"
													stroke="#0f172a"
													strokeWidth={0.8}
												/>
											</svg>
										</span>
										<div>
											<div className="font-medium leading-tight">{itemModel.title}</div>
											<div className="mt-0.5 text-[10px] text-muted-foreground">
												{itemModel.subtitle}
											</div>
										</div>
									</div>
									<span className="text-[10px] text-muted-foreground">{itemModel.symbolLabel}</span>
								</div>
								<div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
									<span className="truncate">{itemModel.secondaryLabel}</span>
									<div className="flex flex-wrap items-center justify-end gap-1">
										{itemModel.primaryMeta.map((item) => (
											<span
												key={item}
												className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px]"
											>
												{item === itemModel.severityBadgeLabel ? (
													<span
														className="h-1.5 w-1.5 rounded-full"
														style={{ backgroundColor: itemModel.severityColor }}
													/>
												) : null}
												{item}
											</span>
										))}
									</div>
								</div>
							</button>
						);
					})
				)}
			</div>
		</section>
	);
}
