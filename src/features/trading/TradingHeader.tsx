"use client";

import {
	BarChart3,
	Camera,
	Fullscreen,
	Layout,
	Moon,
	RefreshCw,
	Star,
	StarOff,
	Sun,
} from "lucide-react";
import type { ChartType } from "@/chart/types";
import { AlertPanel } from "@/components/AlertPanel";
import { ChartTypeSelector } from "@/components/ChartTypeSelector";
import { CompareSymbol } from "@/components/CompareSymbol";
import { SymbolSearch } from "@/components/fusion/SymbolSearch";
import { IndicatorPanel, type IndicatorSettings } from "@/components/IndicatorPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TimeframeSelector } from "@/components/TimeframeSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { LayoutMode } from "@/features/trading/types";
import type { FusionSymbol } from "@/lib/fusion-symbols";
import { HISTORY_RANGE_OPTIONS, type HistoryRangePreset } from "@/lib/history-range";
import type { TimeframeValue } from "@/lib/providers/types";

interface TradingHeaderProps {
	currentSymbol: FusionSymbol;
	favorites: string[];
	searchQuery: string;
	showSearch: boolean;
	filteredSymbols: FusionSymbol[];
	popularSymbols: FusionSymbol[];
	currentTimeframe: TimeframeValue;
	historyRangePreset: HistoryRangePreset;
	customStartYear: number;
	minimumStartYear: number;
	effectiveStartYear: number;
	chartType: ChartType;
	compareSymbol: string | null;
	indicators: IndicatorSettings;
	loading: boolean;
	isDarkMode: boolean;
	onQueryChange: (query: string) => void;
	onOpenSearchChange: (open: boolean) => void;
	onSelectSymbol: (symbol: FusionSymbol) => void;
	onToggleFavorite: (symbol: string) => void;
	onTimeframeChange: (timeframe: TimeframeValue) => void;
	onHistoryRangeChange: (preset: HistoryRangePreset) => void;
	onCustomStartYearChange: (year: number) => void;
	onChartTypeChange: (chartType: ChartType) => void;
	onCompare: (symbol: string | null) => void;
	onLayoutChange: (layout: LayoutMode) => void;
	onIndicatorsChange: (indicators: IndicatorSettings) => void;
	onRefresh: () => void;
	onExport: () => void;
	onFullscreen: () => void;
	onThemeToggle: () => void;
}

export function TradingHeader({
	currentSymbol,
	favorites,
	searchQuery,
	showSearch,
	filteredSymbols,
	popularSymbols,
	currentTimeframe,
	historyRangePreset,
	customStartYear,
	minimumStartYear,
	effectiveStartYear,
	chartType,
	compareSymbol,
	indicators,
	loading,
	isDarkMode,
	onQueryChange,
	onOpenSearchChange,
	onSelectSymbol,
	onToggleFavorite,
	onTimeframeChange,
	onHistoryRangeChange,
	onCustomStartYearChange,
	onChartTypeChange,
	onCompare,
	onLayoutChange,
	onIndicatorsChange,
	onRefresh,
	onExport,
	onFullscreen,
	onThemeToggle,
}: TradingHeaderProps) {
	return (
		<div className="min-h-14 border-b border-border bg-card/50 backdrop-blur-sm px-3 py-2 overflow-x-auto">
			<div className="flex min-w-max items-center justify-between gap-4">
				<div className="flex min-w-max items-center gap-4">
					<div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg px-3 py-1.5">
						<BarChart3 className="h-5 w-5 text-white" />
						<span className="font-bold text-white text-lg">TradeView Pro</span>
					</div>
					<SymbolSearch
						query={searchQuery}
						open={showSearch}
						results={filteredSymbols}
						favorites={favorites}
						popularSymbols={popularSymbols}
						onQueryChange={onQueryChange}
						onOpenChange={onOpenSearchChange}
						onSelect={onSelectSymbol}
						onToggleFavorite={onToggleFavorite}
					/>

					<div className="flex items-center gap-2">
						<h2 className="text-lg font-bold">{currentSymbol.symbol}</h2>
						<Badge
							variant="outline"
							className={
								currentSymbol.type === "crypto"
									? "border-amber-500/50 text-amber-500"
									: currentSymbol.type === "stock"
										? "border-blue-500/50 text-blue-500"
										: "border-purple-500/50 text-purple-500"
							}
						>
							{currentSymbol.type.toUpperCase()}
						</Badge>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => onToggleFavorite(currentSymbol.symbol)}
						>
							{favorites.includes(currentSymbol.symbol) ? (
								<Star className="h-4 w-4 text-amber-500 fill-amber-500" />
							) : (
								<StarOff className="h-4 w-4 text-muted-foreground" />
							)}
						</Button>
					</div>

					<Separator orientation="vertical" className="h-6" />

					<TimeframeSelector
						currentTimeframe={currentTimeframe}
						onTimeframeChange={onTimeframeChange}
					/>

					<Select
						value={historyRangePreset}
						onValueChange={(value) => onHistoryRangeChange(value as HistoryRangePreset)}
					>
						<SelectTrigger className="h-9 w-[100px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{HISTORY_RANGE_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{historyRangePreset === "CUSTOM" && (
						<Input
							type="number"
							className="h-9 w-[95px]"
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

					<Badge variant="outline" className="h-7 px-2 text-[11px]">
						From {effectiveStartYear}
					</Badge>
				</div>

				<div className="flex min-w-max items-center gap-2">
					<ChartTypeSelector chartType={chartType} onChartTypeChange={onChartTypeChange} />

					<CompareSymbol onCompare={onCompare} currentCompare={compareSymbol} />

					<Separator orientation="vertical" className="h-6" />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Layout className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onClick={() => onLayoutChange("single")}>
								Single Chart
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onLayoutChange("2h")}>
								2 Charts (Horizontal)
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onLayoutChange("2v")}>
								2 Charts (Vertical)
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onLayoutChange("4")}>4 Charts</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<IndicatorPanel indicators={indicators} onIndicatorsChange={onIndicatorsChange} />

					<Separator orientation="vertical" className="h-6" />

					<Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
					</Button>

					<Button variant="outline" size="sm" onClick={onExport}>
						<Camera className="h-4 w-4" />
					</Button>

					<Button variant="outline" size="sm" onClick={onFullscreen}>
						<Fullscreen className="h-4 w-4" />
					</Button>

					<AlertPanel />

					<SettingsPanel />

					<Button variant="ghost" size="icon" onClick={onThemeToggle}>
						{isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default TradingHeader;
