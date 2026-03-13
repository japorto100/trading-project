"use client";

import {
	BarChart3,
	BookOpen,
	ClipboardList,
	FlaskConical,
	type LucideIcon,
	Newspaper,
	SlidersHorizontal,
	Wallet,
	X,
} from "lucide-react";
import type { ReactNode } from "react";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { MacroPanel } from "@/features/trading/MacroPanel";
import { NewsPanel } from "@/features/trading/NewsPanel";
import { OrderbookPanel } from "@/features/trading/OrderbookPanel";
import { OrdersPanel } from "@/features/trading/OrdersPanel";
import { PortfolioPanel } from "@/features/trading/PortfolioPanel";
import { StrategyLabPanel } from "@/features/trading/StrategyLabPanel";
import type { SidebarPanel } from "@/features/trading/types";
import type { OHLCVData } from "@/lib/providers/types";

interface RightDetailsSidebarProps {
	activePanel: SidebarPanel;
	currentSymbol: string;
	currentPrice: number;
	candleData: OHLCVData[];
	indicators: IndicatorSettings;
	onSetActivePanel: (panel: SidebarPanel) => void;
	onClose: () => void;
	onIndicatorsChange: (patch: Partial<IndicatorSettings>) => void;
}

interface IndicatorSectionCardProps {
	title: string;
	description: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	children?: ReactNode;
}

function IndicatorSectionCard({
	title,
	description,
	checked,
	onCheckedChange,
	children,
}: IndicatorSectionCardProps) {
	return (
		<div className="space-y-2 rounded-md border border-border p-3">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium">{title}</p>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
				<Switch checked={checked} onCheckedChange={onCheckedChange} />
			</div>
			{children}
		</div>
	);
}

interface PresetButtonRowProps<T extends number | string> {
	values: T[];
	activeValue: T | undefined;
	getKey: (value: T) => string;
	renderLabel?: (value: T) => string;
	onSelect: (value: T) => void;
}

function PresetButtonRow<T extends number | string>({
	values,
	activeValue,
	getKey,
	renderLabel,
	onSelect,
}: PresetButtonRowProps<T>) {
	return (
		<div className="flex flex-wrap gap-1">
			{values.map((value) => (
				<Button
					key={getKey(value)}
					variant={activeValue === value ? "secondary" : "ghost"}
					size="sm"
					className="h-7 px-2 text-xs"
					onClick={() => onSelect(value)}
				>
					{renderLabel ? renderLabel(value) : String(value)}
				</Button>
			))}
		</div>
	);
}

export function RightDetailsSidebar({
	activePanel,
	currentSymbol,
	currentPrice,
	candleData,
	indicators,
	onSetActivePanel,
	onClose,
	onIndicatorsChange,
}: RightDetailsSidebarProps) {
	const panels: Array<{ id: SidebarPanel; icon: LucideIcon; label: string }> = [
		{ id: "indicators", icon: SlidersHorizontal, label: "Indic" },
		{ id: "orderbook", icon: BookOpen, label: "Book" },
		{ id: "news", icon: Newspaper, label: "News" },
		{ id: "macro", icon: BarChart3, label: "Macro" },
		{ id: "orders", icon: ClipboardList, label: "Orders" },
		{ id: "portfolio", icon: Wallet, label: "Port" },
		{ id: "strategy", icon: FlaskConical, label: "Strat" },
	];

	return (
		<aside
			data-testid="sidebar-right"
			className="w-full border-l border-border bg-card/30 backdrop-blur-sm flex flex-col h-full overflow-hidden"
		>
			<div className="flex items-center justify-between border-b border-border bg-accent/10 h-10 px-1">
				<div className="flex items-center flex-1">
					{panels.map((p) => (
						<Button
							key={p.id}
							variant={activePanel === p.id ? "secondary" : "ghost"}
							data-testid={`tab-${p.id}`}
							className={`h-8 rounded-md mx-0.5 px-2 flex-1 transition-all duration-300 ${
								activePanel === p.id
									? "bg-accent/80 shadow-sm border border-border"
									: "hover:bg-accent/40 hover:shadow-chromatic"
							}`}
							onClick={() => onSetActivePanel(p.id)}
						>
							<p.icon
								className={`h-3.5 w-3.5 mr-1 ${activePanel === p.id ? "text-success" : "text-muted-foreground"}`}
							/>
							<span
								className={`text-[10px] uppercase font-bold tracking-tight ${activePanel === p.id ? "text-foreground" : "text-muted-foreground"}`}
							>
								{p.label}
							</span>
						</Button>
					))}
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
					onClick={onClose}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex-1 overflow-hidden flex flex-col">
				{activePanel === "indicators" && (
					<ScrollArea className="flex-1">
						<div className="p-3 space-y-4">
							{/* SMA */}
							<IndicatorSectionCard
								title="SMA"
								description="Simple Moving Average"
								checked={indicators.sma.enabled}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({ sma: { ...indicators.sma, enabled } })
								}
							>
								{indicators.sma.enabled ? (
									<PresetButtonRow
										values={[5, 10, 20, 50, 100, 200]}
										activeValue={indicators.sma.period}
										getKey={(p) => `sma-${p}`}
										onSelect={(period) =>
											onIndicatorsChange({ sma: { ...indicators.sma, period } })
										}
									/>
								) : null}
							</IndicatorSectionCard>

							{/* EMA */}
							<IndicatorSectionCard
								title="EMA"
								description="Exponential Moving Average"
								checked={indicators.ema.enabled}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({ ema: { ...indicators.ema, enabled } })
								}
							>
								{indicators.ema.enabled ? (
									<PresetButtonRow
										values={[5, 10, 20, 50, 100, 200]}
										activeValue={indicators.ema.period}
										getKey={(p) => `ema-${p}`}
										onSelect={(period) =>
											onIndicatorsChange({ ema: { ...indicators.ema, period } })
										}
									/>
								) : null}
							</IndicatorSectionCard>

							{/* RSI */}
							<IndicatorSectionCard
								title="RSI"
								description="Relative Strength Index"
								checked={indicators.rsi.enabled}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({ rsi: { ...indicators.rsi, enabled } })
								}
							>
								{indicators.rsi.enabled ? (
									<PresetButtonRow
										values={[7, 14, 21, 28]}
										activeValue={indicators.rsi.period}
										getKey={(p) => `rsi-${p}`}
										onSelect={(period) =>
											onIndicatorsChange({ rsi: { ...indicators.rsi, period } })
										}
									/>
								) : null}
							</IndicatorSectionCard>

							{/* MACD */}
							<IndicatorSectionCard
								title="MACD"
								description="Momentum oscillator"
								checked={indicators.macd?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										macd: { ...(indicators.macd ?? { enabled: false }), enabled },
									})
								}
							/>

							{/* Bollinger Bands */}
							<div className="space-y-2 rounded-md border border-border p-3">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Bollinger Bands</p>
										<p className="text-xs text-muted-foreground">Volatility bands</p>
									</div>
									<Switch
										checked={indicators.bollinger?.enabled ?? false}
										onCheckedChange={(enabled) =>
											onIndicatorsChange({
												bollinger: {
													...(indicators.bollinger ?? {
														enabled: false,
														period: 20,
														stdDev: 2,
													}),
													enabled,
												},
											})
										}
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
													onClick={() =>
														onIndicatorsChange({
															bollinger: {
																...(indicators.bollinger ?? {
																	enabled: true,
																	period: 20,
																	stdDev: 2,
																}),
																period,
															},
														})
													}
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
													onClick={() =>
														onIndicatorsChange({
															bollinger: {
																...(indicators.bollinger ?? {
																	enabled: true,
																	period: 20,
																	stdDev: 2,
																}),
																stdDev: std,
															},
														})
													}
												>
													x{std}
												</Button>
											))}
										</div>
									</>
								)}
							</div>

							{/* VWAP */}
							<IndicatorSectionCard
								title="VWAP"
								description="Volume weighted average price"
								checked={indicators.vwap?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										vwap: { ...(indicators.vwap ?? { enabled: false }), enabled },
									})
								}
							/>

							{/* VWMA */}
							<IndicatorSectionCard
								title="VWMA"
								description="Volume weighted moving average"
								checked={indicators.vwma?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										vwma: { ...(indicators.vwma ?? { enabled: false, period: 20 }), enabled },
									})
								}
							>
								{indicators.vwma?.enabled ? (
									<PresetButtonRow
										values={[10, 20, 30, 50, 100, 200]}
										activeValue={indicators.vwma?.period}
										getKey={(p) => `vwma-${p}`}
										onSelect={(period) =>
											onIndicatorsChange({
												vwma: { ...(indicators.vwma ?? { enabled: true, period: 20 }), period },
											})
										}
									/>
								) : null}
							</IndicatorSectionCard>

							{/* ATR */}
							<IndicatorSectionCard
								title="ATR"
								description="Average true range"
								checked={indicators.atr?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										atr: { ...(indicators.atr ?? { enabled: false, period: 14 }), enabled },
									})
								}
							>
								{indicators.atr?.enabled ? (
									<PresetButtonRow
										values={[7, 14, 21, 28, 50]}
										activeValue={indicators.atr?.period}
										getKey={(p) => `atr-${p}`}
										onSelect={(period) =>
											onIndicatorsChange({
												atr: { ...(indicators.atr ?? { enabled: true, period: 14 }), period },
											})
										}
									/>
								) : null}
							</IndicatorSectionCard>

							{/* SMA +/- ATR Channel */}
							<div className="space-y-2 rounded-md border border-border p-3">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">SMA +/- ATR Channel</p>
										<p className="text-xs text-muted-foreground">SMA center with ATR width</p>
									</div>
									<Switch
										checked={indicators.atrChannel?.enabled ?? false}
										onCheckedChange={(enabled) =>
											onIndicatorsChange({
												atrChannel: {
													...(indicators.atrChannel ?? {
														enabled: false,
														smaPeriod: 50,
														atrPeriod: 14,
														multiplier: 1.5,
													}),
													enabled,
												},
											})
										}
									/>
								</div>
								{indicators.atrChannel?.enabled && (
									<>
										<div className="flex flex-wrap gap-1">
											{[20, 50, 100, 200].map((period) => (
												<Button
													key={`atrch-sma-${period}`}
													variant={
														indicators.atrChannel?.smaPeriod === period ? "secondary" : "ghost"
													}
													size="sm"
													className="h-7 px-2 text-xs"
													onClick={() =>
														onIndicatorsChange({
															atrChannel: {
																...(indicators.atrChannel ?? {
																	enabled: true,
																	smaPeriod: 50,
																	atrPeriod: 14,
																	multiplier: 1.5,
																}),
																smaPeriod: period,
															},
														})
													}
												>
													SMA{period}
												</Button>
											))}
										</div>
										<div className="flex flex-wrap gap-1">
											{[7, 14, 21, 28, 50].map((period) => (
												<Button
													key={`atrch-atr-${period}`}
													variant={
														indicators.atrChannel?.atrPeriod === period ? "secondary" : "ghost"
													}
													size="sm"
													className="h-7 px-2 text-xs"
													onClick={() =>
														onIndicatorsChange({
															atrChannel: {
																...(indicators.atrChannel ?? {
																	enabled: true,
																	smaPeriod: 50,
																	atrPeriod: 14,
																	multiplier: 1.5,
																}),
																atrPeriod: period,
															},
														})
													}
												>
													ATR{period}
												</Button>
											))}
										</div>
										<div className="flex flex-wrap gap-1">
											{[1, 1.5, 2, 2.5, 3].map((mult) => (
												<Button
													key={`atrch-m-${mult}`}
													variant={
														indicators.atrChannel?.multiplier === mult ? "secondary" : "ghost"
													}
													size="sm"
													className="h-7 px-2 text-xs"
													onClick={() =>
														onIndicatorsChange({
															atrChannel: {
																...(indicators.atrChannel ?? {
																	enabled: true,
																	smaPeriod: 50,
																	atrPeriod: 14,
																	multiplier: 1.5,
																}),
																multiplier: mult,
															},
														})
													}
												>
													x{mult}
												</Button>
											))}
										</div>
									</>
								)}
							</div>

							{/* HMA */}
							<IndicatorSectionCard
								title="HMA"
								description="Hull moving average"
								checked={indicators.hma?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										hma: { ...(indicators.hma ?? { enabled: false, period: 20 }), enabled },
									})
								}
							>
								{indicators.hma?.enabled ? (
									<PresetButtonRow
										values={[9, 16, 20, 34, 55]}
										activeValue={indicators.hma?.period}
										getKey={(p) => `hma-${p}`}
										onSelect={(period) =>
											onIndicatorsChange({
												hma: { ...(indicators.hma ?? { enabled: true, period: 20 }), period },
											})
										}
									/>
								) : null}
							</IndicatorSectionCard>

							{/* ADX */}
							<IndicatorSectionCard
								title="ADX"
								description="Trend strength oscillator"
								checked={indicators.adx?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										adx: { ...(indicators.adx ?? { enabled: false, period: 14 }), enabled },
									})
								}
							>
								{indicators.adx?.enabled ? (
									<PresetButtonRow
										values={[7, 14, 21, 28]}
										activeValue={indicators.adx?.period}
										getKey={(p) => `adx-${p}`}
										onSelect={(period) =>
											onIndicatorsChange({
												adx: { ...(indicators.adx ?? { enabled: true, period: 14 }), period },
											})
										}
									/>
								) : null}
							</IndicatorSectionCard>

							{/* Simple toggle indicators */}
							<IndicatorSectionCard
								title="Ichimoku"
								description="Cloud baseline overlay"
								checked={indicators.ichimoku?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										ichimoku: {
											...(indicators.ichimoku ?? {
												enabled: false,
												tenkanPeriod: 9,
												kijunPeriod: 26,
												senkouBPeriod: 52,
												displacement: 26,
											}),
											enabled,
										},
									})
								}
							/>
							<IndicatorSectionCard
								title="Parabolic SAR"
								description="Trend reversal dots"
								checked={indicators.parabolicSar?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										parabolicSar: {
											...(indicators.parabolicSar ?? { enabled: false, step: 0.02, maxAF: 0.2 }),
											enabled,
										},
									})
								}
							/>
							<IndicatorSectionCard
								title="Keltner"
								description="EMA channel by ATR"
								checked={indicators.keltner?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										keltner: {
											...(indicators.keltner ?? {
												enabled: false,
												emaPeriod: 20,
												atrPeriod: 10,
												multiplier: 2,
											}),
											enabled,
										},
									})
								}
							/>
							<IndicatorSectionCard
								title="Volume Profile"
								description="Top price-volume levels"
								checked={indicators.volumeProfile?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										volumeProfile: {
											...(indicators.volumeProfile ?? { enabled: false, levels: 20, topN: 6 }),
											enabled,
										},
									})
								}
							/>
							<IndicatorSectionCard
								title="Support/Resistance"
								description="Key horizontal levels"
								checked={indicators.supportResistance?.enabled ?? false}
								onCheckedChange={(enabled) =>
									onIndicatorsChange({
										supportResistance: {
											...(indicators.supportResistance ?? {
												enabled: false,
												lookback: 20,
												threshold: 0.02,
												topN: 6,
											}),
											enabled,
										},
									})
								}
							/>
						</div>
					</ScrollArea>
				)}

				{activePanel === "orderbook" && <OrderbookPanel symbol={currentSymbol} />}

				{activePanel === "news" && <NewsPanel symbol={currentSymbol} />}
				{activePanel === "macro" && <MacroPanel symbol={currentSymbol} />}

				{activePanel === "orders" && (
					<OrdersPanel symbol={currentSymbol} markPrice={currentPrice} />
				)}

				{activePanel === "portfolio" && <PortfolioPanel />}

				{activePanel === "strategy" && (
					<ScrollArea className="flex-1">
						<StrategyLabPanel candleData={candleData} />
					</ScrollArea>
				)}
			</div>
		</aside>
	);
}

export default RightDetailsSidebar;
