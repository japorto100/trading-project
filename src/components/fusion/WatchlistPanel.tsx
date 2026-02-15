"use client";

import { Activity, BarChart3, DollarSign, Star, TrendingDown, TrendingUp } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FusionSymbol } from "@/lib/fusion-symbols";
import type { QuoteData } from "@/lib/providers/types";

interface WatchlistPanelProps {
	symbols: FusionSymbol[];
	currentSymbol: string;
	favorites: string[];
	onSelectSymbol: (symbol: FusionSymbol) => void;
	onToggleFavorite: (symbol: string) => void;
}

interface QuotesResponse {
	success: boolean;
	quotes: Record<string, QuoteData>;
}

function formatPrice(price: number): string {
	if (price < 0.01) return price.toFixed(6);
	if (price < 1) return price.toFixed(4);
	if (price < 100) return price.toFixed(2);
	return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChangePercent(value: number): string {
	const sign = value >= 0 ? "+" : "";
	return `${sign}${value.toFixed(2)}%`;
}

function iconForType(type: FusionSymbol["type"]) {
	switch (type) {
		case "crypto":
			return <Activity className="h-4 w-4 text-orange-400" />;
		case "fx":
			return <DollarSign className="h-4 w-4 text-green-400" />;
		case "index":
			return <BarChart3 className="h-4 w-4 text-violet-400" />;
		default:
			return <TrendingUp className="h-4 w-4 text-blue-400" />;
	}
}

export function WatchlistPanel({
	symbols,
	currentSymbol,
	favorites,
	onSelectSymbol,
	onToggleFavorite,
}: WatchlistPanelProps) {
	const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
	const [loadingQuotes, setLoadingQuotes] = useState(false);

	const _symbolsKey = useMemo(() => symbols.map((s) => s.symbol).join(","), [symbols]);

	useEffect(() => {
		if (!symbols.length) {
			setQuotes({});
			return;
		}

		let alive = true;

		const fetchQuotes = async () => {
			try {
				setLoadingQuotes(true);
				const list = symbols.map((s) => s.symbol).join(",");
				const response = await fetch(`/api/market/quote?symbols=${encodeURIComponent(list)}`);
				if (!response.ok) return;
				const data = (await response.json()) as QuotesResponse;
				if (alive && data.success && data.quotes) {
					setQuotes(data.quotes);
				}
			} catch {
				// keep UI usable with base prices when quote API fails
			} finally {
				if (alive) setLoadingQuotes(false);
			}
		};

		fetchQuotes();
		const timer = setInterval(fetchQuotes, 30000);

		return () => {
			alive = false;
			clearInterval(timer);
		};
	}, [symbols]);

	return (
		<ScrollArea className="flex-1 p-2">
			<div className="space-y-1">
				{symbols.length === 0 ? (
					<div className="px-2 py-6 text-sm text-muted-foreground">No symbols in this list.</div>
				) : (
					symbols.map((symbol) => {
						const quote = quotes[symbol.symbol];
						const price = quote?.price ?? symbol.basePrice;
						const changePercent = quote?.changePercent ?? 0;
						const isPositive = changePercent >= 0;
						const isSelected = currentSymbol === symbol.symbol;
						const isFavorite = favorites.includes(symbol.symbol);

						return (
							<div
								key={symbol.symbol}
								role="button"
								tabIndex={0}
								onClick={() => onSelectSymbol(symbol)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										onSelectSymbol(symbol);
									}
								}}
								className={`w-full rounded-md p-2.5 flex items-center justify-between transition-colors cursor-pointer ${
									isSelected ? "bg-accent/70" : "hover:bg-accent/50"
								}`}
							>
								<div className="flex items-center gap-2.5 text-left">
									<div className="h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center">
										{iconForType(symbol.type)}
									</div>
									<div>
										<div className="flex items-center gap-1.5">
											<span className="text-sm font-medium">{symbol.symbol}</span>
											<Badge variant="outline" className="text-[10px] px-1.5 py-0">
												{symbol.type.toUpperCase()}
											</Badge>
										</div>
										<div className="text-xs text-muted-foreground">{symbol.name}</div>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<div className="text-right">
										<div className="text-sm font-mono">{formatPrice(price)}</div>
										<div
											className={`text-xs font-mono ${isPositive ? "text-emerald-500" : "text-red-500"}`}
										>
											{isPositive ? (
												<TrendingUp className="inline h-3 w-3 mr-0.5" />
											) : (
												<TrendingDown className="inline h-3 w-3 mr-0.5" />
											)}
											{formatChangePercent(changePercent)}
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={(e) => {
											e.stopPropagation();
											onToggleFavorite(symbol.symbol);
										}}
									>
										<Star
											className={`h-4 w-4 ${isFavorite ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
										/>
									</Button>
								</div>
							</div>
						);
					})
				)}
			</div>
			{loadingQuotes ? (
				<div className="px-2 pt-2 text-[11px] text-muted-foreground">Refreshing quotes...</div>
			) : null}
		</ScrollArea>
	);
}

export const MemoizedWatchlistPanel = memo(WatchlistPanel);
