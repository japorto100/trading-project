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
		<aside
			data-testid="watchlist-sidebar"
			className="w-full border-r border-border bg-card/30 backdrop-blur-sm flex flex-col h-full overflow-hidden"
		>
			<div className="flex items-center justify-between gap-2 border-b border-border bg-accent/10 h-10 px-3">
				<div className="flex min-w-0 items-center gap-2">
					<List className="h-3.5 w-3.5 text-success" />
					<div className="min-w-0">
						<div className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
							Watchlist{" "}
							<span className="text-muted-foreground/50 font-normal">
								({watchlistSymbols.length})
							</span>
						</div>
					</div>
				</div>
				<span className="rounded-md border border-border bg-accent/40 px-1.5 py-0.5 text-[9px] uppercase font-bold text-muted-foreground">
					{activeTab}
				</span>
			</div>

			<div className="flex flex-col flex-1 min-h-0">
				<div className="relative border-b border-border">
					<Tabs
						value={activeTab}
						onValueChange={(value) => onSetActiveTab(value as WatchlistTab)}
						className="w-full"
					>
						<div className="relative w-full">
							<TabsList className="w-full h-auto justify-start overflow-x-auto whitespace-nowrap px-2 py-1 scrollbar-hide bg-transparent border-none gap-1">
								<TabsTrigger
									value="all"
									className="text-[10px] uppercase font-bold px-2.5 h-7 data-[state=active]:bg-accent/80 data-[state=active]:shadow-sm"
								>
									All
								</TabsTrigger>
								<TabsTrigger
									value="favorites"
									className="text-[10px] uppercase font-bold px-2.5 h-7 data-[state=active]:bg-accent/80 data-[state=active]:shadow-sm"
								>
									Favs
								</TabsTrigger>
								<TabsTrigger
									value="crypto"
									className="text-[10px] uppercase font-bold px-2.5 h-7 data-[state=active]:bg-accent/80 data-[state=active]:shadow-sm"
								>
									Crypto
								</TabsTrigger>
								<TabsTrigger
									value="stocks"
									className="text-[10px] uppercase font-bold px-2.5 h-7 data-[state=active]:bg-accent/80 data-[state=active]:shadow-sm"
								>
									Stocks
								</TabsTrigger>
								<TabsTrigger
									value="forex"
									className="text-[10px] uppercase font-bold px-2.5 h-7 data-[state=active]:bg-accent/80 data-[state=active]:shadow-sm"
								>
									FX
								</TabsTrigger>
								<TabsTrigger
									value="commodities"
									className="text-[10px] uppercase font-bold px-2.5 h-7 data-[state=active]:bg-accent/80 data-[state=active]:shadow-sm"
								>
									Cmdty
								</TabsTrigger>
								<TabsTrigger
									value="indices"
									className="text-[10px] uppercase font-bold px-2.5 h-7 data-[state=active]:bg-accent/80 data-[state=active]:shadow-sm"
								>
									Idx
								</TabsTrigger>
								<TabsTrigger
									value="macro"
									className="text-[10px] uppercase font-bold px-2.5 h-7 data-[state=active]:bg-accent/80 data-[state=active]:shadow-sm"
								>
									Macro
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
