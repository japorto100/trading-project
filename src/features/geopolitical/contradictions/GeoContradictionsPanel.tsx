"use client";

import { GeoContradictionCard } from "@/features/geopolitical/contradictions/GeoContradictionCard";
import { useGeoContradictionsPanel } from "@/features/geopolitical/contradictions/useGeoContradictionsPanel";

export function GeoContradictionsPanel() {
	const {
		items,
		loading,
		actionBusyId,
		stateFilter,
		expandedId,
		drafts,
		error,
		setStateFilter,
		refreshContradictions,
		toggleDetails,
		setContradictionState,
		updateDraft,
		saveResolutionDetails,
		clearResolutionDetails,
		addEvidence,
		removeEvidence,
	} = useGeoContradictionsPanel();

	const controlsDisabled = loading || actionBusyId !== null;

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<div className="flex items-center justify-between gap-2">
				<div>
					<h2 className="text-sm font-semibold">Contradictions</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Cross-source conflicts ({items.length})
					</p>
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/50"
						onClick={() => void refreshContradictions()}
						disabled={controlsDisabled}
					>
						{loading ? "Loading..." : "Refresh"}
					</button>
				</div>
			</div>
			<div className="mt-2 flex flex-wrap gap-1">
				{(
					[
						["open", "Open"],
						["resolved", "Resolved"],
						["all", "All"],
					] as const
				).map(([value, label]) => (
					<button
						key={value}
						type="button"
						className={`rounded border px-2 py-1 text-[11px] ${
							stateFilter === value
								? "border-primary bg-primary/10 text-primary"
								: "border-border hover:bg-muted/50"
						}`}
						onClick={() => setStateFilter(value)}
						disabled={controlsDisabled}
					>
						{label}
					</button>
				))}
			</div>
			{error ? (
				<div className="mt-2 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400">
					{error}
				</div>
			) : null}
			<div className="mt-2 space-y-2">
				{items.length === 0 && !loading ? (
					<div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
						No contradictions for this filter.
					</div>
				) : (
					items
						.slice(0, 8)
						.map((item) => (
							<GeoContradictionCard
								key={item.id}
								item={item}
								isExpanded={expandedId === item.id}
								isBusy={actionBusyId === item.id}
								draft={drafts[item.id]}
								onToggleDetails={toggleDetails}
								onSetContradictionState={setContradictionState}
								onUpdateDraft={updateDraft}
								onSaveResolutionDetails={saveResolutionDetails}
								onClearResolutionDetails={clearResolutionDetails}
								onAddEvidence={addEvidence}
								onRemoveEvidence={removeEvidence}
								disabled={controlsDisabled}
							/>
						))
				)}
			</div>
		</section>
	);
}
