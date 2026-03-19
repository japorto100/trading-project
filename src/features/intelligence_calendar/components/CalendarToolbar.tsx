"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export interface CalendarFilters {
	query: string;
	impact: string;
	region: string;
}

export function CalendarToolbar({
	filters,
	regions,
	onQueryChange,
	onImpactChange,
	onRegionChange,
}: {
	filters: CalendarFilters;
	regions: string[];
	onQueryChange: (value: string) => void;
	onImpactChange: (value: string) => void;
	onRegionChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 lg:flex-row">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					className="pl-9"
					value={filters.query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Search events, regions, assets..."
				/>
			</div>
			<Select value={filters.impact} onValueChange={onImpactChange}>
				<SelectTrigger className="w-full lg:w-[160px]">
					<SelectValue placeholder="Impact" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All impact</SelectItem>
					<SelectItem value="critical">Critical</SelectItem>
					<SelectItem value="high">High</SelectItem>
					<SelectItem value="medium">Medium</SelectItem>
					<SelectItem value="low">Low</SelectItem>
				</SelectContent>
			</Select>
			<Select value={filters.region} onValueChange={onRegionChange}>
				<SelectTrigger className="w-full lg:w-[180px]">
					<SelectValue placeholder="Region" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All regions</SelectItem>
					{regions.map((region) => (
						<SelectItem key={region} value={region}>
							{region}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
