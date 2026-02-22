"use client";

import {
	BarChart3,
	Camera,
	Clock,
	Fullscreen,
	Globe,
	Layout,
	Moon,
	RefreshCw,
	Star,
	StarOff,
	Sun,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import type { LayoutMode } from "@/features/trading/types";
import type { FusionSymbol } from "@/lib/fusion-symbols";
import type { TimeframeValue } from "@/lib/providers/types";

interface TradingHeaderProps {
	currentSymbol: FusionSymbol;
	favorites: string[];
	searchQuery: string;
	searchPending: boolean;
	showSearch: boolean;
	filteredSymbols: FusionSymbol[];
	popularSymbols: FusionSymbol[];
	currentTimeframe: TimeframeValue;
	chartType: ChartType;
	compareSymbol: string | null;
	indicators: IndicatorSettings;
	loading: boolean;
	isDarkMode: boolean;
	dataMode?: "api" | "fallback";
	onQueryChange: (query: string) => void;
	onOpenSearchChange: (open: boolean) => void;
	onSelectSymbol: (symbol: FusionSymbol) => void;
	onToggleFavorite: (symbol: string) => void;
	onTimeframeChange: (timeframe: TimeframeValue) => void;
	onChartTypeChange: (chartType: ChartType) => void;
	onCompare: (symbol: string | null) => void;
	onLayoutChange: (layout: LayoutMode) => void;
	onIndicatorsChange: (indicators: IndicatorSettings) => void;
	onRefresh: () => void;
	onExport: () => void;
	onFullscreen: () => void;
	onThemeToggle: () => void;
	replayMode: boolean;
	replayPlaying: boolean;
	replayIndex: number;
	replayMax: number;
	onToggleReplayMode: () => void;
	onToggleReplayPlaying: () => void;
	onResetReplay: () => void;
	onSeekReplay: (index: number) => void;
}

export function TradingHeader({
	currentSymbol,
	favorites,
	searchQuery,
	searchPending,
	showSearch,
	filteredSymbols,
	popularSymbols,
	currentTimeframe,
	chartType,
	compareSymbol,
	indicators,
	loading,
	isDarkMode,
	dataMode = "api",
	onQueryChange,
	onOpenSearchChange,
	onSelectSymbol,
	onToggleFavorite,
	onTimeframeChange,
	onChartTypeChange,
	onCompare,
	onLayoutChange,
	onIndicatorsChange,
	onRefresh,
	onExport,
	onFullscreen,
	onThemeToggle,
	replayMode,
	replayPlaying,
	replayIndex,
	replayMax,
	onToggleReplayMode,
	onToggleReplayPlaying,
	onResetReplay,
	onSeekReplay,
}: TradingHeaderProps) {
	const [clockTime, setClockTime] = useState("");

	useEffect(() => {
		setClockTime(new Date().toLocaleTimeString());
		const timer = window.setInterval(() => {
			setClockTime(new Date().toLocaleTimeString());
		}, 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className="min-h-14 border-b border-border bg-card/50 backdrop-blur-sm px-3 py-2 overflow-x-auto flex flex-col gap-2">
			<div className="flex min-w-max items-center justify-between gap-4">
				<div className="flex min-w-max items-center gap-4">
					<Link
						href="/"
						className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity"
					>
						<BarChart3 className="h-5 w-5 text-white" />
						<span className="font-bold text-white text-lg">TradeView Pro</span>
					</Link>

					<Link href="/geopolitical-map">
						<Button
							variant="ghost"
							size="sm"
							className="gap-2 h-9 px-3 hover:bg-accent/50 text-muted-foreground hover:text-foreground"
						>
							<Globe className="h-4 w-4" />
							<span>Map</span>
						</Button>
					</Link>

					<Separator orientation="vertical" className="h-6" />
					<SymbolSearch
						query={searchQuery}
						open={showSearch}
						searchPending={searchPending}
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
				</div>

				<div className="flex min-w-max items-center gap-2">
					<Button
						variant={replayMode ? "secondary" : "outline"}
						size="sm"
						className="h-8 gap-1.5"
						onClick={onToggleReplayMode}
					>
						<Zap className={`h-3.5 w-3.5 ${replayMode ? "fill-primary" : ""}`} />
						Replay
					</Button>

					{replayMode && (
						<div className="flex items-center gap-1.5 bg-accent/30 rounded-md px-2 h-8 border border-border/50">
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6"
								onClick={onToggleReplayPlaying}
							>
								{replayPlaying ? (
									<div className="h-2.5 w-2.5 bg-foreground rounded-sm" />
								) : (
									<div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-foreground border-b-[5px] border-b-transparent ml-0.5" />
								)}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 px-1.5 text-[10px] uppercase font-bold"
								onClick={onResetReplay}
							>
								Reset
							</Button>
							<div className="flex items-center gap-2 text-[10px] font-mono min-w-[140px]">
								<span>
									{replayIndex}/{Math.max(replayMax, 1)}
								</span>
								<input
									type="range"
									min={1}
									max={Math.max(replayMax, 1)}
									value={Math.max(1, replayIndex)}
									onChange={(event) => onSeekReplay(Number(event.target.value))}
									className="w-20 accent-emerald-500 h-1"
								/>
							</div>
						</div>
					)}

					<Separator orientation="vertical" className="h-6" />

					<div className="flex items-center gap-2 px-1">
						<Badge variant="outline" className="h-7 gap-1 font-mono text-[10px] bg-background/50">
							<Clock className="h-3 w-3" />
							{clockTime}
						</Badge>
						<Badge
							variant="outline"
							className={`h-7 gap-1 text-[10px] bg-background/50 ${
								dataMode === "api"
									? "text-emerald-500 border-emerald-500/30"
									: "text-amber-500 border-amber-500/30"
							}`}
						>
							<Zap className={`h-3 w-3 ${dataMode === "api" ? "fill-emerald-500/20" : ""}`} />
							{dataMode === "api" ? "LIVE" : "FALLBACK"}
						</Badge>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between gap-4 h-9">
				<div className="flex items-center gap-2">
					<ChartTypeSelector chartType={chartType} onChartTypeChange={onChartTypeChange} />
					<CompareSymbol onCompare={onCompare} currentCompare={compareSymbol} />
					<Separator orientation="vertical" className="h-5 mx-1" />
					<IndicatorPanel indicators={indicators} onIndicatorsChange={onIndicatorsChange} />
				</div>

				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="h-8 w-8 p-0">
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

					<Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onRefresh} disabled={loading}>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
					</Button>

					<Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onExport}>
						<Camera className="h-4 w-4" />
					</Button>

					<Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onFullscreen}>
						<Fullscreen className="h-4 w-4" />
					</Button>

					<Separator orientation="vertical" className="h-5 mx-1" />

					<AlertPanel />
					<SettingsPanel />

					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onThemeToggle}>
						{isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default TradingHeader;
