import { Activity, BarChart3, DollarSign, Star, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FusionSymbol } from "@/lib/fusion-symbols";
import type { QuoteData } from "@/lib/providers/types";

interface WatchlistRowProps {
	symbol: FusionSymbol;
	quote?: QuoteData;
	isSelected: boolean;
	isFavorite: boolean;
	onSelectSymbol: (symbol: FusionSymbol) => void;
	onToggleFavorite: (symbol: string) => void;
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

export function WatchlistRow({
	symbol,
	quote,
	isSelected,
	isFavorite,
	onSelectSymbol,
	onToggleFavorite,
}: WatchlistRowProps) {
	const price = quote?.price ?? symbol.basePrice;
	const changePercent = quote?.changePercent ?? 0;
	const isPositive = changePercent >= 0;

	return (
		<div
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
					<div className={`text-xs font-mono ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
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
					onClick={(event) => {
						event.stopPropagation();
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
}
