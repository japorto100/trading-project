import { ArrowUpDown, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FusionSymbol } from "@/lib/fusion-symbols";
import type { WatchlistSortMode } from "./types";

interface WatchlistFilterBarProps {
	query: string;
	sortMode: WatchlistSortMode;
	visibleCount: number;
	favoriteCount: number;
	topMovers: FusionSymbol[];
	onQueryChange: (value: string) => void;
	onCycleSortMode: () => void;
}

export function WatchlistFilterBar({
	query,
	sortMode,
	visibleCount,
	favoriteCount,
	topMovers,
	onQueryChange,
	onCycleSortMode,
}: WatchlistFilterBarProps) {
	return (
		<div className="mb-2 space-y-2 px-1">
			<div className="grid grid-cols-[1fr_auto] gap-2">
				<Input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Filter watchlist..."
					className="h-8"
				/>
				<Button variant="outline" size="sm" className="h-8 px-2" onClick={onCycleSortMode}>
					<ArrowUpDown className="mr-1 h-3.5 w-3.5" />
					{sortMode === "default" ? "Default" : sortMode === "movers" ? "Movers" : "Fav First"}
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
				<Badge variant="outline" className="text-[10px]">
					{visibleCount} visible
				</Badge>
				<Badge variant="outline" className="text-[10px]">
					{favoriteCount} favorites
				</Badge>
				{topMovers.length > 0 ? (
					<span className="inline-flex items-center gap-1">
						<Flame className="h-3 w-3 text-amber-500" />
						{topMovers.map((item) => item.symbol).join(" • ")}
					</span>
				) : null}
			</div>
		</div>
	);
}
