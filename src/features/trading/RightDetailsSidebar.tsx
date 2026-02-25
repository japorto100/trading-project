"use client";

import {
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
import { Switch } from "@/components/ui/switch";
import { NewsPanel } from "@/features/trading/NewsPanel";
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

interface SimpleToggleSectionConfig {
	id: string;
	title: string;
	description: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

interface PresetToggleSectionConfig extends SimpleToggleSectionConfig {
	values: number[];
	activeValue: number | undefined;
	onSelect: (value: number) => void;
	formatValue?: (value: number) => string;
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
	const panels: Array<{ id: SidebarPanel; icon: LucideIcon; label: string }> = [
		{ id: "indicators", icon: SlidersHorizontal, label: "Indic" },
		{ id: "news", icon: Newspaper, label: "News" },
		{ id: "orders", icon: ClipboardList, label: "Orders" },
		{ id: "portfolio", icon: Wallet, label: "Port" },
		{ id: "strategy", icon: FlaskConical, label: "Strat" },
	];
	const preBollingerSimpleSections: SimpleToggleSectionConfig[] = [
		{
			id: "macd",
			title: "MACD",
			description: "Momentum oscillator",
			checked: indicators.macd?.enabled ?? false,
			onCheckedChange: onSetMacdEnabled,
		},
	];
	const postBollingerPresetSections: PresetToggleSectionConfig[] = [
		{
			id: "vwma",
			title: "VWMA",
			description: "Volume weighted moving average",
			checked: indicators.vwma?.enabled ?? false,
			onCheckedChange: onSetVwmaEnabled,
			values: [10, 20, 30, 50, 100, 200],
			activeValue: indicators.vwma?.period,
			onSelect: onSetVwmaPeriod,
		},
		{
			id: "atr",
			title: "ATR",
			description: "Average true range",
			checked: indicators.atr?.enabled ?? false,
			onCheckedChange: onSetAtrEnabled,
			values: [7, 14, 21, 28, 50],
			activeValue: indicators.atr?.period,
			onSelect: onSetAtrPeriod,
		},
	];
	const postBollingerSimpleSections: SimpleToggleSectionConfig[] = [
		{
			id: "vwap",
			title: "VWAP",
			description: "Volume weighted average price",
			checked: indicators.vwap?.enabled ?? false,
			onCheckedChange: onSetVwapEnabled,
		},
	];
	const postAtrChannelPresetSections: PresetToggleSectionConfig[] = [
		{
			id: "hma",
			title: "HMA",
			description: "Hull moving average",
			checked: indicators.hma?.enabled ?? false,
			onCheckedChange: onSetHmaEnabled,
			values: [9, 16, 20, 34, 55],
			activeValue: indicators.hma?.period,
			onSelect: onSetHmaPeriod,
		},
		{
			id: "adx",
			title: "ADX",
			description: "Trend strength oscillator",
			checked: indicators.adx?.enabled ?? false,
			onCheckedChange: onSetAdxEnabled,
			values: [7, 14, 21, 28],
			activeValue: indicators.adx?.period,
			onSelect: onSetAdxPeriod,
		},
	];
	const trailingSimpleSections: SimpleToggleSectionConfig[] = [
		{
			id: "ichimoku",
			title: "Ichimoku",
			description: "Cloud baseline overlay",
			checked: indicators.ichimoku?.enabled ?? false,
			onCheckedChange: onSetIchimokuEnabled,
		},
		{
			id: "parabolicSar",
			title: "Parabolic SAR",
			description: "Trend reversal dots",
			checked: indicators.parabolicSar?.enabled ?? false,
			onCheckedChange: onSetParabolicSarEnabled,
		},
		{
			id: "keltner",
			title: "Keltner",
			description: "EMA channel by ATR",
			checked: indicators.keltner?.enabled ?? false,
			onCheckedChange: onSetKeltnerEnabled,
		},
		{
			id: "volumeProfile",
			title: "Volume Profile",
			description: "Top price-volume levels",
			checked: indicators.volumeProfile?.enabled ?? false,
			onCheckedChange: onSetVolumeProfileEnabled,
		},
		{
			id: "supportResistance",
			title: "Support/Resistance",
			description: "Key horizontal levels",
			checked: indicators.supportResistance?.enabled ?? false,
			onCheckedChange: onSetSupportResistanceEnabled,
		},
	];

	return (
		<aside
			data-testid="sidebar-right"
			className="w-full border-l border-border bg-card/30 flex flex-col h-full overflow-hidden"
		>
			<div className="flex items-center justify-between border-b border-border bg-accent/10 h-10 px-1">
				<div className="flex items-center flex-1">
					{panels.map((p) => (
						<Button
							key={p.id}
							variant={activePanel === p.id ? "secondary" : "ghost"}
							data-testid={`tab-${p.id}`}
							className="h-8 rounded-none px-2 flex-1"
							onClick={() => onSetActivePanel(p.id)}
						>
							<p.icon className="h-3.5 w-3.5 mr-1" />
							<span className="text-[10px] uppercase font-bold tracking-tight">{p.label}</span>
						</Button>
					))}
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground"
					onClick={onClose}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex-1 overflow-hidden flex flex-col">
				{activePanel === "indicators" && (
					<div className="flex-1 overflow-y-auto p-3 space-y-4">
						<IndicatorSectionCard
							title="SMA"
							description="Simple Moving Average"
							checked={indicators.sma.enabled}
							onCheckedChange={(checked) => onSetCoreIndicatorEnabled("sma", checked)}
						>
							{indicators.sma.enabled ? (
								<PresetButtonRow
									values={[5, 10, 20, 50, 100, 200]}
									activeValue={indicators.sma.period}
									getKey={(period) => `sma-${period}`}
									onSelect={(period) => onSetCoreIndicatorPeriod("sma", period)}
								/>
							) : null}
						</IndicatorSectionCard>

						<IndicatorSectionCard
							title="EMA"
							description="Exponential Moving Average"
							checked={indicators.ema.enabled}
							onCheckedChange={(checked) => onSetCoreIndicatorEnabled("ema", checked)}
						>
							{indicators.ema.enabled ? (
								<PresetButtonRow
									values={[5, 10, 20, 50, 100, 200]}
									activeValue={indicators.ema.period}
									getKey={(period) => `ema-${period}`}
									onSelect={(period) => onSetCoreIndicatorPeriod("ema", period)}
								/>
							) : null}
						</IndicatorSectionCard>

						<IndicatorSectionCard
							title="RSI"
							description="Relative Strength Index"
							checked={indicators.rsi.enabled}
							onCheckedChange={(checked) => onSetCoreIndicatorEnabled("rsi", checked)}
						>
							{indicators.rsi.enabled ? (
								<PresetButtonRow
									values={[7, 14, 21, 28]}
									activeValue={indicators.rsi.period}
									getKey={(period) => `rsi-${period}`}
									onSelect={(period) => onSetCoreIndicatorPeriod("rsi", period)}
								/>
							) : null}
						</IndicatorSectionCard>

						{preBollingerSimpleSections.map((section) => (
							<IndicatorSectionCard
								key={section.id}
								title={section.title}
								description={section.description}
								checked={section.checked}
								onCheckedChange={section.onCheckedChange}
							/>
						))}

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

						{postBollingerSimpleSections.map((section) => (
							<IndicatorSectionCard
								key={section.id}
								title={section.title}
								description={section.description}
								checked={section.checked}
								onCheckedChange={section.onCheckedChange}
							/>
						))}

						{postBollingerPresetSections.map((section) => (
							<IndicatorSectionCard
								key={section.id}
								title={section.title}
								description={section.description}
								checked={section.checked}
								onCheckedChange={section.onCheckedChange}
							>
								{section.checked ? (
									<PresetButtonRow
										values={section.values}
										activeValue={section.activeValue}
										getKey={(value) => `${section.id}-${value}`}
										renderLabel={section.formatValue}
										onSelect={section.onSelect}
									/>
								) : null}
							</IndicatorSectionCard>
						))}

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
												variant={
													indicators.atrChannel?.smaPeriod === period ? "secondary" : "ghost"
												}
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
												variant={
													indicators.atrChannel?.atrPeriod === period ? "secondary" : "ghost"
												}
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

						{postAtrChannelPresetSections.map((section) => (
							<IndicatorSectionCard
								key={section.id}
								title={section.title}
								description={section.description}
								checked={section.checked}
								onCheckedChange={section.onCheckedChange}
							>
								{section.checked ? (
									<PresetButtonRow
										values={section.values}
										activeValue={section.activeValue}
										getKey={(value) => `${section.id}-${value}`}
										renderLabel={section.formatValue}
										onSelect={section.onSelect}
									/>
								) : null}
							</IndicatorSectionCard>
						))}

						{trailingSimpleSections.map((section) => (
							<IndicatorSectionCard
								key={section.id}
								title={section.title}
								description={section.description}
								checked={section.checked}
								onCheckedChange={section.onCheckedChange}
							/>
						))}
					</div>
				)}

				{activePanel === "news" && <NewsPanel symbol={currentSymbol} />}

				{activePanel === "orders" && (
					<OrdersPanel symbol={currentSymbol} markPrice={currentPrice} />
				)}

				{activePanel === "portfolio" && <PortfolioPanel />}

				{activePanel === "strategy" && <StrategyLabPanel candleData={candleData} />}
			</div>
		</aside>
	);
}

export default RightDetailsSidebar;
