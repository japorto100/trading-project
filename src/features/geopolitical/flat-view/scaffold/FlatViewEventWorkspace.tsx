import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEventWindow } from "@/features/geopolitical/flat-view/scaffold/flat-view-scaffold-utils";
import type { FlatViewSelectionDetail } from "@/features/geopolitical/flat-view/scaffold/types";
import {
	buildGeoEventSelectionDetail,
	type GeoSelectionDetail,
} from "@/features/geopolitical/selection-detail";
import type { GeoEvent } from "@/lib/geopolitical/types";

interface FlatViewEventWorkspaceProps {
	searchQuery: string;
	filteredEvents: GeoEvent[];
	selectedEventId: string | null;
	selectedBucketEventIds: Set<string>;
	selectedBucketLabel: string | null;
	selectedEventDetail: GeoSelectionDetail | null;
	selectedConflictDetails: FlatViewSelectionDetail[];
	onSearchQueryChange: (value: string) => void;
	onSelectEvent: (eventId: string) => void;
}

export function FlatViewEventWorkspace({
	searchQuery,
	filteredEvents,
	selectedEventId,
	selectedBucketEventIds,
	selectedBucketLabel,
	selectedEventDetail,
	selectedConflictDetails,
	onSearchQueryChange,
	onSelectEvent,
}: FlatViewEventWorkspaceProps) {
	return (
		<>
			<div className="rounded-lg border border-border/70 bg-background/70 p-4">
				<div className="flex items-center justify-between gap-3">
					<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Active Events
					</div>
					<div className="flex items-center gap-2">
						{searchQuery ? (
							<Button
								type="button"
								size="sm"
								variant="ghost"
								className="h-7 px-2 text-[10px] uppercase tracking-wide"
								onClick={() => onSearchQueryChange("")}
							>
								Clear Search
							</Button>
						) : null}
						<div className="text-[11px] text-muted-foreground">{filteredEvents.length} items</div>
					</div>
				</div>
				<Input
					value={searchQuery}
					onChange={(event) => onSearchQueryChange(event.target.value)}
					placeholder="Search visible events, regions, symbols"
					className="mt-3"
					aria-label="Search visible flat view events"
				/>
				{selectedBucketLabel ? (
					<p className="mt-2 text-[11px] text-muted-foreground">
						Temporal focus: {selectedBucketLabel} | {selectedBucketEventIds.size} events in selected
						bucket
					</p>
				) : null}
			</div>

			<div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.85fr)]">
				<div className="min-h-0 overflow-hidden rounded-lg border border-border/70 bg-background/70">
					<div className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Visible Event List
					</div>
					<div className="max-h-[24rem] overflow-y-auto p-3">
						{filteredEvents.length === 0 ? (
							<p className="text-xs text-muted-foreground">
								No events match the current handoff and search filter.
							</p>
						) : (
							<div className="space-y-2">
								{filteredEvents.map((event) => {
									const detail = buildGeoEventSelectionDetail(event);
									const isSelected = event.id === selectedEventId;
									const timelineFocused = selectedBucketEventIds.has(event.id);
									return (
										<button
											key={event.id}
											type="button"
											onClick={() => onSelectEvent(event.id)}
											className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
												isSelected
													? "border-status-warning bg-status-warning/10"
													: timelineFocused
														? "border-sky-400/50 bg-sky-500/10"
														: "border-border/70 bg-card/70 hover:bg-accent/60"
											}`}
										>
											<div className="flex items-start justify-between gap-3">
												<div>
													<p className="text-sm font-medium">{detail.title}</p>
													<p className="mt-1 text-[11px] text-muted-foreground">
														{[detail.subtitle, ...detail.primaryMeta].filter(Boolean).join(" • ")}
													</p>
												</div>
												<span className="rounded border border-border/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
													S{event.severity}
												</span>
											</div>
											<p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">
												{detail.summary ?? "No summary available."}
											</p>
											<div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground/80">
												<span>{formatEventWindow(event)}</span>
												{timelineFocused ? (
													<span className="rounded border border-sky-400/40 px-1.5 py-0.5 uppercase tracking-wide text-sky-300">
														timeline focus
													</span>
												) : null}
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>

				<div className="min-h-0 overflow-hidden rounded-lg border border-border/70 bg-background/70">
					<div className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Selected Event Detail
					</div>
					<div className="space-y-3 p-4 text-sm">
						{selectedEventDetail ? (
							<>
								<div>
									<h3 className="font-semibold">{selectedEventDetail.title}</h3>
									<p className="mt-1 text-xs text-muted-foreground">
										{[selectedEventDetail.subtitle, ...selectedEventDetail.secondaryMeta]
											.filter(Boolean)
											.join(" • ")}
									</p>
								</div>
								<p className="text-xs text-muted-foreground">
									{selectedEventDetail.summary ?? "No summary available."}
								</p>
								<div className="flex flex-wrap gap-2">
									{selectedEventDetail.primaryMeta.map((item) => (
										<span
											key={item}
											className="rounded border border-border/70 bg-card px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground"
										>
											{item}
										</span>
									))}
								</div>
								{selectedConflictDetails.length > 0 ? (
									<div className="space-y-2">
										<div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
											Conflict Objects
										</div>
										<div className="space-y-2">
											{selectedConflictDetails.map((detail) => (
												<div
													key={detail.id}
													className="rounded border border-border/60 bg-card/70 px-2 py-2"
												>
													<div className="text-xs font-medium">{detail.title}</div>
													<div className="mt-1 text-[11px] text-muted-foreground">
														{[detail.kind, detail.subtitle, ...detail.primaryMeta]
															.filter(Boolean)
															.join(" • ")}
													</div>
													{detail.summary ? (
														<div className="mt-1 text-[11px] text-muted-foreground/90">
															{detail.summary}
														</div>
													) : null}
												</div>
											))}
										</div>
									</div>
								) : null}
							</>
						) : (
							<p className="text-xs text-muted-foreground">
								Select an event from the map or the active list to inspect the current flat-view
								focus.
							</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
