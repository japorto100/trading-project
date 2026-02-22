"use client";

import { List } from "lucide-react";
import { WatchlistPanel } from "@/components/fusion/WatchlistPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WatchlistTab } from "@/features/trading/types";
import type { FusionSymbol } from "@/lib/fusion-symbols";

interface WatchlistSidebarProps {
	activeTab: WatchlistTab;
	watchlistSymbols: FusionSymbol[];
	currentSymbol: string;
	favorites: string[];
	onSetActiveTab: (tab: WatchlistTab) => void;
	onSelectSymbol: (symbol: FusionSymbol) => void;
	onToggleFavorite: (symbol: string) => void;
}

export function WatchlistSidebar({
	activeTab,
	watchlistSymbols,
	currentSymbol,
	favorites,
	onSetActiveTab,
	onSelectSymbol,
	onToggleFavorite,
}: WatchlistSidebarProps) {
	return (
		<aside className="w-full border-r border-border bg-card/30 flex flex-col h-full overflow-hidden">
			<div className="flex items-center h-10 px-3 border-b border-border bg-accent/20">
				<List className="h-4 w-4 mr-2 text-muted-foreground" />
				<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Watchlist</span>
			</div>

			<div className="flex flex-col flex-1 min-h-0">
				<div className="relative border-b border-border">
					<Tabs
						value={activeTab}
						onValueChange={(value) => onSetActiveTab(value as WatchlistTab)}
						className="w-full"
					>
						<div className="relative w-full">
							<TabsList className="w-full h-auto justify-start overflow-x-auto whitespace-nowrap px-2 py-1.5 scrollbar-hide bg-transparent border-none">
								<TabsTrigger value="all" className="text-xs px-2.5 shrink-0">
									All
								</TabsTrigger>
								<TabsTrigger value="favorites" className="text-xs px-2.5 shrink-0">
									Fav
								</TabsTrigger>
								<TabsTrigger value="crypto" className="text-xs px-2.5 shrink-0">
									Cry
								</TabsTrigger>
								<TabsTrigger value="stocks" className="text-xs px-2.5 shrink-0">
									Stk
								</TabsTrigger>
								<TabsTrigger value="forex" className="text-xs px-2.5 shrink-0">
									FX
								</TabsTrigger>
								<TabsTrigger value="commodities" className="text-xs px-2.5 shrink-0">
									Com
								</TabsTrigger>
								<TabsTrigger value="indices" className="text-xs px-2.5 shrink-0">
									Idx
								</TabsTrigger>
							</TabsList>
							<div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-card/30 to-transparent pointer-events-none" />
						</div>
					</Tabs>
				</div>
				<WatchlistPanel
					symbols={watchlistSymbols}
					currentSymbol={currentSymbol}
					favorites={favorites}
					onSelectSymbol={onSelectSymbol}
					onToggleFavorite={onToggleFavorite}
				/>
			</div>
		</aside>
	);
}

export default WatchlistSidebar;
