import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlatViewOverlay } from "@/features/geopolitical/FlatViewOverlay";
import { FlatViewViewport } from "@/features/geopolitical/FlatViewViewport";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view-handoff";
import { getGeoFlatRelationLayerPolicy } from "@/features/geopolitical/flat-view-relation-layer-policy";
import { buildGeoFlatViewRendererContract } from "@/features/geopolitical/flat-view-renderer-contract";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view-state";
import {
	type GeoFlatLayerOptionId,
	type GeoMapLayerFamily,
	getGeoMapFlatLayerOptionsByFamily,
	getGeoMapFlatLayerOptionsForFamilies,
	getGeoMapLayerFamilyDefinition,
} from "@/features/geopolitical/layer-taxonomy";
import {
	buildGeoConflictAssetSelectionDetail,
	buildGeoConflictHeatSelectionDetail,
	buildGeoConflictStrikeSelectionDetail,
	buildGeoConflictTargetSelectionDetail,
	buildGeoConflictZoneSelectionDetail,
	buildGeoEventSelectionDetail,
} from "@/features/geopolitical/selection-detail";
import type { GeoEvent } from "@/lib/geopolitical/types";

interface FlatViewScaffoldProps {
	state: GeoFlatViewState;
	events: GeoEvent[];
	showFiltersToolbar: boolean;
	showBodyLayerLegend: boolean;
	showTimelinePanel: boolean;
	selectedEventId: string | null;
	onSelectEvent: (eventId: string) => void;
	onBackToGlobe: () => void;
}

function formatRange(range: [number, number] | null): string {
	if (!range) return "none";
	return `${new Date(range[0]).toISOString()} -> ${new Date(range[1]).toISOString()}`;
}

function isEventInsideBounds(event: GeoEvent, bounds: GeoFlatViewBounds | null): boolean {
	if (!bounds) return true;
	return (event.coordinates ?? []).some(
		(point) =>
			point.lat >= bounds.south &&
			point.lat <= bounds.north &&
			point.lng >= bounds.west &&
			point.lng <= bounds.east,
	);
}

function formatEventWindow(event: GeoEvent): string {
	const timestamp = event.validFrom ?? event.createdAt;
	if (!timestamp) return "time unknown";
	const parsed = new Date(timestamp);
	return Number.isNaN(parsed.getTime())
		? timestamp
		: parsed.toISOString().slice(0, 16).replace("T", " ");
}

function formatBucketLabel(timestampMs: number): string {
	return new Date(timestampMs).toISOString().slice(11, 16);
}

function buildActiveFlatFilterChips(state: GeoFlatViewState): string[] {
	const { filterSnapshot } = state;
	const chips = [
		filterSnapshot.eventsSource !== "local" ? `source:${filterSnapshot.eventsSource}` : null,
		filterSnapshot.activeRegionId ? `region:${filterSnapshot.activeRegionId}` : null,
		filterSnapshot.searchQuery.trim() ? `query:${filterSnapshot.searchQuery.trim()}` : null,
		filterSnapshot.minSeverityFilter > 1 ? `severity>=${filterSnapshot.minSeverityFilter}` : null,
		filterSnapshot.acledCountryFilter.trim()
			? `country:${filterSnapshot.acledCountryFilter.trim()}`
			: null,
		filterSnapshot.acledRegionFilter.trim()
			? `acled-region:${filterSnapshot.acledRegionFilter.trim()}`
			: null,
		filterSnapshot.acledEventTypeFilter.trim()
			? `event-type:${filterSnapshot.acledEventTypeFilter.trim()}`
			: null,
		filterSnapshot.acledSubEventTypeFilter.trim()
			? `subtype:${filterSnapshot.acledSubEventTypeFilter.trim()}`
			: null,
		filterSnapshot.acledFromFilter.trim() ? `from:${filterSnapshot.acledFromFilter.trim()}` : null,
		filterSnapshot.acledToFilter.trim() ? `to:${filterSnapshot.acledToFilter.trim()}` : null,
	];

	return chips.filter((value): value is string => Boolean(value));
}

function buildDefaultFlatLayerOptionIds(
	layerFamilies: GeoFlatViewState["layerFamilies"],
): GeoFlatLayerOptionId[] {
	return getGeoMapFlatLayerOptionsForFamilies(layerFamilies).map((option) => option.id);
}

export function FlatViewScaffold({
	state,
	events,
	showFiltersToolbar,
	showBodyLayerLegend,
	showTimelinePanel,
	selectedEventId,
	onSelectEvent,
	onBackToGlobe,
}: FlatViewScaffoldProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFlatLayerOptionIds, setActiveFlatLayerOptionIds] = useState<GeoFlatLayerOptionId[]>(
		() => buildDefaultFlatLayerOptionIds(state.layerFamilies),
	);
	const activeFilterChips = useMemo(() => buildActiveFlatFilterChips(state), [state]);
	const flatLayerOptions = useMemo(
		() => getGeoMapFlatLayerOptionsForFamilies(state.layerFamilies),
		[state.layerFamilies],
	);
	const flatLayerOptionGroups = useMemo(
		() =>
			state.layerFamilies.map((family) => ({
				family,
				familyLabel: getGeoMapLayerFamilyDefinition(family).label,
				options: getGeoMapFlatLayerOptionsByFamily(family),
			})),
		[state.layerFamilies],
	);
	const relationLayerPolicy = useMemo(() => getGeoFlatRelationLayerPolicy(), []);
	const activeFlatLayerOptionIdSet = useMemo(
		() => new Set(activeFlatLayerOptionIds),
		[activeFlatLayerOptionIds],
	);

	useEffect(() => {
		const nextDefaultIds = buildDefaultFlatLayerOptionIds(state.layerFamilies);
		setActiveFlatLayerOptionIds((current) => {
			const currentSet = new Set(current);
			const nextIds = nextDefaultIds.filter((optionId) => currentSet.has(optionId));
			return nextIds.length > 0 ? nextIds : nextDefaultIds;
		});
	}, [state.layerFamilies]);

	function toggleFlatLayerOption(optionId: GeoFlatLayerOptionId, family: GeoMapLayerFamily) {
		const familyOptionIds = getGeoMapFlatLayerOptionsByFamily(family).map((option) => option.id);
		setActiveFlatLayerOptionIds((current) => {
			const next = current.includes(optionId)
				? current.filter((id) => id !== optionId)
				: [...current, optionId];
			const hasFamilyOption = next.some((id) => familyOptionIds.includes(id));
			return hasFamilyOption ? next : current;
		});
	}

	const boundedEvents = useMemo(
		() => events.filter((event) => isEventInsideBounds(event, state.bounds)),
		[events, state.bounds],
	);
	const filteredEvents = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		const next = query
			? boundedEvents.filter((event) => {
					const haystack = [
						event.title,
						event.summary,
						event.category,
						event.subcategory,
						event.symbol,
						...event.regionIds,
						...event.countryCodes,
					]
						.filter(Boolean)
						.join(" ")
						.toLowerCase();
					return haystack.includes(query);
				})
			: boundedEvents;
		return [...next].sort((left, right) => Number(right.severity) - Number(left.severity));
	}, [boundedEvents, searchQuery]);
	const selectedEvent = useMemo(
		() =>
			filteredEvents.find((event) => event.id === selectedEventId) ??
			boundedEvents.find((event) => event.id === selectedEventId) ??
			null,
		[boundedEvents, filteredEvents, selectedEventId],
	);
	const selectedEventDetail = useMemo(
		() => (selectedEvent ? buildGeoEventSelectionDetail(selectedEvent) : null),
		[selectedEvent],
	);
	const rendererContract = useMemo(
		() =>
			buildGeoFlatViewRendererContract({
				state,
				events: filteredEvents,
				selectedEventId,
				activeLayerOptionIds: activeFlatLayerOptionIds,
				overlayChrome: {
					showFilters: showFiltersToolbar,
					showLegend: showBodyLayerLegend,
					showTimeline: showTimelinePanel,
				},
			}),
		[
			filteredEvents,
			activeFlatLayerOptionIds,
			selectedEventId,
			showBodyLayerLegend,
			showFiltersToolbar,
			showTimelinePanel,
			state,
		],
	);
	const activeBuckets = useMemo(
		() => rendererContract.timelineModel.buckets.filter((bucket) => bucket.count > 0),
		[rendererContract.timelineModel.buckets],
	);
	const selectedConflictBucket = useMemo(() => {
		const selectedIndex = rendererContract.timelineModel.selectedBucketIndex;
		if (selectedIndex === null || selectedIndex < 0) return null;
		return rendererContract.timelineModel.buckets[selectedIndex] ?? null;
	}, [rendererContract.timelineModel.buckets, rendererContract.timelineModel.selectedBucketIndex]);
	const selectedConflictDetails = useMemo(() => {
		if (!selectedEventId) return [];
		const eventId = selectedEventId;
		const details = [
			...(activeFlatLayerOptionIdSet.has("strikes")
				? rendererContract.conflictLayers.strikes
						.filter((item) => item.eventId === eventId)
						.map((item) => buildGeoConflictStrikeSelectionDetail(item))
				: []),
			...(activeFlatLayerOptionIdSet.has("targets")
				? rendererContract.conflictLayers.targets
						.filter((item) => item.eventId === eventId)
						.map((item) => buildGeoConflictTargetSelectionDetail(item))
				: []),
			...(activeFlatLayerOptionIdSet.has("assets")
				? rendererContract.conflictLayers.assets
						.filter((item) => item.eventId === eventId)
						.map((item) => buildGeoConflictAssetSelectionDetail(item))
				: []),
			...(activeFlatLayerOptionIdSet.has("zones")
				? rendererContract.conflictLayers.zones.features
						.filter((item) => item.properties.eventId === eventId)
						.map((item) => buildGeoConflictZoneSelectionDetail(item))
				: []),
			...(activeFlatLayerOptionIdSet.has("heat")
				? rendererContract.conflictLayers.heat
						.filter((item) => item.eventIds.includes(eventId))
						.map((item) => buildGeoConflictHeatSelectionDetail(item))
				: []),
		];
		return details;
	}, [activeFlatLayerOptionIdSet, rendererContract.conflictLayers, selectedEventId]);

	return (
		<div className="flex h-full w-full flex-col rounded-xl border border-border/70 bg-card/70 p-4 backdrop-blur">
			<div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
				<div>
					<h2 className="text-sm font-semibold">Flat / Regional Analyst View</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Operational handoff workspace for regional focus, search, selection and event triage.
					</p>
				</div>
				<Button type="button" size="sm" variant="outline" onClick={onBackToGlobe}>
					Back to Globe
				</Button>
			</div>

			<div className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.95fr)]">
				<section className="flex min-h-[20rem] flex-col rounded-lg border border-border/70 bg-background/70">
					<div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
						<div>
							<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Flat Viewport
							</div>
							<p className="mt-1 text-[11px] text-muted-foreground">
								{filteredEvents.length} visible events in current handoff window
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{state.layerFamilies.map((family) => (
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

				<section className="grid min-h-0 gap-4 lg:grid-rows-[auto_auto_minmax(0,1fr)]">
					<div className="rounded-lg border border-border/70 bg-background/70 p-4">
						<div className="flex items-start justify-between gap-3">
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
							<div className="min-w-[11rem] rounded-md border border-border/60 bg-card/70 p-3 text-sm">
								<div>view: {formatRange(state.temporal.viewRangeMs)}</div>
								<div>filter: {formatRange(state.temporal.filterRangeMs)}</div>
								<div>selected time: {state.temporal.selectedTimeMs ?? "none"}</div>
							</div>
						</div>
						<div className="mt-3 grid gap-3 md:grid-cols-2">
							<div className="rounded-md border border-border/60 bg-card/70 p-3 text-sm">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Bounds
								</div>
								<div className="mt-2 space-y-1">
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
							<div className="rounded-md border border-border/60 bg-card/70 p-3 text-sm">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Basemap Policy
								</div>
								<div className="mt-2 space-y-1">
									<div>richness: {state.basemapPolicy.richness}</div>
									<div>min features: {state.basemapPolicy.minimumFeatures.join(", ")}</div>
									<div>optional: {state.basemapPolicy.optionalFeatures.join(", ") || "none"}</div>
								</div>
							</div>
						</div>
						<div className="mt-3 grid gap-3 md:grid-cols-2">
							<div className="rounded-md border border-border/60 bg-card/70 p-3 text-sm">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Handoff Context
								</div>
								<div className="mt-2 space-y-1">
									<div>reason: {state.reason}</div>
									<div>focus kind: {state.focus?.kind ?? "none"}</div>
									<div>focus id: {state.focus?.id ?? "none"}</div>
								</div>
							</div>
							<div className="rounded-md border border-border/60 bg-card/70 p-3 text-sm">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Active Handoff Filters
								</div>
								<div className="mt-2 flex flex-wrap gap-2">
									{activeFilterChips.length > 0 ? (
										activeFilterChips.map((chip) => (
											<span
												key={chip}
												className="rounded border border-border/70 bg-background/80 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground"
											>
												{chip}
											</span>
										))
									) : (
										<span className="text-xs text-muted-foreground">No inherited filters</span>
									)}
								</div>
							</div>
						</div>
						<div className="mt-3 rounded-md border border-border/60 bg-card/70 p-3 text-sm">
							<div className="flex items-center justify-between gap-3">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Flat Layer Chrome
								</div>
								<div className="text-[11px] text-muted-foreground">
									{activeFlatLayerOptionIds.length}/{flatLayerOptions.length} options active
								</div>
							</div>
							<div className="mt-3 space-y-3">
								{flatLayerOptionGroups.map((group) => (
									<div key={group.family} className="space-y-2">
										<div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
											{group.familyLabel}
										</div>
										<div className="flex flex-wrap gap-2">
											{group.options.map((option) => {
												const isActive = activeFlatLayerOptionIdSet.has(option.id);
												return (
													<Button
														key={option.id}
														type="button"
														size="sm"
														variant={isActive ? "secondary" : "outline"}
														className="h-7 gap-1 px-2 text-[10px] uppercase tracking-wide"
														onClick={() => toggleFlatLayerOption(option.id, group.family)}
													>
														<span>{option.label}</span>
														<span className="text-[9px] text-muted-foreground/80">
															{option.sourceRefs[0]}
														</span>
													</Button>
												);
											})}
										</div>
									</div>
								))}
							</div>
							<div className="mt-3 grid gap-2 md:grid-cols-2">
								{rendererContract.flatLayerMatrix
									.filter((entry) => entry.family !== "conflict")
									.map((entry) => (
										<div
											key={entry.optionId}
											className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]"
										>
											<div className="font-medium">{entry.label}</div>
											<div className="mt-1 text-muted-foreground">
												{entry.placementMode} • {entry.visibilityMode} • {entry.selectionMode}
											</div>
										</div>
									))}
							</div>
							<div className="mt-3 rounded border border-border/60 bg-background/70 p-3">
								<div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
									Relation Layer Decisions
								</div>
								<div className="mt-2 space-y-2">
									{relationLayerPolicy.map((entry) => (
										<div
											key={entry.optionId}
											className="rounded border border-border/60 bg-card/70 px-2 py-2 text-[11px]"
										>
											<div className="font-medium">
												{entry.optionId} · {entry.status}
											</div>
											<div className="mt-1 text-muted-foreground">{entry.rationale}</div>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="mt-3 rounded-md border border-border/60 bg-card/70 p-3 text-sm">
							<div className="flex items-center justify-between gap-3">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Conflict Timeline Snapshot
								</div>
								<div className="text-[11px] text-muted-foreground">
									{activeBuckets.length} active buckets
								</div>
							</div>
							<div className="mt-2 grid gap-2 md:grid-cols-3">
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									conflict layer:{" "}
									{rendererContract.timelineModel.conflictLayerActive ? "active" : "hidden"}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									bucket size:{" "}
									{rendererContract.timelineModel.bucketSizeMs
										? `${Math.round(rendererContract.timelineModel.bucketSizeMs / 3_600_000)}h`
										: "n/a"}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									selected bucket:{" "}
									{rendererContract.timelineModel.selectedBucketIndex !== null &&
									rendererContract.timelineModel.selectedBucketIndex >= 0
										? rendererContract.timelineModel.selectedBucketIndex + 1
										: "none"}
								</div>
							</div>
							<div className="mt-3 flex flex-wrap gap-2">
								{activeBuckets.length > 0 ? (
									activeBuckets.slice(0, 8).map((bucket) => (
										<div
											key={`${bucket.startMs}-${bucket.endMs}`}
											className={`rounded border px-2 py-1 text-[10px] uppercase tracking-wide ${
												bucket.containsSelectedTime
													? "border-status-warning bg-status-warning/10 text-foreground"
													: bucket.inFilterRange
														? "border-status-info bg-status-info/10 text-foreground"
														: "border-border/70 bg-background/80 text-muted-foreground"
											}`}
										>
											{formatBucketLabel(bucket.startMs)} · {bucket.count} · S{bucket.maxSeverity}
										</div>
									))
								) : (
									<span className="text-xs text-muted-foreground">
										No conflict buckets in the current flat-view window.
									</span>
								)}
							</div>
						</div>
						<div className="mt-3 rounded-md border border-border/60 bg-card/70 p-3 text-sm">
							<div className="flex items-center justify-between gap-3">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Conflict Layer Payload
								</div>
								<div className="text-[11px] text-muted-foreground">non-live contract preview</div>
							</div>
							<div className="mt-2 grid gap-2 md:grid-cols-5">
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									strikes:{" "}
									{activeFlatLayerOptionIdSet.has("strikes")
										? rendererContract.conflictLayers.strikes.length
										: 0}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									targets:{" "}
									{activeFlatLayerOptionIdSet.has("targets")
										? rendererContract.conflictLayers.targets.length
										: 0}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									assets:{" "}
									{activeFlatLayerOptionIdSet.has("assets")
										? rendererContract.conflictLayers.assets.length
										: 0}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									zones:{" "}
									{activeFlatLayerOptionIdSet.has("zones")
										? rendererContract.conflictLayers.zones.features.length
										: 0}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									heat cells:{" "}
									{activeFlatLayerOptionIdSet.has("heat")
										? rendererContract.conflictLayers.heat.length
										: 0}
								</div>
							</div>
						</div>
						{selectedConflictBucket ? (
							<div className="mt-3 grid gap-2 md:grid-cols-4">
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									selected strikes:{" "}
									{activeFlatLayerOptionIdSet.has("strikes")
										? selectedConflictBucket.strikeCount
										: 0}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									selected targets:{" "}
									{activeFlatLayerOptionIdSet.has("targets")
										? selectedConflictBucket.targetCount
										: 0}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									selected assets:{" "}
									{activeFlatLayerOptionIdSet.has("assets") ? selectedConflictBucket.assetCount : 0}
								</div>
								<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
									selected heat:{" "}
									{activeFlatLayerOptionIdSet.has("heat")
										? selectedConflictBucket.heatIntensity
										: 0}
								</div>
							</div>
						) : null}
					</div>

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
										onClick={() => setSearchQuery("")}
									>
										Clear Search
									</Button>
								) : null}
								<div className="text-[11px] text-muted-foreground">
									{filteredEvents.length} items
								</div>
							</div>
						</div>
						<Input
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search visible events, regions, symbols"
							className="mt-3"
							aria-label="Search visible flat view events"
						/>
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
											return (
												<button
													key={event.id}
													type="button"
													onClick={() => onSelectEvent(event.id)}
													className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
														isSelected
															? "border-status-warning bg-status-warning/10"
															: "border-border/70 bg-card/70 hover:bg-accent/60"
													}`}
												>
													<div className="flex items-start justify-between gap-3">
														<div>
															<p className="text-sm font-medium">{detail.title}</p>
															<p className="mt-1 text-[11px] text-muted-foreground">
																{[detail.subtitle, ...detail.primaryMeta]
																	.filter(Boolean)
																	.join(" • ")}
															</p>
														</div>
														<span className="rounded border border-border/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
															S{event.severity}
														</span>
													</div>
													<p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">
														{detail.summary ?? "No summary available."}
													</p>
													<p className="mt-2 text-[10px] text-muted-foreground/80">
														{formatEventWindow(event)}
													</p>
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
				</section>
			</div>
		</div>
	);
}
