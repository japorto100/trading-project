"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { getClientProfileKey } from "@/lib/storage/profile-key";
import { LiveBalancesPanel } from "./LiveBalancesPanel";
import { PortfolioAnalyticsPanel } from "./PortfolioAnalyticsPanel";
import { PortfolioOptimizePanel } from "./PortfolioOptimizePanel";

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

type PortfolioTab = "paper" | "live" | "analytics" | "optimize";

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

function formatRelativeTime(timestamp: string | null): string {
	if (!timestamp) return "never";
	const millis = Date.now() - new Date(timestamp).getTime();
	if (!Number.isFinite(millis) || millis < 0) return "just now";
	const seconds = Math.floor(millis / 1000);
	if (seconds < 10) return "just now";
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	return `${hours}h ago`;
}

function MetricCard({
	label,
	value,
	valueClassName,
}: {
	label: string;
	value: string;
	valueClassName?: string;
}) {
	return (
		<div className="rounded-md border border-border p-2">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className={`text-sm font-medium ${valueClassName ?? ""}`.trim()}>{value}</p>
		</div>
	);
}

function PortfolioLoadingState() {
	const metricSkeletonKeys = [
		"equity",
		"total-pnl",
		"return",
		"unrealized",
		"max-dd",
		"open-positions",
		"win-rate",
		"open-exposure",
	];
	const positionSkeletonKeys = ["position-a", "position-b"];

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-2 gap-2">
				{metricSkeletonKeys.map((key) => (
					<div key={key} className="rounded-md border border-border p-2">
						<Skeleton className="mb-2 h-3 w-20" />
						<Skeleton className="h-4 w-24" />
					</div>
				))}
			</div>
			<div className="space-y-2">
				<Skeleton className="h-3 w-16" />
				{positionSkeletonKeys.map((key) => (
					<div key={key} className="rounded-md border border-border p-3">
						<Skeleton className="mb-3 h-4 w-28" />
						<div className="grid grid-cols-2 gap-2">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function PortfolioPanel() {
	const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastError, setLastError] = useState<string | null>(null);
	const [lastSuccessfulLoadAt, setLastSuccessfulLoadAt] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<PortfolioTab>("paper");
	const profileKey = useMemo(() => getClientProfileKey(), []);

	const loadPortfolio = useCallback(
		async (options?: { manual?: boolean }) => {
			const manual = options?.manual ?? false;
			if (manual) {
				setIsRefreshing(true);
			}

			const params = new URLSearchParams({ profileKey });
			const controller = new AbortController();
			const timeoutId = window.setTimeout(() => controller.abort(), 5000);
			try {
				const response = await fetch(`/api/fusion/portfolio?${params.toString()}`, {
					cache: "no-store",
					signal: controller.signal,
				});
				if (!response.ok) {
					throw new Error(`Portfolio fetch failed (${response.status})`);
				}
				const payload = (await response.json()) as { snapshot?: PortfolioSnapshot };
				setSnapshot(payload.snapshot ?? null);
				setLastError(null);
				setLastSuccessfulLoadAt(new Date().toISOString());
			} catch (error) {
				const isAbort = error instanceof DOMException && error.name === "AbortError";
				if (!isAbort) {
					const message =
						error instanceof Error ? error.message : "Could not load portfolio snapshot.";
					setLastError(message);
					if (manual) {
						toast({
							title: "Portfolio refresh failed",
							description: message,
						});
					}
				}
			} finally {
				window.clearTimeout(timeoutId);
				setIsInitialLoading(false);
				setIsRefreshing(false);
			}
		},
		[profileKey],
	);

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
	const sortedByPnl = useMemo(
		() => [...positions].sort((left, right) => right.totalPnl - left.totalPnl),
		[positions],
	);
	const topWinner = sortedByPnl[0] ?? null;
	const topLoser = sortedByPnl.at(-1) ?? null;
	const snapshotGeneratedAt = snapshot?.generatedAt ?? null;
	const staleSeconds = snapshotGeneratedAt
		? Math.max(0, Math.floor((Date.now() - new Date(snapshotGeneratedAt).getTime()) / 1000))
		: null;
	const isStale = staleSeconds !== null && staleSeconds > 45;

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<div className="space-y-3 border-b border-border p-3">
				<div className="flex items-start justify-between gap-2">
					<div>
						<p className="text-sm font-medium">Portfolio Tracker</p>
						<p className="text-muted-foreground mt-1 text-xs">
							Paper portfolio snapshot with UX groundwork for Live / Analytics / Optimize.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline">
							{isInitialLoading ? "Loading..." : isRefreshing ? "Refreshing..." : "Ready"}
						</Badge>
						{isStale ? (
							<Badge variant="outline" className="text-amber-600">
								Stale
							</Badge>
						) : null}
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-2 text-xs">
					<div className="text-muted-foreground flex flex-wrap items-center gap-3">
						<span>Updated: {formatRelativeTime(lastSuccessfulLoadAt)}</span>
						{snapshotGeneratedAt ? (
							<span>Snapshot: {formatRelativeTime(snapshotGeneratedAt)}</span>
						) : null}
						{metrics ? <span>Filled Orders: {metrics.filledOrders}</span> : null}
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => void loadPortfolio({ manual: true })}
						disabled={isRefreshing}
					>
						{isRefreshing ? "Refreshing..." : "Refresh"}
					</Button>
				</div>

				{lastError ? (
					<Alert>
						<AlertTitle>Snapshot update failed</AlertTitle>
						<AlertDescription>
							<p>{lastError}</p>
							<p>Existing portfolio data remains visible. Use Refresh to retry manually.</p>
						</AlertDescription>
					</Alert>
				) : null}
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as PortfolioTab)}
				className="flex min-h-0 flex-1"
			>
				<div className="border-b border-border px-3 pt-2">
					<TabsList className="w-full justify-start">
						<TabsTrigger value="paper">Paper</TabsTrigger>
						<TabsTrigger value="live">Live</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
						<TabsTrigger value="optimize">Optimize</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="paper" className="min-h-0 flex-1 overflow-y-auto p-3">
					{isInitialLoading && snapshot === null ? (
						<PortfolioLoadingState />
					) : !metrics ? (
						<div className="space-y-3">
							<Alert>
								<AlertTitle>No portfolio data yet</AlertTitle>
								<AlertDescription>
									<p>No filled paper orders were found for the active profile.</p>
									<p>Place a paper trade or trigger seed/test activity, then refresh this panel.</p>
								</AlertDescription>
							</Alert>
						</div>
					) : (
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-2">
								<MetricCard label="Equity" value={formatNum(latestEquity)} />
								<MetricCard
									label="Total P&L"
									value={formatNum(metrics.totalPnl)}
									valueClassName={pnlClass(metrics.totalPnl)}
								/>
								<MetricCard
									label="Return %"
									value={portfolioReturnPct === null ? "-" : formatPct(portfolioReturnPct)}
									valueClassName={
										portfolioReturnPct === null ? undefined : pnlClass(portfolioReturnPct)
									}
								/>
								<MetricCard
									label="Unrealized"
									value={formatNum(metrics.unrealizedPnl)}
									valueClassName={pnlClass(metrics.unrealizedPnl)}
								/>
								<MetricCard
									label="Max DD"
									value={formatPct(metrics.maxDrawdown)}
									valueClassName="text-amber-500"
								/>
								<MetricCard label="Open Positions" value={`${metrics.openPositions}`} />
								<MetricCard
									label="Win Rate"
									value={metrics.winRate === null ? "-" : formatPct(metrics.winRate)}
								/>
								<MetricCard label="Open Exposure" value={formatNum(metrics.openExposure)} />
								<MetricCard
									label="Top Winner"
									value={topWinner ? `${topWinner.symbol} (${formatNum(topWinner.totalPnl)})` : "-"}
									valueClassName={topWinner ? pnlClass(topWinner.totalPnl) : undefined}
								/>
								<MetricCard
									label="Top Loser"
									value={topLoser ? `${topLoser.symbol} (${formatNum(topLoser.totalPnl)})` : "-"}
									valueClassName={topLoser ? pnlClass(topLoser.totalPnl) : undefined}
								/>
							</div>

							<div className="space-y-2">
								<p className="text-muted-foreground text-xs font-semibold uppercase">Positions</p>
								{positions.length === 0 ? (
									<div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
										No filled orders yet.
									</div>
								) : (
									positions.map((position) => (
										<div
											key={position.symbol}
											className="space-y-2 rounded-md border border-border p-3"
										>
											<div className="flex items-center justify-between gap-2">
												<p className="text-sm font-medium">{position.symbol}</p>
												<Badge variant="outline" className="text-[10px] uppercase">
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
														{position.marketValue === undefined
															? "-"
															: formatNum(position.marketValue)}
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
													<p className={pnlClass(position.totalPnl)}>
														{formatNum(position.totalPnl)}
													</p>
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					)}
				</TabsContent>

				<TabsContent value="live" className="min-h-0 flex-1">
					<LiveBalancesPanel />
				</TabsContent>
				<TabsContent value="analytics" className="min-h-0 flex-1">
					<PortfolioAnalyticsPanel snapshot={snapshot} loading={isInitialLoading || isRefreshing} />
				</TabsContent>
				<TabsContent value="optimize" className="min-h-0 flex-1">
					<PortfolioOptimizePanel snapshot={snapshot} loading={isInitialLoading || isRefreshing} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default PortfolioPanel;
