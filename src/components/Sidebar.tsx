"use client";

import { Star, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatPrice, SYMBOLS, type SymbolInfo } from "@/lib/chartData";

interface WatchlistItem {
	symbol: SymbolInfo;
	price: number;
	change: number;
	changePercent: string;
}

interface SidebarProps {
	currentSymbol: SymbolInfo;
	onSymbolChange: (symbol: SymbolInfo) => void;
	watchlistData: Map<string, { price: number; change: number; changePercent: string }>;
}

export function Sidebar({ currentSymbol, onSymbolChange, watchlistData }: SidebarProps) {
	// Create watchlist items from symbols and price data
	const watchlist: WatchlistItem[] = SYMBOLS.map((symbol) => {
		const data = watchlistData.get(symbol.symbol);
		return {
			symbol,
			price: data?.price || symbol.basePrice,
			change: data?.change || 0,
			changePercent: data?.changePercent || "0.00",
		};
	});

	return (
		<aside className="w-64 border-r border-border bg-card/30 flex flex-col h-full">
			{/* Header */}
			<div className="p-3 flex items-center justify-between border-b border-border">
				<h2 className="font-semibold text-sm">Watchlist</h2>
				<Button variant="ghost" size="icon" className="h-7 w-7">
					<Star className="h-4 w-4" />
				</Button>
			</div>

			{/* Watchlist Items */}
			<ScrollArea className="flex-1">
				<div className="p-2">
					{/* Crypto Section */}
					<div className="mb-2">
						<span className="text-xs text-muted-foreground px-2 py-1 block">Cryptocurrencies</span>
						{watchlist
							.filter((item) => item.symbol.type === "crypto")
							.map((item) => (
								<WatchlistRow
									key={item.symbol.symbol}
									item={item}
									isActive={currentSymbol.symbol === item.symbol.symbol}
									onClick={() => onSymbolChange(item.symbol)}
								/>
							))}
					</div>

					<Separator className="my-2" />

					{/* Stocks Section */}
					<div>
						<span className="text-xs text-muted-foreground px-2 py-1 block">Stocks</span>
						{watchlist
							.filter((item) => item.symbol.type === "stock")
							.map((item) => (
								<WatchlistRow
									key={item.symbol.symbol}
									item={item}
									isActive={currentSymbol.symbol === item.symbol.symbol}
									onClick={() => onSymbolChange(item.symbol)}
								/>
							))}
					</div>
				</div>
			</ScrollArea>

			{/* Footer */}
			<div className="p-3 border-t border-border">
				<Button variant="outline" className="w-full text-sm" size="sm">
					<Star className="h-4 w-4 mr-2" />
					Add to Watchlist
				</Button>
			</div>
		</aside>
	);
}

interface WatchlistRowProps {
	item: WatchlistItem;
	isActive: boolean;
	onClick: () => void;
}

function WatchlistRow({ item, isActive, onClick }: WatchlistRowProps) {
	const isPositive = item.change >= 0;

	return (
		<button
			onClick={onClick}
			className={`w-full p-2 rounded-md flex items-center justify-between hover:bg-accent/50 transition-colors ${
				isActive ? "bg-accent/70" : ""
			}`}
		>
			<div className="flex items-center gap-2">
				<Star
					className={`h-3.5 w-3.5 ${
						isActive ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
					}`}
				/>
				<div className="text-left">
					<div className="font-medium text-sm">{item.symbol.symbol}</div>
					<div className="text-xs text-muted-foreground truncate max-w-[80px]">
						{item.symbol.name}
					</div>
				</div>
			</div>

			<div className="text-right">
				<div className="font-mono text-sm">{formatPrice(item.price)}</div>
				<div
					className={`flex items-center gap-0.5 justify-end text-xs ${
						isPositive ? "text-emerald-500" : "text-red-500"
					}`}
				>
					{isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
					<span>
						{isPositive ? "+" : ""}
						{item.changePercent}%
					</span>
				</div>
			</div>
		</button>
	);
}
