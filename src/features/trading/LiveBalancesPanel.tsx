"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type LivePosition = {
	symbol: string;
	quantity?: number;
	marketValue?: number;
	unrealizedPnl?: number;
	exchange?: string;
	assetClass?: string;
};

type LiveSummaryMetric = {
	label: string;
	value: string;
};

type LivePortfolioData = {
	generatedAt: string | null;
	summaryMetrics: LiveSummaryMetric[];
	positions: LivePosition[];
	notes: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function asNumber(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asString(value: unknown): string | undefined {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

function formatNum(value: number, decimals = 2): string {
	return value.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

function formatRelativeTime(timestamp: string | null): string {
	if (!timestamp) return "unknown";
	const delta = Date.now() - new Date(timestamp).getTime();
	if (!Number.isFinite(delta) || delta < 0) return "just now";
	const sec = Math.floor(delta / 1000);
	if (sec < 60) return `${sec}s ago`;
	const min = Math.floor(sec / 60);
	if (min < 60) return `${min}m ago`;
	return `${Math.floor(min / 60)}h ago`;
}

function parseLivePortfolioPayload(payload: unknown): LivePortfolioData {
	if (!isRecord(payload)) {
		return {
			generatedAt: null,
			summaryMetrics: [],
			positions: [],
			notes: ["Unexpected response shape from live portfolio endpoint."],
		};
	}

	const container = isRecord(payload.live) ? payload.live : payload;
	const positionsRaw = Array.isArray(container.positions) ? container.positions : [];
	const positions: LivePosition[] = [];
	for (const item of positionsRaw) {
		if (!isRecord(item)) continue;
		const symbol =
			asString(item.symbol) ?? asString(item.code) ?? asString(item.coin) ?? asString(item.asset);
		if (!symbol) continue;
		positions.push({
			symbol,
			quantity: asNumber(item.quantity) ?? asNumber(item.balance) ?? asNumber(item.total),
			marketValue: asNumber(item.marketValue) ?? asNumber(item.valueUsd) ?? asNumber(item.value),
			unrealizedPnl: asNumber(item.unrealizedPnl) ?? asNumber(item.pnl),
			exchange: asString(item.exchange) ?? asString(item.venue),
			assetClass: asString(item.assetClass) ?? asString(item.asset_type),
		});
	}

	const summaryMetrics: LiveSummaryMetric[] = [];
	const summary = isRecord(container.summary) ? container.summary : null;
	if (summary) {
		const totalValue =
			asNumber(summary.totalValueUsd) ?? asNumber(summary.totalValue) ?? asNumber(summary.total);
		const onlineValue = asNumber(summary.onlineValueUsd) ?? asNumber(summary.online);
		const offlineValue = asNumber(summary.offlineValueUsd) ?? asNumber(summary.offline);
		const exchangeCount = asNumber(summary.exchangeCount) ?? asNumber(summary.exchanges);
		if (totalValue !== undefined)
			summaryMetrics.push({ label: "Total Value", value: formatNum(totalValue) });
		if (onlineValue !== undefined)
			summaryMetrics.push({ label: "Online", value: formatNum(onlineValue) });
		if (offlineValue !== undefined)
			summaryMetrics.push({ label: "Offline", value: formatNum(offlineValue) });
		if (exchangeCount !== undefined)
			summaryMetrics.push({ label: "Exchanges", value: `${exchangeCount}` });
	}

	if (summaryMetrics.length === 0 && positions.length > 0) {
		const total = positions.reduce((acc, item) => acc + (item.marketValue ?? 0), 0);
		if (total > 0) summaryMetrics.push({ label: "Position Value", value: formatNum(total) });
		summaryMetrics.push({ label: "Positions", value: `${positions.length}` });
	}

	const generatedAt =
		asString(container.generatedAt) ??
		asString(container.updatedAt) ??
		asString(container.timestamp) ??
		null;

	const notes: string[] = [];
	if (positions.length === 0) {
		notes.push("No live positions were returned by the GCT bridge.");
	}
	if (!summary && positions.length === 0) {
		notes.push(
			"This can be expected until the Go GCT portfolio bridge endpoints are implemented/enabled.",
		);
	}

	return { generatedAt, summaryMetrics, positions, notes };
}

function LiveBalancesLoadingState() {
	return (
		<div className="space-y-3">
			<div className="grid grid-cols-2 gap-2">
				<Skeleton className="h-14 w-full" />
				<Skeleton className="h-14 w-full" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-3 w-20" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		</div>
	);
}

export function LiveBalancesPanel() {
	const [data, setData] = useState<LivePortfolioData | null>(null);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

	const loadLiveBalances = useCallback(async (options?: { manual?: boolean }) => {
		const manual = options?.manual ?? false;
		if (manual) {
			setIsRefreshing(true);
		}
		const controller = new AbortController();
		const timeoutId = window.setTimeout(() => controller.abort(), 6000);
		try {
			const response = await fetch("/api/fusion/portfolio/live", {
				cache: "no-store",
				signal: controller.signal,
			});
			if (!response.ok) {
				if (response.status === 404 || response.status === 501) {
					throw new Error("Live portfolio bridge endpoint is not available yet.");
				}
				throw new Error(`Live portfolio fetch failed (${response.status})`);
			}
			const payload = (await response.json()) as unknown;
			setData(parseLivePortfolioPayload(payload));
			setError(null);
			setLastFetchedAt(new Date().toISOString());
		} catch (caught) {
			if (!(caught instanceof DOMException && caught.name === "AbortError")) {
				setError(caught instanceof Error ? caught.message : "Could not load live balances.");
			}
		} finally {
			window.clearTimeout(timeoutId);
			setIsInitialLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		void loadLiveBalances();
	}, [loadLiveBalances]);

	const statusLabel = isInitialLoading ? "Loading..." : isRefreshing ? "Refreshing..." : "Bridge";
	const liveData = useMemo(
		() => data ?? { generatedAt: null, summaryMetrics: [], positions: [], notes: [] },
		[data],
	);

	return (
		<div className="flex h-full flex-col overflow-hidden p-3">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<div className="text-muted-foreground flex items-center gap-2 text-xs">
					<Badge variant="outline">{statusLabel}</Badge>
					<span>Updated: {formatRelativeTime(lastFetchedAt)}</span>
					{liveData.generatedAt ? (
						<span>Snapshot: {formatRelativeTime(liveData.generatedAt)}</span>
					) : null}
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => void loadLiveBalances({ manual: true })}
					disabled={isRefreshing}
				>
					{isRefreshing ? "Refreshing..." : "Refresh"}
				</Button>
			</div>

			{error ? (
				<Alert className="mb-3">
					<AlertTitle>Live balances unavailable</AlertTitle>
					<AlertDescription>
						<p>{error}</p>
						<p>Phase 5a adds the Go/GCT bridge endpoint backing this panel.</p>
					</AlertDescription>
				</Alert>
			) : null}

			{isInitialLoading && data === null ? (
				<LiveBalancesLoadingState />
			) : (
				<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
					{liveData.summaryMetrics.length > 0 ? (
						<div className="grid grid-cols-2 gap-2">
							{liveData.summaryMetrics.map((metric) => (
								<div key={metric.label} className="rounded-md border border-border p-2">
									<p className="text-muted-foreground text-xs">{metric.label}</p>
									<p className="text-sm font-medium">{metric.value}</p>
								</div>
							))}
						</div>
					) : null}

					<div className="min-h-0 flex-1 overflow-y-auto space-y-2">
						<p className="text-muted-foreground text-xs font-semibold uppercase">Live Positions</p>
						{liveData.positions.length === 0 ? (
							<div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
								{liveData.notes[0] ?? "No live positions available."}
							</div>
						) : (
							liveData.positions.map((position) => (
								<div
									key={`${position.exchange ?? "na"}-${position.symbol}`}
									className="rounded-md border border-border p-3"
								>
									<div className="mb-2 flex items-center justify-between gap-2">
										<div>
											<p className="text-sm font-medium">{position.symbol}</p>
											<p className="text-muted-foreground text-[11px]">
												{position.exchange ?? "Unknown venue"}
												{position.assetClass ? ` · ${position.assetClass}` : ""}
											</p>
										</div>
										<Badge variant="outline">Live</Badge>
									</div>
									<div className="grid grid-cols-3 gap-2 text-xs">
										<div>
											<p className="text-muted-foreground">Qty</p>
											<p>
												{position.quantity === undefined ? "-" : formatNum(position.quantity, 4)}
											</p>
										</div>
										<div>
											<p className="text-muted-foreground">Value</p>
											<p>
												{position.marketValue === undefined ? "-" : formatNum(position.marketValue)}
											</p>
										</div>
										<div>
											<p className="text-muted-foreground">Unrealized</p>
											<p>
												{position.unrealizedPnl === undefined
													? "-"
													: formatNum(position.unrealizedPnl)}
											</p>
										</div>
									</div>
								</div>
							))
						)}
					</div>

					{liveData.notes.length > 1 ? (
						<div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
							{liveData.notes.slice(1).map((note) => (
								<p key={note}>{note}</p>
							))}
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}

export default LiveBalancesPanel;
