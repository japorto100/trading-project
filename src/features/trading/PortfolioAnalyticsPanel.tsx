"use client";

import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type EquityPoint = {
	time: string;
	equity: number;
	drawdown: number;
};

type PortfolioSnapshotAnalyticsInput = {
	generatedAt: string;
	equityCurve: EquityPoint[];
	metrics: {
		maxDrawdown: number;
		totalPnl: number;
		unrealizedPnl: number;
		initialBalance: number;
		filledOrders: number;
	};
};

function formatNum(value: number, decimals = 2): string {
	return value.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

function formatPct(value: number): string {
	return `${(value * 100).toFixed(2)}%`;
}

function pointsToLinePath(values: number[], width: number, height: number): string {
	if (values.length === 0) return "";
	if (values.length === 1) {
		const y = height / 2;
		return `M 0 ${y} L ${width} ${y}`;
	}
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	return values
		.map((value, index) => {
			const x = (index / (values.length - 1)) * width;
			const y = height - ((value - min) / range) * height;
			return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(" ");
}

function pointsToAreaPath(values: number[], width: number, height: number): string {
	if (values.length === 0) return "";
	if (values.length === 1) {
		return `M 0 ${height} L 0 ${height / 2} L ${width} ${height / 2} L ${width} ${height} Z`;
	}
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const line = values
		.map((value, index) => {
			const x = (index / (values.length - 1)) * width;
			const y = height - ((value - min) / range) * height;
			return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(" ");
	return `${line} L ${width} ${height} L 0 ${height} Z`;
}

function sparklineGradientId(name: string): string {
	return `portfolio-analytics-${name}`;
}

function MiniChart({
	title,
	values,
	color,
	fillOpacity = 0,
	showArea = false,
	note,
}: {
	title: string;
	values: number[];
	color: string;
	fillOpacity?: number;
	showArea?: boolean;
	note?: string;
}) {
	const width = 320;
	const height = 84;
	const linePath = useMemo(() => pointsToLinePath(values, width, height), [values]);
	const areaPath = useMemo(() => pointsToAreaPath(values, width, height), [values]);
	const min = values.length > 0 ? Math.min(...values) : 0;
	const max = values.length > 0 ? Math.max(...values) : 0;
	const gradientId = sparklineGradientId(title.toLowerCase().replace(/\s+/g, "-"));

	return (
		<div className="rounded-md border border-border p-3">
			<div className="mb-2 flex items-center justify-between gap-2">
				<p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
				{note ? <Badge variant="outline">{note}</Badge> : null}
			</div>
			{values.length < 2 ? (
				<div className="text-xs text-muted-foreground">Need at least 2 points.</div>
			) : (
				<>
					<svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full overflow-visible">
						<defs>
							<linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
								<stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
								<stop offset="100%" stopColor={color} stopOpacity="0" />
							</linearGradient>
						</defs>
						<line
							x1="0"
							y1={height}
							x2={width}
							y2={height}
							className="stroke-border"
							strokeDasharray="4 4"
						/>
						{showArea ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
						<path d={linePath} fill="none" stroke={color} strokeWidth="2" />
					</svg>
					<div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
						<span>Min: {formatNum(min, 4)}</span>
						<span className="text-right">Max: {formatNum(max, 4)}</span>
					</div>
				</>
			)}
		</div>
	);
}

export function PortfolioAnalyticsPanel({
	snapshot,
	loading,
}: {
	snapshot: PortfolioSnapshotAnalyticsInput | null;
	loading: boolean;
}) {
	const points = snapshot?.equityCurve ?? [];
	const equityValues = useMemo(() => points.map((point) => point.equity), [points]);
	const drawdownValues = useMemo(() => points.map((point) => Math.abs(point.drawdown)), [points]);
	const latestEquity = points.at(-1)?.equity ?? null;
	const latestDrawdown = points.at(-1)?.drawdown ?? null;
	const totalPnl = snapshot?.metrics.totalPnl ?? null;
	const sampleCount = points.length;
	const stepReturns = useMemo(() => {
		if (points.length < 2) return [] as number[];
		const values: number[] = [];
		for (let index = 1; index < points.length; index += 1) {
			const previous = points[index - 1]?.equity ?? 0;
			const current = points[index]?.equity ?? 0;
			if (!Number.isFinite(previous) || previous === 0 || !Number.isFinite(current)) continue;
			values.push((current - previous) / previous);
		}
		return values;
	}, [points]);
	const avgStepReturn = useMemo(() => {
		if (stepReturns.length === 0) return null;
		return stepReturns.reduce((acc, value) => acc + value, 0) / stepReturns.length;
	}, [stepReturns]);
	const stepVolatility = useMemo(() => {
		if (stepReturns.length < 2) return null;
		const mean = stepReturns.reduce((acc, value) => acc + value, 0) / stepReturns.length;
		const variance =
			stepReturns.reduce((acc, value) => acc + (value - mean) ** 2, 0) / (stepReturns.length - 1);
		return Math.sqrt(Math.max(variance, 0));
	}, [stepReturns]);
	const positiveStepRate = useMemo(() => {
		if (stepReturns.length === 0) return null;
		const positives = stepReturns.filter((value) => value > 0).length;
		return positives / stepReturns.length;
	}, [stepReturns]);
	const worstDrawdownSeen = useMemo(() => {
		if (points.length === 0) return null;
		return Math.min(...points.map((point) => point.drawdown));
	}, [points]);

	if (!snapshot) {
		return (
			<div className="p-3">
				<Alert>
					<AlertTitle>Analytics needs portfolio snapshot data</AlertTitle>
					<AlertDescription>
						<p>Open the Paper tab first or refresh the portfolio snapshot.</p>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col overflow-y-auto p-3">
			<div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
				<Badge variant="outline">{loading ? "Refreshing source" : "Paper Snapshot"}</Badge>
				<span>Points: {sampleCount}</span>
				<span>Generated: {new Date(snapshot.generatedAt).toLocaleString()}</span>
			</div>

			<div className="mb-3 grid grid-cols-2 gap-2">
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Latest Equity</p>
					<p className="text-sm font-medium">
						{latestEquity === null ? "-" : formatNum(latestEquity)}
					</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Latest Drawdown</p>
					<p className="text-sm font-medium text-amber-500">
						{latestDrawdown === null ? "-" : formatPct(Math.abs(latestDrawdown))}
					</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Total P&L</p>
					<p
						className={`text-sm font-medium ${totalPnl !== null && totalPnl < 0 ? "text-red-500" : "text-emerald-500"}`}
					>
						{totalPnl === null ? "-" : formatNum(totalPnl)}
					</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Max DD (Snapshot)</p>
					<p className="text-sm font-medium">{formatPct(snapshot.metrics.maxDrawdown)}</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Avg Step Return</p>
					<p className="text-sm font-medium">
						{avgStepReturn === null ? "-" : formatPct(avgStepReturn)}
					</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Step Volatility</p>
					<p className="text-sm font-medium">
						{stepVolatility === null ? "-" : formatPct(stepVolatility)}
					</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Positive Steps</p>
					<p className="text-sm font-medium">
						{positiveStepRate === null ? "-" : formatPct(positiveStepRate)}
					</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Worst DD Seen</p>
					<p className="text-sm font-medium text-amber-500">
						{worstDrawdownSeen === null ? "-" : formatPct(Math.abs(worstDrawdownSeen))}
					</p>
				</div>
			</div>

			{sampleCount < 2 ? (
				<Alert>
					<AlertTitle>Not enough points for analytics charts</AlertTitle>
					<AlertDescription>
						<p>We need at least two equity-curve points to render trend previews.</p>
					</AlertDescription>
				</Alert>
			) : (
				<div className="space-y-3">
					<MiniChart
						title="Equity Curve Preview"
						values={equityValues}
						color="rgb(16 185 129)"
						showArea
						fillOpacity={0.22}
						note="Phase 5e"
					/>
					<MiniChart
						title="Drawdown Preview"
						values={drawdownValues}
						color="rgb(245 158 11)"
						showArea
						fillOpacity={0.16}
						note="Underwater"
					/>
					<div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
						This is a UI-first analytics slice using existing paper snapshot data. Phase 5b/5c
						upgrades this tab with dedicated correlation, rolling metrics and drawdown
						endpoints/charts.
					</div>
				</div>
			)}
		</div>
	);
}

export default PortfolioAnalyticsPanel;
