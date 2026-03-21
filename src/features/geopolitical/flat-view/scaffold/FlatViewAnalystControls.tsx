import { Button } from "@/components/ui/button";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view/flat-view-state";
import {
	formatBucketLabel,
	formatRange,
} from "@/features/geopolitical/flat-view/scaffold/flat-view-scaffold-utils";
import type {
	FlatViewLayerOptionGroup,
	FlatViewLayerOptionIdSet,
	FlatViewRelationLayerPolicyEntry,
	FlatViewRendererContract,
} from "@/features/geopolitical/flat-view/scaffold/types";
import type { GeoFlatLayerOptionId } from "@/features/geopolitical/layer-taxonomy";

interface FlatViewAnalystControlsProps {
	state: GeoFlatViewState;
	activeFilterChips: string[];
	activeFlatLayerOptionIds: GeoFlatLayerOptionId[];
	activeFlatLayerOptionIdSet: FlatViewLayerOptionIdSet;
	flatLayerOptionsCount: number;
	flatLayerOptionGroups: FlatViewLayerOptionGroup[];
	relationLayerPolicy: FlatViewRelationLayerPolicyEntry[];
	rendererContract: FlatViewRendererContract;
	activeBuckets: FlatViewRendererContract["timelineModel"]["buckets"];
	selectedConflictBucket: FlatViewRendererContract["timelineModel"]["buckets"][number] | null;
	onToggleFlatLayerOption: (
		optionId: GeoFlatLayerOptionId,
		family: FlatViewLayerOptionGroup["family"],
	) => void;
}

export function FlatViewAnalystControls({
	state,
	activeFilterChips,
	activeFlatLayerOptionIds,
	activeFlatLayerOptionIdSet,
	flatLayerOptionsCount,
	flatLayerOptionGroups,
	relationLayerPolicy,
	rendererContract,
	activeBuckets,
	selectedConflictBucket,
	onToggleFlatLayerOption,
}: FlatViewAnalystControlsProps) {
	return (
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
						{activeFlatLayerOptionIds.length}/{flatLayerOptionsCount} options active
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
											onClick={() => onToggleFlatLayerOption(option.id, group.family)}
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
						{activeFlatLayerOptionIdSet.has("strikes") ? selectedConflictBucket.strikeCount : 0}
					</div>
					<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
						selected targets:{" "}
						{activeFlatLayerOptionIdSet.has("targets") ? selectedConflictBucket.targetCount : 0}
					</div>
					<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
						selected assets:{" "}
						{activeFlatLayerOptionIdSet.has("assets") ? selectedConflictBucket.assetCount : 0}
					</div>
					<div className="rounded border border-border/60 bg-background/70 px-2 py-2 text-[11px]">
						selected heat:{" "}
						{activeFlatLayerOptionIdSet.has("heat") ? selectedConflictBucket.heatIntensity : 0}
					</div>
				</div>
			) : null}
		</div>
	);
}
