"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { OHLCVData } from "@/lib/providers/types";

type StrategyMode = "momentum" | "mean_reversion";

interface StrategyTrade {
	entry: number;
	exit: number;
	quantity: number;
	side: "long" | "short";
	fee: number;
}

interface StrategyMetrics {
	net_return: number;
	hit_ratio: number;
	risk_reward_ratio: number;
	expectancy: number;
	profit_factor: number;
	sharpe: number;
	sortino: number;
	average_win: number;
	average_loss: number;
}

interface StrategyResponse {
	success?: boolean;
	data?: {
		metrics?: StrategyMetrics;
		tradeCount?: number;
	};
	error?: string;
}

interface StrategyLabPanelProps {
	candleData: OHLCVData[];
}

function asNumber(input: string, fallback: number): number {
	const parsed = Number(input);
	if (!Number.isFinite(parsed)) return fallback;
	return parsed;
}

function clampInt(value: number, lower: number, upper: number): number {
	return Math.min(upper, Math.max(lower, Math.trunc(value)));
}

function formatMetric(value: number, digits = 3): string {
	if (!Number.isFinite(value)) return "-";
	return value.toFixed(digits);
}

function formatPercent(value: number): string {
	if (!Number.isFinite(value)) return "-";
	return `${(value * 100).toFixed(2)}%`;
}

function generateTradesFromCandles(
	candles: OHLCVData[],
	mode: StrategyMode,
	lookback: number,
	holdBars: number,
	maxTrades: number,
	feeBps: number,
): StrategyTrade[] {
	if (candles.length < lookback + holdBars + 2) return [];

	const output: StrategyTrade[] = [];

	for (let i = lookback; i < candles.length - holdBars; i++) {
		const history = candles.slice(i - lookback, i);
		const average = history.reduce((sum, row) => sum + row.close, 0) / history.length;
		const entry = candles[i].close;
		const exit = candles[i + holdBars].close;
		if (!Number.isFinite(entry) || !Number.isFinite(exit) || entry <= 0 || exit <= 0) {
			continue;
		}

		let side: "long" | "short" | null = null;
		if (mode === "momentum") {
			side = entry >= average ? "long" : "short";
		} else {
			if (entry <= average * 0.997) {
				side = "long";
			} else if (entry >= average * 1.003) {
				side = "short";
			}
		}
		if (!side) continue;

		const fee = (entry + exit) * (feeBps / 10000);
		output.push({
			entry,
			exit,
			quantity: 1,
			side,
			fee,
		});

		if (output.length >= maxTrades) break;
	}

	return output;
}

export function StrategyLabPanel({ candleData }: StrategyLabPanelProps) {
	const [mode, setMode] = useState<StrategyMode>("momentum");
	const [lookbackBars, setLookbackBars] = useState("24");
	const [holdBars, setHoldBars] = useState("6");
	const [maxTradesInput, setMaxTradesInput] = useState("40");
	const [feeBpsInput, setFeeBpsInput] = useState("6");
	const [riskFreeRateInput, setRiskFreeRateInput] = useState("0.01");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [metrics, setMetrics] = useState<StrategyMetrics | null>(null);
	const [tradeCount, setTradeCount] = useState<number>(0);

	const lookback = clampInt(asNumber(lookbackBars, 24), 5, 200);
	const hold = clampInt(asNumber(holdBars, 6), 1, 80);
	const maxTrades = clampInt(asNumber(maxTradesInput, 40), 5, 300);
	const feeBps = Math.max(0, asNumber(feeBpsInput, 6));
	const riskFreeRate = asNumber(riskFreeRateInput, 0.01);

	const estimatedTrades = useMemo(
		() => generateTradesFromCandles(candleData, mode, lookback, hold, maxTrades, feeBps).length,
		[candleData, feeBps, hold, lookback, maxTrades, mode],
	);

	const runEvaluation = async () => {
		setLoading(true);
		setError(null);
		setMetrics(null);
		setTradeCount(0);

		const trades = generateTradesFromCandles(candleData, mode, lookback, hold, maxTrades, feeBps);
		if (trades.length === 0) {
			setError("Nicht genug Signale mit den aktuellen Parametern.");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/fusion/strategy/evaluate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					trades,
					riskFreeRate,
				}),
			});

			const payload = (await response.json()) as StrategyResponse;
			if (!response.ok || payload.success !== true || !payload.data?.metrics) {
				throw new Error(payload.error || `Evaluate failed (${response.status})`);
			}

			setMetrics(payload.data.metrics);
			setTradeCount(payload.data.tradeCount ?? trades.length);
		} catch (evaluationError) {
			setError(
				evaluationError instanceof Error
					? evaluationError.message
					: "Strategy evaluation fehlgeschlagen.",
			);
		} finally {
			setLoading(false);
		}
	};

	const [collapsed, setCollapsed] = useState(true);

	return (
		<div className="mx-3 mt-2 rounded-md border border-border bg-card/40 px-3 py-2">
			<button
				type="button"
				className="flex w-full items-center justify-between gap-2"
				onClick={() => setCollapsed((prev) => !prev)}
			>
				<span className="flex items-center gap-1.5 text-sm font-medium">
					{collapsed ? (
						<ChevronRight className="h-3.5 w-3.5" />
					) : (
						<ChevronDown className="h-3.5 w-3.5" />
					)}
					Strategy Lab (Baseline)
				</span>
				<Badge variant="outline">{loading ? "Running..." : `Sample ${estimatedTrades}`}</Badge>
			</button>

			{!collapsed && (
				<>
					<div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
						<div className="space-y-1">
							<p className="text-[11px] text-muted-foreground">Mode</p>
							<Select value={mode} onValueChange={(value) => setMode(value as StrategyMode)}>
								<SelectTrigger className="h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="momentum">Momentum</SelectItem>
									<SelectItem value="mean_reversion">Mean Reversion</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<p className="text-[11px] text-muted-foreground">Lookback Bars</p>
							<Input
								value={lookbackBars}
								onChange={(event) => setLookbackBars(event.target.value)}
								className="h-8"
								inputMode="numeric"
							/>
						</div>
						<div className="space-y-1">
							<p className="text-[11px] text-muted-foreground">Hold Bars</p>
							<Input
								value={holdBars}
								onChange={(event) => setHoldBars(event.target.value)}
								className="h-8"
								inputMode="numeric"
							/>
						</div>
						<div className="space-y-1">
							<p className="text-[11px] text-muted-foreground">Max Trades</p>
							<Input
								value={maxTradesInput}
								onChange={(event) => setMaxTradesInput(event.target.value)}
								className="h-8"
								inputMode="numeric"
							/>
						</div>
						<div className="space-y-1">
							<p className="text-[11px] text-muted-foreground">Fee (bps)</p>
							<Input
								value={feeBpsInput}
								onChange={(event) => setFeeBpsInput(event.target.value)}
								className="h-8"
								inputMode="decimal"
							/>
						</div>
						<div className="space-y-1">
							<p className="text-[11px] text-muted-foreground">Risk-Free Rate</p>
							<Input
								value={riskFreeRateInput}
								onChange={(event) => setRiskFreeRateInput(event.target.value)}
								className="h-8"
								inputMode="decimal"
							/>
						</div>
					</div>

					<div className="mt-3 flex items-center justify-between gap-2">
						<p className="text-xs text-muted-foreground">
							Trades werden aus sichtbaren Candles generiert und gegen den Python Evaluator
							gemessen.
						</p>
						<Button size="sm" onClick={runEvaluation} disabled={loading || candleData.length < 20}>
							Run Eval
						</Button>
					</div>

					{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}

					{metrics ? (
						<div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
							<div className="rounded-md border border-border p-2">
								<p className="text-[11px] text-muted-foreground">Trades</p>
								<p className="text-sm font-medium">{tradeCount}</p>
							</div>
							<div className="rounded-md border border-border p-2">
								<p className="text-[11px] text-muted-foreground">Net Return</p>
								<p className="text-sm font-medium">{formatMetric(metrics.net_return, 4)}</p>
							</div>
							<div className="rounded-md border border-border p-2">
								<p className="text-[11px] text-muted-foreground">Hit Ratio</p>
								<p className="text-sm font-medium">{formatPercent(metrics.hit_ratio)}</p>
							</div>
							<div className="rounded-md border border-border p-2">
								<p className="text-[11px] text-muted-foreground">R:R</p>
								<p className="text-sm font-medium">{formatMetric(metrics.risk_reward_ratio, 3)}</p>
							</div>
							<div className="rounded-md border border-border p-2">
								<p className="text-[11px] text-muted-foreground">Expectancy</p>
								<p className="text-sm font-medium">{formatMetric(metrics.expectancy, 4)}</p>
							</div>
							<div className="rounded-md border border-border p-2">
								<p className="text-[11px] text-muted-foreground">Profit Factor</p>
								<p className="text-sm font-medium">{formatMetric(metrics.profit_factor, 3)}</p>
							</div>
							<div className="rounded-md border border-border p-2">
								<p className="text-[11px] text-muted-foreground">Sharpe</p>
								<p className="text-sm font-medium">{formatMetric(metrics.sharpe, 3)}</p>
							</div>
							<div className="rounded-md border border-border p-2">
								<p className="text-[11px] text-muted-foreground">Sortino</p>
								<p className="text-sm font-medium">{formatMetric(metrics.sortino, 3)}</p>
							</div>
						</div>
					) : null}
					{/* end collapsed wrapper */}
				</>
			)}
		</div>
	);
}

export default StrategyLabPanel;
