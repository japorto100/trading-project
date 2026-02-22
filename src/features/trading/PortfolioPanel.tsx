"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getClientProfileKey } from "@/lib/storage/profile-key";

interface PortfolioPosition {
	symbol: string;
	quantity: number;
	side: "long" | "short" | "flat";
	averagePrice: number;
	currentPrice?: number;
	marketValue?: number;
	realizedPnl: number;
	unrealizedPnl: number;
	totalPnl: number;
}

interface PortfolioMetrics {
	initialBalance: number;
	filledOrders: number;
	openPositions: number;
	realizedPnl: number;
	unrealizedPnl: number;
	totalPnl: number;
	openExposure: number;
	winRate: number | null;
	maxDrawdown: number;
}

interface EquityPoint {
	time: string;
	equity: number;
	drawdown: number;
}

interface PortfolioSnapshot {
	generatedAt: string;
	positions: PortfolioPosition[];
	metrics: PortfolioMetrics;
	equityCurve: EquityPoint[];
}

function formatNum(value: number, decimals = 2): string {
	return value.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

function formatPct(value: number): string {
	return `${(value * 100).toFixed(2)}%`;
}

function pnlClass(value: number): string {
	if (value > 0) return "text-emerald-500";
	if (value < 0) return "text-red-500";
	return "text-muted-foreground";
}

export function PortfolioPanel() {
	const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
	const [loading, setLoading] = useState(false);
	const profileKey = useMemo(() => getClientProfileKey(), []);

	const loadPortfolio = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ profileKey });
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);
			const response = await fetch(`/api/fusion/portfolio?${params.toString()}`, {
				cache: "no-store",
				signal: controller.signal,
			});
			clearTimeout(timeoutId);
			if (!response.ok) {
				throw new Error(`Portfolio fetch failed (${response.status})`);
			}
			const payload = (await response.json()) as { snapshot?: PortfolioSnapshot };
			setSnapshot(payload.snapshot ?? null);
		} catch (error) {
			if (!(error instanceof DOMException && error.name === "AbortError")) {
				toast({
					title: "Portfolio unavailable",
					description:
						error instanceof Error ? error.message : "Could not load portfolio snapshot.",
				});
			}
		} finally {
			setLoading(false);
		}
	}, [profileKey]);

	useEffect(() => {
		void loadPortfolio();
	}, [loadPortfolio]);

	useEffect(() => {
		const timer = window.setInterval(() => {
			void loadPortfolio();
		}, 15000);
		return () => window.clearInterval(timer);
	}, [loadPortfolio]);

	const metrics = snapshot?.metrics;
	const positions = snapshot?.positions ?? [];
	const latestEquity = snapshot?.equityCurve.at(-1)?.equity ?? metrics?.initialBalance ?? 0;
	const portfolioReturnPct =
		metrics && metrics.initialBalance > 0 ? metrics.totalPnl / metrics.initialBalance : null;
	const topWinner = [...positions].sort((left, right) => right.totalPnl - left.totalPnl)[0] ?? null;
	const topLoser = [...positions].sort((left, right) => left.totalPnl - right.totalPnl)[0] ?? null;

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<div className="border-b border-border p-3 space-y-2">
				<div className="flex items-center justify-between gap-2">
					<p className="text-sm font-medium">Portfolio Tracker</p>
					<Badge variant="outline">{loading ? "Updating..." : "Live"}</Badge>
				</div>

				{metrics ? (
					<div className="grid grid-cols-2 gap-2 text-xs">
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Equity</p>
							<p className="font-medium">{formatNum(latestEquity)}</p>
						</div>
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Total P&L</p>
							<p className={`font-medium ${pnlClass(metrics.totalPnl)}`}>
								{formatNum(metrics.totalPnl)}
							</p>
						</div>
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Return %</p>
							<p
								className={`font-medium ${portfolioReturnPct === null ? "" : pnlClass(portfolioReturnPct)}`}
							>
								{portfolioReturnPct === null ? "-" : formatPct(portfolioReturnPct)}
							</p>
						</div>
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Unrealized</p>
							<p className={`font-medium ${pnlClass(metrics.unrealizedPnl)}`}>
								{formatNum(metrics.unrealizedPnl)}
							</p>
						</div>
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Max DD</p>
							<p className="font-medium text-amber-500">{formatPct(metrics.maxDrawdown)}</p>
						</div>
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Open Positions</p>
							<p className="font-medium">{metrics.openPositions}</p>
						</div>
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Win Rate</p>
							<p className="font-medium">
								{metrics.winRate === null ? "-" : formatPct(metrics.winRate)}
							</p>
						</div>
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Top Winner</p>
							<p className={`font-medium ${topWinner ? pnlClass(topWinner.totalPnl) : ""}`}>
								{topWinner ? `${topWinner.symbol} (${formatNum(topWinner.totalPnl)})` : "-"}
							</p>
						</div>
						<div className="rounded-md border border-border p-2">
							<p className="text-muted-foreground">Top Loser</p>
							<p className={`font-medium ${topLoser ? pnlClass(topLoser.totalPnl) : ""}`}>
								{topLoser ? `${topLoser.symbol} (${formatNum(topLoser.totalPnl)})` : "-"}
							</p>
						</div>
					</div>
				) : (
					<p className="text-xs text-muted-foreground">No portfolio data yet.</p>
				)}
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				<p className="text-xs font-semibold uppercase text-muted-foreground">Positions</p>
				{positions.length === 0 ? (
					<p className="text-xs text-muted-foreground">No filled orders yet.</p>
				) : (
					positions.map((position) => (
						<div key={position.symbol} className="rounded-md border border-border p-3 space-y-2">
							<div className="flex items-center justify-between gap-2">
								<p className="text-sm font-medium">{position.symbol}</p>
								<Badge variant="outline" className="uppercase text-[10px]">
									{position.side}
								</Badge>
							</div>
							<div className="grid grid-cols-2 gap-2 text-xs">
								<div>
									<p className="text-muted-foreground">Qty</p>
									<p>{formatNum(position.quantity, 4)}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Avg</p>
									<p>{formatNum(position.averagePrice, 4)}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Last</p>
									<p>
										{position.currentPrice === undefined
											? "-"
											: formatNum(position.currentPrice, 4)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Exposure</p>
									<p>
										{position.marketValue === undefined ? "-" : formatNum(position.marketValue)}
									</p>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-2 text-xs">
								<div>
									<p className="text-muted-foreground">Realized</p>
									<p className={pnlClass(position.realizedPnl)}>
										{formatNum(position.realizedPnl)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Unrealized</p>
									<p className={pnlClass(position.unrealizedPnl)}>
										{formatNum(position.unrealizedPnl)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Total</p>
									<p className={pnlClass(position.totalPnl)}>{formatNum(position.totalPnl)}</p>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default PortfolioPanel;
