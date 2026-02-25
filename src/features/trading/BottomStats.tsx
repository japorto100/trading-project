"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TradingStats {
	change: number;
	percent: number;
	high24h: number;
	low24h: number;
	volume24h: number;
	lastPrice: number;
}

interface BottomStatsProps {
	stats: TradingStats;
	formatPrice: (value: number) => string;
	formatVolume: (value: number) => string;
}

export function BottomStats({ stats, formatPrice, formatVolume }: BottomStatsProps) {
	const [collapsed, setCollapsed] = useState(false);

	if (stats.lastPrice === 0) {
		return null;
	}

	return (
		<div className="border-t border-border bg-card/30">
			<button
				type="button"
				className="flex w-full items-center justify-between px-3 py-1 text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
				onClick={() => setCollapsed((prev) => !prev)}
			>
				<span className="flex items-center gap-1.5 font-medium">
					{collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
					{formatPrice(stats.lastPrice)}
					<span className={stats.change >= 0 ? "text-emerald-500" : "text-red-500"}>
						{stats.change >= 0 ? "+" : ""}
						{stats.percent.toFixed(2)}%
					</span>
					<span className="text-muted-foreground/60">|</span>
					<span>Vol {formatVolume(stats.volume24h)}</span>
				</span>
				<span className="text-[10px]">{collapsed ? "Show details" : "Hide"}</span>
			</button>
			{!collapsed && (
				<div className="grid h-24 grid-cols-2 gap-2 p-2 md:grid-cols-3 lg:grid-cols-5">
					<Card className="bg-background/50 border-border">
						<CardHeader className="p-2 pb-0">
							<CardTitle className="text-xs font-medium text-muted-foreground">Price</CardTitle>
						</CardHeader>
						<CardContent className="p-2 pt-0">
							<div className="text-base font-bold">{formatPrice(stats.lastPrice)}</div>
						</CardContent>
					</Card>

					<Card className="bg-background/50 border-border">
						<CardHeader className="p-2 pb-0">
							<CardTitle className="text-xs font-medium text-muted-foreground">
								24h Change
							</CardTitle>
						</CardHeader>
						<CardContent className="p-2 pt-0">
							<div
								className={`text-base font-bold ${stats.change >= 0 ? "text-emerald-500" : "text-red-500"}`}
							>
								{stats.change >= 0 ? "+" : ""}
								{stats.percent.toFixed(2)}%
							</div>
						</CardContent>
					</Card>

					<Card className="bg-background/50 border-border">
						<CardHeader className="p-2 pb-0">
							<CardTitle className="text-xs font-medium text-muted-foreground">24h High</CardTitle>
						</CardHeader>
						<CardContent className="p-2 pt-0">
							<div className="text-base font-bold text-emerald-500">
								{formatPrice(stats.high24h)}
							</div>
						</CardContent>
					</Card>

					<Card className="bg-background/50 border-border">
						<CardHeader className="p-2 pb-0">
							<CardTitle className="text-xs font-medium text-muted-foreground">24h Low</CardTitle>
						</CardHeader>
						<CardContent className="p-2 pt-0">
							<div className="text-base font-bold text-red-500">{formatPrice(stats.low24h)}</div>
						</CardContent>
					</Card>

					<Card className="bg-background/50 border-border">
						<CardHeader className="p-2 pb-0">
							<CardTitle className="text-xs font-medium text-muted-foreground">
								24h Volume
							</CardTitle>
						</CardHeader>
						<CardContent className="p-2 pt-0">
							<div className="text-base font-bold">{formatVolume(stats.volume24h)}</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

export default BottomStats;
