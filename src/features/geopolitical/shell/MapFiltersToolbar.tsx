import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapBodyToggle } from "@/features/geopolitical/shell/MapBodyToggle";
import type { EventsSource, GeoMapBody } from "@/features/geopolitical/store";
import type { GeoRegion } from "@/lib/geopolitical/types";

type Updater<T> = T | ((previous: T) => T);

interface ActiveFilterChip {
	key: string;
	label: string;
	clear: () => void;
}

interface MapFiltersToolbarProps {
	eventsSource: EventsSource;
	setEventsSource: (next: EventsSource) => void;
	mapBody: GeoMapBody;
	setMapBody: (next: GeoMapBody) => void;
	activeRegionId: string;
	setActiveRegionId: (next: string) => void;
	regions: GeoRegion[];
	acledCountryFilter: string;
	setAcledCountryFilter: (next: string) => void;
	minSeverityFilter: number;
	setMinSeverityFilter: (next: number) => void;
	searchQuery: string;
	setSearchQuery: (next: string) => void;
	isExternalSource: boolean;
	externalSourceLabel: string;
	acledRegionFilter: string;
	setAcledRegionFilter: (next: string) => void;
	acledEventTypeFilter: string;
	setAcledEventTypeFilter: (next: string) => void;
	acledSubEventTypeFilter: string;
	setAcledSubEventTypeFilter: (next: string) => void;
	acledFromFilter: string;
	setAcledFromFilter: (next: string) => void;
	acledToFilter: string;
	setAcledToFilter: (next: string) => void;
	acledPage: number;
	setAcledPage: (next: Updater<number>) => void;
	acledTotal: number;
	acledHasMore: boolean;
	activeRegionLabel: string;
	activeFilterChips: ActiveFilterChip[];
	acledRegionSuggestions: string[];
	acledSubEventSuggestions: string[];
	onApply: () => void;
}

export function MapFiltersToolbar({
	eventsSource,
	setEventsSource,
	mapBody,
	setMapBody,
	activeRegionId,
	setActiveRegionId,
	regions,
	acledCountryFilter,
	setAcledCountryFilter,
	minSeverityFilter,
	setMinSeverityFilter,
	searchQuery,
	setSearchQuery,
	isExternalSource,
	externalSourceLabel,
	acledRegionFilter,
	setAcledRegionFilter,
	acledEventTypeFilter,
	setAcledEventTypeFilter,
	acledSubEventTypeFilter,
	setAcledSubEventTypeFilter,
	acledFromFilter,
	setAcledFromFilter,
	acledToFilter,
	setAcledToFilter,
	acledPage,
	setAcledPage,
	acledTotal,
	acledHasMore,
	activeRegionLabel,
	activeFilterChips,
	acledRegionSuggestions,
	acledSubEventSuggestions,
	onApply,
}: MapFiltersToolbarProps) {
	return (
		<>
			<div className="flex items-center gap-2 border-b border-border px-3 py-2">
				<select
					className="h-9 rounded-md border border-input bg-background px-2 text-sm"
					value={eventsSource}
					onChange={(event) => {
						setEventsSource(event.target.value as EventsSource);
						setAcledPage(1);
					}}
					aria-label="Event source mode"
				>
					<option value="local">Local</option>
					<option value="acled">ACLED (Go Gateway)</option>
					<option value="gdelt">GDELT (Go Gateway)</option>
				</select>
				<MapBodyToggle value={mapBody} onChange={setMapBody} />
				{eventsSource === "local" ? (
					<select
						className="h-9 rounded-md border border-input bg-background px-2 text-sm"
						value={activeRegionId}
						onChange={(event) => setActiveRegionId(event.target.value)}
						aria-label="Filter events by region"
					>
						<option value="">All regions</option>
						{regions.map((region) => (
							<option key={region.id} value={region.id}>
								{region.label}
							</option>
						))}
					</select>
				) : (
					<Input
						value={acledCountryFilter}
						onChange={(event) => {
							setAcledCountryFilter(event.target.value);
							setAcledPage(1);
						}}
						placeholder={`${externalSourceLabel} country`}
						aria-label={`${externalSourceLabel} country filter`}
					/>
				)}
				<select
					className="h-9 rounded-md border border-input bg-background px-2 text-sm"
					value={minSeverityFilter}
					onChange={(event) => setMinSeverityFilter(Number(event.target.value))}
					aria-label="Minimum severity filter"
				>
					<option value="1">All Severities</option>
					{[2, 3, 4, 5].map((value) => (
						<option key={value} value={value}>
							Min S{value}
						</option>
					))}
				</select>
				<Input
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
					placeholder="Search events"
					aria-label="Search geopolitical events"
				/>
				{isExternalSource && (
					<>
						<Input
							value={acledRegionFilter}
							onChange={(event) => {
								setAcledRegionFilter(event.target.value);
								setAcledPage(1);
							}}
							placeholder={`${externalSourceLabel} region`}
							aria-label={`${externalSourceLabel} region filter`}
						/>
						<Input
							value={acledEventTypeFilter}
							onChange={(event) => {
								setAcledEventTypeFilter(event.target.value);
								setAcledPage(1);
							}}
							placeholder="Event type"
							aria-label={`${externalSourceLabel} event type filter`}
						/>
						<Input
							value={acledSubEventTypeFilter}
							onChange={(event) => {
								setAcledSubEventTypeFilter(event.target.value);
								setAcledPage(1);
							}}
							placeholder="Sub-event type"
							aria-label={`${externalSourceLabel} sub-event type filter`}
						/>
						<Input
							value={acledFromFilter}
							onChange={(event) => {
								setAcledFromFilter(event.target.value);
								setAcledPage(1);
							}}
							placeholder="From YYYY-MM-DD"
							aria-label={`${externalSourceLabel} from date`}
						/>
						<Input
							value={acledToFilter}
							onChange={(event) => {
								setAcledToFilter(event.target.value);
								setAcledPage(1);
							}}
							placeholder="To YYYY-MM-DD"
							aria-label={`${externalSourceLabel} to date`}
						/>
					</>
				)}
				<Button
					size="sm"
					variant="outline"
					onClick={onApply}
					aria-label="Apply geopolitical filters"
				>
					<Crosshair className="mr-2 h-4 w-4" />
					Apply
				</Button>
				<span className="text-xs text-muted-foreground">region: {activeRegionLabel}</span>
			</div>
			<div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-3 py-2">
				{activeFilterChips.length === 0 ? (
					<span className="text-xs text-muted-foreground">No active filters.</span>
				) : (
					activeFilterChips.map((chip) => (
						<button
							type="button"
							key={chip.key}
							className="rounded border border-border px-2 py-0.5 text-[11px] hover:bg-muted"
							onClick={chip.clear}
							title="Click to clear filter"
						>
							{chip.label} ×
						</button>
					))
				)}
				{isExternalSource && (
					<>
						<span className="ml-2 text-xs text-muted-foreground">
							page {acledPage} | total {acledTotal}
						</span>
						<Button
							size="sm"
							variant="outline"
							disabled={acledPage <= 1}
							onClick={() => setAcledPage((previous) => Math.max(1, previous - 1))}
						>
							Prev
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={!acledHasMore}
							onClick={() => setAcledPage((previous) => previous + 1)}
						>
							Next
						</Button>
					</>
				)}
			</div>
			{isExternalSource && (
				<div className="flex flex-wrap gap-2 border-b border-border/60 px-3 py-2">
					{acledRegionSuggestions.slice(0, 8).map((region) => (
						<button
							key={`region-${region}`}
							type="button"
							className="rounded border border-border px-2 py-0.5 text-[11px] hover:bg-muted"
							onClick={() => {
								setAcledRegionFilter(region);
								setAcledPage(1);
							}}
						>
							region: {region}
						</button>
					))}
					{acledSubEventSuggestions.slice(0, 8).map((subEventType) => (
						<button
							key={`sub-${subEventType}`}
							type="button"
							className="rounded border border-border px-2 py-0.5 text-[11px] hover:bg-muted"
							onClick={() => {
								setAcledSubEventTypeFilter(subEventType);
								setAcledPage(1);
							}}
						>
							sub: {subEventType}
						</button>
					))}
				</div>
			)}
		</>
	);
}
