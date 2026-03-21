import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MarkerListPanel } from "@/features/geopolitical/markers/MarkerListPanel";
import {
	DEFAULT_GEO_MARKER_LIST_FILTER_STATE,
	filterGeoMarkerEvents,
	GEO_MARKER_SEVERITY_VALUES,
	GEO_MARKER_STATUS_VALUES,
} from "@/features/geopolitical/markers/marker-list-filter";
import type { GeoEvent, GeoEventStatus, GeoSeverity } from "@/lib/geopolitical/types";

interface MarkerListModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	events: GeoEvent[];
	selectedEventId: string | null;
	onSelectEvent: (eventId: string) => void;
}

export function MarkerListModal({
	open,
	onOpenChange,
	events,
	selectedEventId,
	onSelectEvent,
}: MarkerListModalProps) {
	const [searchValue, setSearchValue] = useState(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.searchValue);
	const [countryValue, setCountryValue] = useState(
		DEFAULT_GEO_MARKER_LIST_FILTER_STATE.countryValue,
	);
	const [regionValue, setRegionValue] = useState(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.regionValue);
	const [symbolValue, setSymbolValue] = useState(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.symbolValue);
	const [minSeverityValue, setMinSeverityValue] = useState<GeoSeverity | 0>(
		DEFAULT_GEO_MARKER_LIST_FILTER_STATE.minSeverityValue,
	);
	const [statusValue, setStatusValue] = useState<GeoEventStatus | "all">(
		DEFAULT_GEO_MARKER_LIST_FILTER_STATE.statusValue,
	);

	const filteredEvents = useMemo(() => {
		return filterGeoMarkerEvents(events, {
			searchValue,
			countryValue,
			regionValue,
			symbolValue,
			minSeverityValue,
			statusValue,
		});
	}, [countryValue, events, minSeverityValue, regionValue, searchValue, statusValue, symbolValue]);

	const clearFilters = () => {
		setSearchValue(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.searchValue);
		setCountryValue(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.countryValue);
		setRegionValue(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.regionValue);
		setSymbolValue(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.symbolValue);
		setMinSeverityValue(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.minSeverityValue);
		setStatusValue(DEFAULT_GEO_MARKER_LIST_FILTER_STATE.statusValue);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-[72rem] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Marker List</DialogTitle>
					<DialogDescription>
						Filter and inspect all markers by severity, status, symbol and geography.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
					<label className="sr-only" htmlFor="marker-list-search">
						Search markers
					</label>
					<Input
						id="marker-list-search"
						name="markerListSearch"
						value={searchValue}
						onChange={(event) => setSearchValue(event.target.value)}
						placeholder="Search title, summary, type"
						aria-label="Search markers"
					/>
					<label className="sr-only" htmlFor="marker-list-country">
						Filter markers by country
					</label>
					<Input
						id="marker-list-country"
						name="markerListCountry"
						value={countryValue}
						onChange={(event) => setCountryValue(event.target.value)}
						placeholder="Country code (e.g. DE, US)"
						aria-label="Filter markers by country"
					/>
					<label className="sr-only" htmlFor="marker-list-region">
						Filter markers by region
					</label>
					<Input
						id="marker-list-region"
						name="markerListRegion"
						value={regionValue}
						onChange={(event) => setRegionValue(event.target.value)}
						placeholder="Region id"
						aria-label="Filter markers by region"
					/>
					<label className="sr-only" htmlFor="marker-list-symbol">
						Filter markers by symbol
					</label>
					<Input
						id="marker-list-symbol"
						name="markerListSymbol"
						value={symbolValue}
						onChange={(event) => setSymbolValue(event.target.value)}
						placeholder="Symbol type"
						aria-label="Filter markers by symbol"
					/>
					<label className="sr-only" htmlFor="marker-list-min-severity">
						Minimum marker severity
					</label>
					<select
						id="marker-list-min-severity"
						name="markerListMinSeverity"
						className="h-9 rounded-md border border-input bg-background px-2 text-sm"
						value={String(minSeverityValue)}
						onChange={(event) => {
							const value = Number(event.target.value);
							setMinSeverityValue(value === 0 ? 0 : (value as GeoSeverity));
						}}
						aria-label="Minimum marker severity"
					>
						<option value="0">All Severities</option>
						{GEO_MARKER_SEVERITY_VALUES.map((value) => (
							<option key={value} value={value}>
								Min S{value}
							</option>
						))}
					</select>
					<label className="sr-only" htmlFor="marker-list-status">
						Marker status filter
					</label>
					<select
						id="marker-list-status"
						name="markerListStatus"
						className="h-9 rounded-md border border-input bg-background px-2 text-sm"
						value={statusValue}
						onChange={(event) => setStatusValue(event.target.value as GeoEventStatus | "all")}
						aria-label="Marker status filter"
					>
						<option value="all">All Statuses</option>
						{GEO_MARKER_STATUS_VALUES.map((value) => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</select>
				</div>

				<div className="flex items-center justify-between gap-2">
					<p className="text-xs text-muted-foreground">
						Showing {filteredEvents.length} of {events.length} markers
					</p>
					<Button type="button" size="sm" variant="outline" onClick={clearFilters}>
						Clear Filters
					</Button>
				</div>

				<MarkerListPanel
					events={filteredEvents}
					selectedEventId={selectedEventId}
					onSelectEvent={(eventId) => {
						onSelectEvent(eventId);
						onOpenChange(false);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
