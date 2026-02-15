"use client";

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
	dataMode: "api" | "fallback";
	dataProvider: string;
	formatPrice: (value: number) => string;
	formatVolume: (value: number) => string;
}

export function BottomStats({
	stats,
	dataMode,
	dataProvider,
	formatPrice,
	formatVolume,
}: BottomStatsProps) {
	return (
		<div className="h-28 border-t border-border bg-card/30 p-2">
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-full">
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
						<CardTitle className="text-xs font-medium text-muted-foreground">24h Change</CardTitle>
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
						<div className="text-base font-bold text-emerald-500">{formatPrice(stats.high24h)}</div>
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
						<CardTitle className="text-xs font-medium text-muted-foreground">24h Volume</CardTitle>
					</CardHeader>
					<CardContent className="p-2 pt-0">
						<div className="text-base font-bold">{formatVolume(stats.volume24h)}</div>
					</CardContent>
				</Card>

				<Card className="bg-background/50 border-border">
					<CardHeader className="p-2 pb-0">
						<CardTitle className="text-xs font-medium text-muted-foreground">Data Source</CardTitle>
					</CardHeader>
					<CardContent className="p-2 pt-0">
						<div className="text-base font-bold capitalize">{dataProvider}</div>
						<div
							className={`text-[10px] ${dataMode === "api" ? "text-emerald-500" : "text-amber-500"}`}
						>
							{dataMode === "api" ? "API feed" : "Demo fallback"}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default BottomStats;
