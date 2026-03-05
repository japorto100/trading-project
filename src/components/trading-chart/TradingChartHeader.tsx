import { Calendar, ChevronDown, ChevronUp, Clock, Volume2 } from "lucide-react";
import type { HoveredPrice, TradingChartCandle } from "@/components/trading-chart/types";
import { formatPrice, formatVolume } from "@/components/trading-chart/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { HISTORY_RANGE_OPTIONS, type HistoryRangePreset } from "@/lib/history-range";

interface TradingChartHeaderProps {
	hoveredPrice: HoveredPrice | null;
	lastCandle: TradingChartCandle | undefined;
	isPositive: boolean;
	priceChangePercent: string;
	historyRangePreset: HistoryRangePreset;
	customStartYear: number;
	minimumStartYear: number;
	effectiveStartYear: number;
	onHistoryRangeChange: (preset: HistoryRangePreset) => void;
	onCustomStartYearChange: (year: number) => void;
}

export function TradingChartHeader({
	hoveredPrice,
	lastCandle,
	isPositive,
	priceChangePercent,
	historyRangePreset,
	customStartYear,
	minimumStartYear,
	effectiveStartYear,
	onHistoryRangeChange,
	onCustomStartYearChange,
}: TradingChartHeaderProps) {
	return (
		<div className="p-3 border-b border-border/50 bg-background/50 backdrop-blur-sm flex items-center justify-between gap-4 flex-wrap shadow-sm">
			<div className="flex items-center gap-4 flex-wrap">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-xl font-bold font-mono tracking-tight">
							{hoveredPrice ? formatPrice(hoveredPrice.close) : formatPrice(lastCandle?.close || 0)}
						</span>
						<Badge
							className={
								isPositive
									? "bg-success/15 text-success border-success/30 shadow-[0_0_10px_oklch(0.696_0.17_162.48/0.2)]"
									: "bg-error/15 text-error border-error/30 shadow-[0_0_10px_oklch(0.627_0.258_29.23/0.2)]"
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
					<div className="flex items-center gap-1 group transition-all duration-300">
						<span className="text-muted-foreground/70 font-semibold group-hover:text-muted-foreground transition-colors">
							O
						</span>
						<span className="font-mono transition-all duration-200">
							{formatPrice(hoveredPrice?.open || lastCandle?.open || 0)}
						</span>
					</div>
					<div className="flex items-center gap-1 group transition-all duration-300">
						<span className="text-muted-foreground/70 font-semibold group-hover:text-success transition-colors">
							H
						</span>
						<span className="font-mono text-success transition-all duration-200">
							{formatPrice(hoveredPrice?.high || lastCandle?.high || 0)}
						</span>
					</div>
					<div className="flex items-center gap-1 group transition-all duration-300">
						<span className="text-muted-foreground/70 font-semibold group-hover:text-error transition-colors">
							L
						</span>
						<span className="font-mono text-error transition-all duration-200">
							{formatPrice(hoveredPrice?.low || lastCandle?.low || 0)}
						</span>
					</div>
					<div className="flex items-center gap-1 group transition-all duration-300">
						<span className="text-muted-foreground/70 font-semibold group-hover:text-foreground transition-colors">
							C
						</span>
						<span className="font-mono transition-all duration-200">
							{formatPrice(hoveredPrice?.close || lastCandle?.close || 0)}
						</span>
					</div>
					<Separator orientation="vertical" className="h-4 bg-border/50" />
					<div className="flex items-center gap-1">
						<Volume2 className="h-3 w-3 text-muted-foreground/50" />
						<span className="font-mono text-muted-foreground">
							{formatVolume(hoveredPrice?.volume || lastCandle?.volume || 0)}
						</span>
					</div>
					{hoveredPrice && (
						<>
							<Separator orientation="vertical" className="h-4 bg-border/50" />
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3 text-muted-foreground/50" />
								<span className="font-mono text-muted-foreground/80">{hoveredPrice.time}</span>
							</div>
						</>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2">
				<div className="flex items-center gap-1.5 bg-accent/20 rounded-md px-2 py-1 border border-border/50">
					<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
					<Select
						value={historyRangePreset}
						onValueChange={(value) => onHistoryRangeChange(value as HistoryRangePreset)}
					>
						<SelectTrigger className="h-7 w-[80px] bg-transparent border-none text-[11px] font-bold p-0 shadow-none focus:ring-0">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{HISTORY_RANGE_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value} className="text-xs">
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{historyRangePreset === "CUSTOM" && (
						<Input
							type="number"
							className="h-6 w-[60px] text-[11px] px-1 bg-background/50"
							min={minimumStartYear}
							max={new Date().getFullYear()}
							value={customStartYear}
							onChange={(event) => {
								const year = Number(event.target.value);
								if (Number.isFinite(year)) {
									onCustomStartYearChange(year);
								}
							}}
						/>
					)}

					<Separator orientation="vertical" className="h-4 mx-1" />

					<Badge variant="ghost" className="h-5 px-1 text-[10px] font-mono text-muted-foreground">
						From {effectiveStartYear}
					</Badge>
				</div>
			</div>
		</div>
	);
}
