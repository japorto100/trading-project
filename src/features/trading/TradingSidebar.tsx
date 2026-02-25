"use client";

/**
 * @deprecated Legacy combined sidebar prototype.
 * Current trading page uses split watchlist + right details sidebars.
 * Keep temporarily for reference until the remaining migration/cleanup is complete.
 */

import { ClipboardList, List, Newspaper, SlidersHorizontal, Wallet } from "lucide-react";
import { WatchlistPanel } from "@/components/fusion/WatchlistPanel";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsPanel } from "@/features/trading/NewsPanel";
import { OrdersPanel } from "@/features/trading/OrdersPanel";
import { PortfolioPanel } from "@/features/trading/PortfolioPanel";
import type { SidebarPanel, WatchlistTab } from "@/features/trading/types";
import type { FusionSymbol } from "@/lib/fusion-symbols";

interface TradingSidebarProps {
	activeSidebarPanel: SidebarPanel;
	activeTab: WatchlistTab;
	watchlistSymbols: FusionSymbol[];
	currentSymbol: string;
	currentPrice: number;
	favorites: string[];
	indicators: IndicatorSettings;
	onSetActiveSidebarPanel: (panel: SidebarPanel) => void;
	onSetActiveTab: (tab: WatchlistTab) => void;
	onSelectSymbol: (symbol: FusionSymbol) => void;
	onToggleFavorite: (symbol: string) => void;
	onSetCoreIndicatorEnabled: (key: "sma" | "ema" | "rsi", enabled: boolean) => void;
	onSetCoreIndicatorPeriod: (key: "sma" | "ema" | "rsi", period: number) => void;
	onSetMacdEnabled: (enabled: boolean) => void;
	onSetBollingerEnabled: (enabled: boolean) => void;
	onSetBollingerPeriod: (period: number) => void;
	onSetBollingerStdDev: (stdDev: number) => void;
	onSetVwapEnabled: (enabled: boolean) => void;
	onSetVwmaEnabled: (enabled: boolean) => void;
	onSetVwmaPeriod: (period: number) => void;
	onSetAtrEnabled: (enabled: boolean) => void;
	onSetAtrPeriod: (period: number) => void;
	onSetAtrChannelEnabled: (enabled: boolean) => void;
	onSetAtrChannelSmaPeriod: (period: number) => void;
	onSetAtrChannelAtrPeriod: (period: number) => void;
	onSetAtrChannelMultiplier: (multiplier: number) => void;
	onSetHmaEnabled: (enabled: boolean) => void;
	onSetHmaPeriod: (period: number) => void;
	onSetAdxEnabled: (enabled: boolean) => void;
	onSetAdxPeriod: (period: number) => void;
	onSetIchimokuEnabled: (enabled: boolean) => void;
	onSetParabolicSarEnabled: (enabled: boolean) => void;
	onSetKeltnerEnabled: (enabled: boolean) => void;
	onSetVolumeProfileEnabled: (enabled: boolean) => void;
	onSetSupportResistanceEnabled: (enabled: boolean) => void;
}

export function TradingSidebar({
	activeSidebarPanel,
	activeTab,
	watchlistSymbols,
	currentSymbol,
	currentPrice,
	favorites,
	indicators,
	onSetActiveSidebarPanel,
	onSetActiveTab,
	onSelectSymbol,
	onToggleFavorite,
	onSetCoreIndicatorEnabled,
	onSetCoreIndicatorPeriod,
	onSetMacdEnabled,
	onSetBollingerEnabled,
	onSetBollingerPeriod,
	onSetBollingerStdDev,
	onSetVwapEnabled,
	onSetVwmaEnabled,
	onSetVwmaPeriod,
	onSetAtrEnabled,
	onSetAtrPeriod,
	onSetAtrChannelEnabled,
	onSetAtrChannelSmaPeriod,
	onSetAtrChannelAtrPeriod,
	onSetAtrChannelMultiplier,
	onSetHmaEnabled,
	onSetHmaPeriod,
	onSetAdxEnabled,
	onSetAdxPeriod,
	onSetIchimokuEnabled,
	onSetParabolicSarEnabled,
	onSetKeltnerEnabled,
	onSetVolumeProfileEnabled,
	onSetSupportResistanceEnabled,
}: TradingSidebarProps) {
	return (
		<aside className="w-72 border-r border-border bg-card/30 flex flex-col h-full">
			<div className="grid grid-cols-5 border-b border-border">
				<Button
					variant={activeSidebarPanel === "watchlist" ? "secondary" : "ghost"}
					className="h-10 rounded-none"
					onClick={() => onSetActiveSidebarPanel("watchlist")}
				>
					<List className="h-4 w-4 mr-1" />
					<span className="text-[11px]">Watch</span>
				</Button>
				<Button
					variant={activeSidebarPanel === "indicators" ? "secondary" : "ghost"}
					className="h-10 rounded-none"
					onClick={() => onSetActiveSidebarPanel("indicators")}
				>
					<SlidersHorizontal className="h-4 w-4 mr-1" />
					<span className="text-[11px]">Indic</span>
				</Button>
				<Button
					variant={activeSidebarPanel === "news" ? "secondary" : "ghost"}
					className="h-10 rounded-none"
					onClick={() => onSetActiveSidebarPanel("news")}
				>
					<Newspaper className="h-4 w-4 mr-1" />
					<span className="text-[11px]">News</span>
				</Button>
				<Button
					variant={activeSidebarPanel === "orders" ? "secondary" : "ghost"}
					className="h-10 rounded-none"
					onClick={() => onSetActiveSidebarPanel("orders")}
				>
					<ClipboardList className="h-4 w-4 mr-1" />
					<span className="text-[11px]">Orders</span>
				</Button>
				<Button
					variant={activeSidebarPanel === "portfolio" ? "secondary" : "ghost"}
					className="h-10 rounded-none"
					onClick={() => onSetActiveSidebarPanel("portfolio")}
				>
					<Wallet className="h-4 w-4 mr-1" />
					<span className="text-[11px]">Port</span>
				</Button>
			</div>

			{activeSidebarPanel === "watchlist" && (
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
								{/* Faded edges for horizontal scroll indication */}
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
			)}

			{activeSidebarPanel === "indicators" && (
				<div className="flex-1 overflow-y-auto p-3 space-y-4">
					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">SMA</p>
								<p className="text-xs text-muted-foreground">Simple Moving Average</p>
							</div>
							<Switch
								checked={indicators.sma.enabled}
								onCheckedChange={(checked) => onSetCoreIndicatorEnabled("sma", checked)}
							/>
						</div>
						{indicators.sma.enabled && (
							<div className="flex flex-wrap gap-1">
								{[5, 10, 20, 50, 100, 200].map((period) => (
									<Button
										key={`sma-${period}`}
										variant={indicators.sma.period === period ? "secondary" : "ghost"}
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => onSetCoreIndicatorPeriod("sma", period)}
									>
										{period}
									</Button>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">EMA</p>
								<p className="text-xs text-muted-foreground">Exponential Moving Average</p>
							</div>
							<Switch
								checked={indicators.ema.enabled}
								onCheckedChange={(checked) => onSetCoreIndicatorEnabled("ema", checked)}
							/>
						</div>
						{indicators.ema.enabled && (
							<div className="flex flex-wrap gap-1">
								{[5, 10, 20, 50, 100, 200].map((period) => (
									<Button
										key={`ema-${period}`}
										variant={indicators.ema.period === period ? "secondary" : "ghost"}
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => onSetCoreIndicatorPeriod("ema", period)}
									>
										{period}
									</Button>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">RSI</p>
								<p className="text-xs text-muted-foreground">Relative Strength Index</p>
							</div>
							<Switch
								checked={indicators.rsi.enabled}
								onCheckedChange={(checked) => onSetCoreIndicatorEnabled("rsi", checked)}
							/>
						</div>
						{indicators.rsi.enabled && (
							<div className="flex flex-wrap gap-1">
								{[7, 14, 21, 28].map((period) => (
									<Button
										key={`rsi-${period}`}
										variant={indicators.rsi.period === period ? "secondary" : "ghost"}
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => onSetCoreIndicatorPeriod("rsi", period)}
									>
										{period}
									</Button>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">MACD</p>
								<p className="text-xs text-muted-foreground">Momentum oscillator</p>
							</div>
							<Switch
								checked={indicators.macd?.enabled ?? false}
								onCheckedChange={onSetMacdEnabled}
							/>
						</div>
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Bollinger Bands</p>
								<p className="text-xs text-muted-foreground">Volatility bands</p>
							</div>
							<Switch
								checked={indicators.bollinger?.enabled ?? false}
								onCheckedChange={onSetBollingerEnabled}
							/>
						</div>
						{indicators.bollinger?.enabled && (
							<>
								<div className="flex flex-wrap gap-1">
									{[10, 20, 30, 50].map((period) => (
										<Button
											key={`bb-period-${period}`}
											variant={indicators.bollinger?.period === period ? "secondary" : "ghost"}
											size="sm"
											className="h-7 px-2 text-xs"
											onClick={() => onSetBollingerPeriod(period)}
										>
											P{period}
										</Button>
									))}
								</div>
								<div className="flex flex-wrap gap-1">
									{[1, 1.5, 2, 2.5, 3].map((std) => (
										<Button
											key={`bb-std-${std}`}
											variant={indicators.bollinger?.stdDev === std ? "secondary" : "ghost"}
											size="sm"
											className="h-7 px-2 text-xs"
											onClick={() => onSetBollingerStdDev(std)}
										>
											x{std}
										</Button>
									))}
								</div>
							</>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">VWAP</p>
								<p className="text-xs text-muted-foreground">Volume weighted average price</p>
							</div>
							<Switch
								checked={indicators.vwap?.enabled ?? false}
								onCheckedChange={onSetVwapEnabled}
							/>
						</div>
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">VWMA</p>
								<p className="text-xs text-muted-foreground">Volume weighted moving average</p>
							</div>
							<Switch
								checked={indicators.vwma?.enabled ?? false}
								onCheckedChange={onSetVwmaEnabled}
							/>
						</div>
						{indicators.vwma?.enabled && (
							<div className="flex flex-wrap gap-1">
								{[10, 20, 30, 50, 100, 200].map((period) => (
									<Button
										key={`vwma-${period}`}
										variant={indicators.vwma?.period === period ? "secondary" : "ghost"}
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => onSetVwmaPeriod(period)}
									>
										{period}
									</Button>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">ATR</p>
								<p className="text-xs text-muted-foreground">Average true range</p>
							</div>
							<Switch
								checked={indicators.atr?.enabled ?? false}
								onCheckedChange={onSetAtrEnabled}
							/>
						</div>
						{indicators.atr?.enabled && (
							<div className="flex flex-wrap gap-1">
								{[7, 14, 21, 28, 50].map((period) => (
									<Button
										key={`atr-${period}`}
										variant={indicators.atr?.period === period ? "secondary" : "ghost"}
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => onSetAtrPeriod(period)}
									>
										{period}
									</Button>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">SMA +/- ATR Channel</p>
								<p className="text-xs text-muted-foreground">SMA center with ATR width</p>
							</div>
							<Switch
								checked={indicators.atrChannel?.enabled ?? false}
								onCheckedChange={onSetAtrChannelEnabled}
							/>
						</div>
						{indicators.atrChannel?.enabled && (
							<>
								<div className="flex flex-wrap gap-1">
									{[20, 50, 100, 200].map((period) => (
										<Button
											key={`atrch-sma-${period}`}
											variant={indicators.atrChannel?.smaPeriod === period ? "secondary" : "ghost"}
											size="sm"
											className="h-7 px-2 text-xs"
											onClick={() => onSetAtrChannelSmaPeriod(period)}
										>
											SMA{period}
										</Button>
									))}
								</div>
								<div className="flex flex-wrap gap-1">
									{[7, 14, 21, 28, 50].map((period) => (
										<Button
											key={`atrch-atr-${period}`}
											variant={indicators.atrChannel?.atrPeriod === period ? "secondary" : "ghost"}
											size="sm"
											className="h-7 px-2 text-xs"
											onClick={() => onSetAtrChannelAtrPeriod(period)}
										>
											ATR{period}
										</Button>
									))}
								</div>
								<div className="flex flex-wrap gap-1">
									{[1, 1.5, 2, 2.5, 3].map((mult) => (
										<Button
											key={`atrch-m-${mult}`}
											variant={indicators.atrChannel?.multiplier === mult ? "secondary" : "ghost"}
											size="sm"
											className="h-7 px-2 text-xs"
											onClick={() => onSetAtrChannelMultiplier(mult)}
										>
											x{mult}
										</Button>
									))}
								</div>
							</>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">HMA</p>
								<p className="text-xs text-muted-foreground">Hull moving average</p>
							</div>
							<Switch
								checked={indicators.hma?.enabled ?? false}
								onCheckedChange={onSetHmaEnabled}
							/>
						</div>
						{indicators.hma?.enabled && (
							<div className="flex flex-wrap gap-1">
								{[9, 16, 20, 34, 55].map((period) => (
									<Button
										key={`hma-${period}`}
										variant={indicators.hma?.period === period ? "secondary" : "ghost"}
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => onSetHmaPeriod(period)}
									>
										{period}
									</Button>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">ADX</p>
								<p className="text-xs text-muted-foreground">Trend strength oscillator</p>
							</div>
							<Switch
								checked={indicators.adx?.enabled ?? false}
								onCheckedChange={onSetAdxEnabled}
							/>
						</div>
						{indicators.adx?.enabled && (
							<div className="flex flex-wrap gap-1">
								{[7, 14, 21, 28].map((period) => (
									<Button
										key={`adx-${period}`}
										variant={indicators.adx?.period === period ? "secondary" : "ghost"}
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() => onSetAdxPeriod(period)}
									>
										{period}
									</Button>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Ichimoku</p>
								<p className="text-xs text-muted-foreground">Cloud baseline overlay</p>
							</div>
							<Switch
								checked={indicators.ichimoku?.enabled ?? false}
								onCheckedChange={onSetIchimokuEnabled}
							/>
						</div>
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Parabolic SAR</p>
								<p className="text-xs text-muted-foreground">Trend reversal dots</p>
							</div>
							<Switch
								checked={indicators.parabolicSar?.enabled ?? false}
								onCheckedChange={onSetParabolicSarEnabled}
							/>
						</div>
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Keltner</p>
								<p className="text-xs text-muted-foreground">EMA channel by ATR</p>
							</div>
							<Switch
								checked={indicators.keltner?.enabled ?? false}
								onCheckedChange={onSetKeltnerEnabled}
							/>
						</div>
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Volume Profile</p>
								<p className="text-xs text-muted-foreground">Top price-volume levels</p>
							</div>
							<Switch
								checked={indicators.volumeProfile?.enabled ?? false}
								onCheckedChange={onSetVolumeProfileEnabled}
							/>
						</div>
					</div>

					<div className="space-y-2 rounded-md border border-border p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Support/Resistance</p>
								<p className="text-xs text-muted-foreground">Key horizontal levels</p>
							</div>
							<Switch
								checked={indicators.supportResistance?.enabled ?? false}
								onCheckedChange={onSetSupportResistanceEnabled}
							/>
						</div>
					</div>
				</div>
			)}

			{activeSidebarPanel === "news" && <NewsPanel symbol={currentSymbol} />}

			{activeSidebarPanel === "orders" && (
				<OrdersPanel symbol={currentSymbol} markPrice={currentPrice} />
			)}

			{activeSidebarPanel === "portfolio" && <PortfolioPanel />}
		</aside>
	);
}

export default TradingSidebar;
