import { ChevronDown, ChevronUp, Clock, Volume2 } from "lucide-react";
import type { HoveredPrice, TradingChartCandle } from "@/components/trading-chart/types";
import { formatPrice, formatVolume } from "@/components/trading-chart/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TradingChartHeaderProps {
	hoveredPrice: HoveredPrice | null;
	lastCandle: TradingChartCandle | undefined;
	isPositive: boolean;
	priceChangePercent: string;
}

export function TradingChartHeader({
	hoveredPrice,
	lastCandle,
	isPositive,
	priceChangePercent,
}: TradingChartHeaderProps) {
	return (
		<div className="p-3 border-b border-border bg-card/30">
			<div className="flex items-center gap-4 flex-wrap">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-xl font-bold">
							{hoveredPrice ? formatPrice(hoveredPrice.close) : formatPrice(lastCandle?.close || 0)}
						</span>
						<Badge
							className={
								isPositive ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
							}
						>
							{isPositive ? (
								<ChevronUp className="h-3 w-3 mr-1" />
							) : (
								<ChevronDown className="h-3 w-3 mr-1" />
							)}
							{isPositive ? "+" : ""}
							{priceChangePercent}%
						</Badge>
					</div>
				</div>

				<div className="flex items-center gap-3 text-xs">
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">O</span>
						<span className="font-mono">
							{formatPrice(hoveredPrice?.open || lastCandle?.open || 0)}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">H</span>
						<span className="font-mono text-emerald-500">
							{formatPrice(hoveredPrice?.high || lastCandle?.high || 0)}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">L</span>
						<span className="font-mono text-red-500">
							{formatPrice(hoveredPrice?.low || lastCandle?.low || 0)}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">C</span>
						<span className="font-mono">
							{formatPrice(hoveredPrice?.close || lastCandle?.close || 0)}
						</span>
					</div>
					<Separator orientation="vertical" className="h-4" />
					<div className="flex items-center gap-1">
						<Volume2 className="h-3 w-3 text-muted-foreground" />
						<span className="font-mono">
							{formatVolume(hoveredPrice?.volume || lastCandle?.volume || 0)}
						</span>
					</div>
					{hoveredPrice && (
						<>
							<Separator orientation="vertical" className="h-4" />
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3 text-muted-foreground" />
								<span className="font-mono text-muted-foreground">{hoveredPrice.time}</span>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
