"use client";

import { ClipboardList, Newspaper, SlidersHorizontal, Wallet, X } from "lucide-react";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NewsPanel } from "@/features/trading/NewsPanel";
import { OrdersPanel } from "@/features/trading/OrdersPanel";
import { PortfolioPanel } from "@/features/trading/PortfolioPanel";
import type { SidebarPanel } from "@/features/trading/types";

interface RightDetailsSidebarProps {
	activePanel: SidebarPanel;
	currentSymbol: string;
	currentPrice: number;
	indicators: IndicatorSettings;
	onSetActivePanel: (panel: SidebarPanel) => void;
	onClose: () => void;
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

export function RightDetailsSidebar({
	activePanel,
	currentSymbol,
	currentPrice,
	indicators,
	onSetActivePanel,
	onClose,
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
}: RightDetailsSidebarProps) {
	// Filter out "watchlist" from the right panel options
	const panels: Array<{ id: SidebarPanel; icon: any; label: string }> = [
		{ id: "indicators", icon: SlidersHorizontal, label: "Indic" },
		{ id: "news", icon: Newspaper, label: "News" },
		{ id: "orders", icon: ClipboardList, label: "Orders" },
		{ id: "portfolio", icon: Wallet, label: "Port" },
	];

	return (
		<aside className="w-full border-l border-border bg-card/30 flex flex-col h-full overflow-hidden">
			<div className="flex items-center justify-between border-b border-border bg-accent/10 h-10 px-1">
				<div className="flex items-center flex-1">
					{panels.map((p) => (
						<Button
							key={p.id}
							variant={activePanel === p.id ? "secondary" : "ghost"}
							className="h-8 rounded-none px-2 flex-1"
							onClick={() => onSetActivePanel(p.id)}
						>
							<p.icon className="h-3.5 w-3.5 mr-1" />
							<span className="text-[10px] uppercase font-bold tracking-tight">{p.label}</span>
						</Button>
					))}
				</div>
				<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex-1 overflow-hidden flex flex-col">
				{activePanel === "indicators" && (
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

				{activePanel === "news" && <NewsPanel symbol={currentSymbol} />}

				{activePanel === "orders" && (
					<OrdersPanel symbol={currentSymbol} markPrice={currentPrice} />
				)}

				{activePanel === "portfolio" && <PortfolioPanel />}
			</div>
		</aside>
	);
}

export default RightDetailsSidebar;
