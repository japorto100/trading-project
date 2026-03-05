"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
	const [pulse, setPulse] = useState<"up" | "down" | null>(null);
	const prevPriceRef = useRef(stats.lastPrice);

	useEffect(() => {
		if (stats.lastPrice === 0) return;

		if (prevPriceRef.current !== 0 && stats.lastPrice !== prevPriceRef.current) {
			const direction = stats.lastPrice > prevPriceRef.current ? "up" : "down";
			setPulse(direction);
			const timer = setTimeout(() => setPulse(null), 1000);
			prevPriceRef.current = stats.lastPrice;
			return () => clearTimeout(timer);
		}
		prevPriceRef.current = stats.lastPrice;
	}, [stats.lastPrice]);

	if (stats.lastPrice === 0) {
		return null;
	}

	return (
		<div className="border-t border-border bg-card/30 transition-colors duration-500">
			<button
				type="button"
				className={`flex w-full items-center justify-between px-3 py-1 text-xs text-muted-foreground transition-colors duration-500 ${
					pulse === "up" ? "bg-success/20" : pulse === "down" ? "bg-error/20" : "hover:bg-accent/50"
				}`}
				onClick={() => setCollapsed((prev) => !prev)}
			>
				<span className="flex items-center gap-1.5 font-medium">
					{collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
					<span
						className={`transition-colors duration-300 ${
							pulse === "up" ? "text-success" : pulse === "down" ? "text-error" : ""
						}`}
					>
						{formatPrice(stats.lastPrice)}
					</span>
					<span className={stats.change >= 0 ? "text-success" : "text-error"}>
						{stats.change >= 0 ? "+" : ""}
						{stats.percent.toFixed(2)}%
					</span>
					<span className="text-muted-foreground/60">|</span>
					<span>Vol {formatVolume(stats.volume24h)}</span>
				</span>
				<span className="text-[10px]">{collapsed ? "Show details" : "Hide"}</span>
			</button>
			{!collapsed && (
				<div className="max-h-32 overflow-y-auto p-2 scrollbar-hide">
					<div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
						<Card
							className={`bg-background/50 border-border transition-all duration-500 ${
								pulse === "up"
									? "shadow-chromatic border-success/30"
									: pulse === "down"
										? "shadow-chromatic-error border-error/30"
										: ""
							}`}
						>
							<CardHeader className="p-2 pb-0">
								<CardTitle className="text-xs font-medium text-muted-foreground">Price</CardTitle>
							</CardHeader>
							<CardContent className="p-2 pt-0">
								<div
									className={`text-base font-bold transition-colors duration-300 ${
										pulse === "up" ? "text-success" : pulse === "down" ? "text-error" : ""
									}`}
								>
									{formatPrice(stats.lastPrice)}
								</div>
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
									className={`text-base font-bold ${stats.change >= 0 ? "text-success" : "text-error"}`}
								>
									{stats.change >= 0 ? "+" : ""}
									{stats.percent.toFixed(2)}%
								</div>
							</CardContent>
						</Card>

						<Card className="bg-background/50 border-border">
							<CardHeader className="p-2 pb-0">
								<CardTitle className="text-xs font-medium text-muted-foreground">
									24h High
								</CardTitle>
							</CardHeader>
							<CardContent className="p-2 pt-0">
								<div className="text-base font-bold text-success">{formatPrice(stats.high24h)}</div>
							</CardContent>
						</Card>

						<Card className="bg-background/50 border-border">
							<CardHeader className="p-2 pb-0">
								<CardTitle className="text-xs font-medium text-muted-foreground">24h Low</CardTitle>
							</CardHeader>
							<CardContent className="p-2 pt-0">
								<div className="text-base font-bold text-error">{formatPrice(stats.low24h)}</div>
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
				</div>
			)}
		</div>
	);
}

export default BottomStats;
