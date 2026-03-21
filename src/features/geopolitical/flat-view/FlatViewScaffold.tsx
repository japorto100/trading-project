import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getGeoFlatRelationLayerPolicy } from "@/features/geopolitical/flat-view/flat-view-relation-layer-policy";
import { buildGeoFlatViewRendererContract } from "@/features/geopolitical/flat-view/flat-view-renderer-contract";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view/flat-view-state";
import { FlatViewAnalystControls } from "@/features/geopolitical/flat-view/scaffold/FlatViewAnalystControls";
import { FlatViewEventWorkspace } from "@/features/geopolitical/flat-view/scaffold/FlatViewEventWorkspace";
import { FlatViewViewportStage } from "@/features/geopolitical/flat-view/scaffold/FlatViewViewportStage";
import {
	buildActiveFlatFilterChips,
	buildDefaultFlatLayerOptionIds,
	isEventInsideBounds,
} from "@/features/geopolitical/flat-view/scaffold/flat-view-scaffold-utils";
import type { FlatViewLayerOptionGroup } from "@/features/geopolitical/flat-view/scaffold/types";
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
	const flatLayerOptionGroups = useMemo<FlatViewLayerOptionGroup[]>(
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
	const selectedBucketEventIds = useMemo(
		() => new Set(selectedConflictBucket?.eventIds ?? []),
		[selectedConflictBucket],
	);
	const selectedBucketLabel = selectedConflictBucket
		? `${new Date(selectedConflictBucket.startMs).toLocaleString()} -> ${new Date(selectedConflictBucket.endMs).toLocaleString()}`
		: null;
	const selectedConflictDetails = useMemo(() => {
		if (!selectedEventId) return [];
		const eventId = selectedEventId;
		return [
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
				<FlatViewViewportStage
					layerFamilies={state.layerFamilies}
					rendererContract={rendererContract}
					visibleEventCount={filteredEvents.length}
					selectedBucketLabel={selectedBucketLabel}
					onSelectEvent={onSelectEvent}
				/>

				<section className="grid min-h-0 gap-4 lg:grid-rows-[auto_auto_minmax(0,1fr)]">
					<FlatViewAnalystControls
						state={state}
						activeFilterChips={activeFilterChips}
						activeFlatLayerOptionIds={activeFlatLayerOptionIds}
						activeFlatLayerOptionIdSet={activeFlatLayerOptionIdSet}
						flatLayerOptionsCount={flatLayerOptions.length}
						flatLayerOptionGroups={flatLayerOptionGroups}
						relationLayerPolicy={relationLayerPolicy}
						rendererContract={rendererContract}
						activeBuckets={activeBuckets}
						selectedConflictBucket={selectedConflictBucket}
						onToggleFlatLayerOption={toggleFlatLayerOption}
					/>

					<FlatViewEventWorkspace
						searchQuery={searchQuery}
						filteredEvents={filteredEvents}
						selectedEventId={selectedEventId}
						selectedBucketEventIds={selectedBucketEventIds}
						selectedBucketLabel={selectedBucketLabel}
						selectedEventDetail={selectedEventDetail}
						selectedConflictDetails={selectedConflictDetails}
						onSearchQueryChange={setSearchQuery}
						onSelectEvent={onSelectEvent}
					/>
				</section>
			</div>
		</div>
	);
}
