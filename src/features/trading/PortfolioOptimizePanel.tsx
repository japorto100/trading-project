"use client";

import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

type PortfolioOptimizePosition = {
	symbol: string;
	side: "long" | "short" | "flat";
	marketValue?: number;
	totalPnl: number;
};

type PortfolioOptimizeSnapshotInput = {
	generatedAt: string;
	positions: PortfolioOptimizePosition[];
	metrics: {
		openExposure: number;
		maxDrawdown: number;
		totalPnl: number;
		unrealizedPnl: number;
		winRate: number | null;
		initialBalance: number;
	};
};

type PositionPlan = {
	symbol: string;
	side: "long" | "short" | "flat";
	currentWeightPct: number;
	targetWeightPct: number;
	deltaPct: number;
	action: "add" | "trim" | "hold" | "review";
	totalPnl: number;
};

type OptimizeScenarioPreset = "defensive" | "balanced" | "opportunistic";

type OptimizeControls = {
	scenario: OptimizeScenarioPreset;
	turnoverBudgetPct: number;
	maxPositionCapPct: number;
	reserveCashPct: number;
	allowAddsOnLosers: boolean;
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

function clamp(value: number, lower: number, upper: number): number {
	return Math.min(upper, Math.max(lower, value));
}

function actionTone(action: PositionPlan["action"]): string {
	switch (action) {
		case "add":
			return "text-emerald-600";
		case "trim":
			return "text-amber-600";
		case "review":
			return "text-red-600";
		default:
			return "text-muted-foreground";
	}
}

function normalizeWeights(weights: number[]): number[] {
	const total = weights.reduce((acc, value) => acc + value, 0);
	if (total <= 0) {
		return weights.map(() => 0);
	}
	return weights.map((weight) => weight / total);
}

function deriveRiskRegime(snapshot: PortfolioOptimizeSnapshotInput): {
	label: string;
	tone: "green" | "amber" | "red";
	note: string;
} {
	const dd = Math.abs(snapshot.metrics.maxDrawdown);
	const winRate = snapshot.metrics.winRate;
	if (dd >= 0.18 || (winRate !== null && winRate < 0.35)) {
		return {
			label: "Risk-Off",
			tone: "red",
			note: "Drawdown / hit-rate suggests tighter sizing and stronger trim discipline.",
		};
	}
	if (dd >= 0.08 || (winRate !== null && winRate < 0.5)) {
		return {
			label: "Neutral",
			tone: "amber",
			note: "Moderate drawdown profile. Favor gradual reweighting over aggressive rotation.",
		};
	}
	return {
		label: "Risk-On",
		tone: "green",
		note: "Portfolio health looks stable enough for controlled adds to strongest exposures.",
	};
}

function derivePositionPlans(
	snapshot: PortfolioOptimizeSnapshotInput,
	controls: OptimizeControls,
): PositionPlan[] {
	const openPositions = snapshot.positions.filter(
		(position) => position.side !== "flat" && (position.marketValue ?? 0) > 0,
	);
	if (openPositions.length === 0) {
		return [];
	}

	const totalValue = openPositions.reduce((acc, position) => acc + (position.marketValue ?? 0), 0);
	if (totalValue <= 0) {
		return [];
	}

	const equalWeight = 1 / openPositions.length;
	const drawdownPenalty = Math.min(0.35, Math.abs(snapshot.metrics.maxDrawdown));
	const winRate = snapshot.metrics.winRate ?? 0.5;
	const scenarioTilt =
		controls.scenario === "defensive" ? 0.5 : controls.scenario === "opportunistic" ? 1.35 : 1;
	const performanceTiltStrength = (winRate >= 0.5 ? 0.12 : 0.06) * scenarioTilt;
	const baseBlend =
		controls.scenario === "defensive" ? 0.65 : controls.scenario === "opportunistic" ? 0.35 : 0.45;
	const reserveCashShare = clamp(controls.reserveCashPct / 100, 0, 0.4);
	const investableShare = 1 - reserveCashShare;
	const maxPositionCapShare = clamp(controls.maxPositionCapPct / 100, 0.05, 0.8);

	const rawTargets = openPositions.map((position) => {
		const currentWeight = (position.marketValue ?? 0) / totalValue;
		const pnlTilt = position.totalPnl >= 0 ? performanceTiltStrength : -performanceTiltStrength;
		const addLoserPenalty =
			!controls.allowAddsOnLosers && position.totalPnl < 0 ? 0.06 * equalWeight : 0;
		const blended =
			currentWeight * (1 - baseBlend - drawdownPenalty) +
			equalWeight * (baseBlend + drawdownPenalty) +
			pnlTilt * equalWeight -
			addLoserPenalty;
		return Math.max(0.01, blended);
	});

	let normalizedTargets = normalizeWeights(rawTargets).map((weight) => weight * investableShare);
	normalizedTargets = normalizedTargets.map((weight) => Math.min(weight, maxPositionCapShare));
	const postCapTotal = normalizedTargets.reduce((acc, weight) => acc + weight, 0);
	if (postCapTotal > 0) {
		const scale = investableShare / postCapTotal;
		normalizedTargets = normalizedTargets.map((weight) =>
			Math.min(weight * scale, maxPositionCapShare),
		);
	}

	const provisionalPlans = openPositions
		.map((position, index) => {
			const currentWeight = (position.marketValue ?? 0) / totalValue;
			const targetWeight = normalizedTargets[index] ?? 0;
			const delta = targetWeight - currentWeight;
			let action: PositionPlan["action"] = "hold";
			if (position.totalPnl < 0 && Math.abs(snapshot.metrics.maxDrawdown) > 0.12 && delta > 0.01) {
				action = "review";
			} else if (delta > 0.02) {
				action = "add";
			} else if (delta < -0.02) {
				action = "trim";
			}
			return {
				symbol: position.symbol,
				side: position.side,
				currentWeightPct: currentWeight * 100,
				targetWeightPct: targetWeight * 100,
				deltaPct: delta * 100,
				action,
				totalPnl: position.totalPnl,
			};
		})
		.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));

	const estimatedTurnoverPct =
		provisionalPlans.reduce((sum, plan) => sum + Math.abs(plan.deltaPct), 0) / 2;
	const turnoverScale =
		estimatedTurnoverPct > controls.turnoverBudgetPct && estimatedTurnoverPct > 0
			? controls.turnoverBudgetPct / estimatedTurnoverPct
			: 1;

	return provisionalPlans
		.map((plan) => {
			if (turnoverScale >= 0.999) {
				return plan;
			}
			const scaledDeltaPct = plan.deltaPct * turnoverScale;
			const scaledTargetWeightPct = clamp(plan.currentWeightPct + scaledDeltaPct, 0, 100);
			let action: PositionPlan["action"] = "hold";
			if (plan.totalPnl < 0 && !controls.allowAddsOnLosers && scaledDeltaPct > 0.75) {
				action = "review";
			} else if (scaledDeltaPct > 1) {
				action = "add";
			} else if (scaledDeltaPct < -1) {
				action = "trim";
			}
			return {
				...plan,
				targetWeightPct: scaledTargetWeightPct,
				deltaPct: scaledDeltaPct,
				action,
			};
		})
		.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
}

export function PortfolioOptimizePanel({
	snapshot,
	loading,
}: {
	snapshot: PortfolioOptimizeSnapshotInput | null;
	loading: boolean;
}) {
	const [scenario, setScenario] = useState<OptimizeScenarioPreset>("balanced");
	const [turnoverBudgetInput, setTurnoverBudgetInput] = useState("12");
	const [maxPositionCapInput, setMaxPositionCapInput] = useState("30");
	const [reserveCashInput, setReserveCashInput] = useState("5");
	const [allowAddsOnLosers, setAllowAddsOnLosers] = useState(false);

	const controls = useMemo<OptimizeControls>(
		() => ({
			scenario,
			turnoverBudgetPct: clamp(Number(turnoverBudgetInput) || 12, 1, 100),
			maxPositionCapPct: clamp(Number(maxPositionCapInput) || 30, 5, 100),
			reserveCashPct: clamp(Number(reserveCashInput) || 5, 0, 40),
			allowAddsOnLosers,
		}),
		[allowAddsOnLosers, maxPositionCapInput, reserveCashInput, scenario, turnoverBudgetInput],
	);

	const plans = useMemo(
		() => (snapshot ? derivePositionPlans(snapshot, controls) : []),
		[controls, snapshot],
	);
	const regime = useMemo(() => (snapshot ? deriveRiskRegime(snapshot) : null), [snapshot]);
	const largestMove = plans[0] ?? null;
	const addCount = plans.filter((plan) => plan.action === "add").length;
	const trimCount = plans.filter((plan) => plan.action === "trim").length;
	const reviewCount = plans.filter((plan) => plan.action === "review").length;
	const estimatedTurnoverPct = useMemo(
		() => plans.reduce((sum, plan) => sum + Math.abs(plan.deltaPct), 0) / 2,
		[plans],
	);
	const targetInvestedPct = useMemo(
		() => plans.reduce((sum, plan) => sum + plan.targetWeightPct, 0),
		[plans],
	);
	const turnoverBudgetExceeded = estimatedTurnoverPct > controls.turnoverBudgetPct + 0.01;

	if (!snapshot) {
		return (
			<div className="p-3">
				<Alert>
					<AlertTitle>Optimize needs portfolio snapshot data</AlertTitle>
					<AlertDescription>
						<p>Load the Paper tab first to generate a portfolio snapshot baseline.</p>
						<p>
							This UI-first panel previews allocation decisions before Phase 13 analytics endpoints.
						</p>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col overflow-y-auto p-3">
			<div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
				<Badge variant="outline">{loading ? "Refreshing source" : "Heuristic Plan"}</Badge>
				<Badge variant="outline" className="capitalize">
					Scenario: {controls.scenario}
				</Badge>
				{regime ? (
					<Badge
						variant="outline"
						className={
							regime.tone === "green"
								? "text-emerald-600"
								: regime.tone === "amber"
									? "text-amber-600"
									: "text-red-600"
						}
					>
						{regime.label}
					</Badge>
				) : null}
				<span>Snapshot: {new Date(snapshot.generatedAt).toLocaleString()}</span>
			</div>

			<div className="mb-3 space-y-3 rounded-md border border-border p-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<p className="text-xs font-semibold uppercase text-muted-foreground">
						Optimization Controls (UI-first)
					</p>
					<div className="flex gap-1">
						{(["defensive", "balanced", "opportunistic"] as const).map((preset) => (
							<Button
								key={preset}
								type="button"
								size="sm"
								variant={scenario === preset ? "secondary" : "outline"}
								className="h-7 px-2 text-[11px] capitalize"
								onClick={() => setScenario(preset)}
							>
								{preset}
							</Button>
						))}
					</div>
				</div>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
					<div className="space-y-1">
						<label htmlFor="opt-turnover-budget" className="text-[11px] text-muted-foreground">
							Turnover Budget (%)
						</label>
						<Input
							id="opt-turnover-budget"
							value={turnoverBudgetInput}
							onChange={(event) => setTurnoverBudgetInput(event.target.value)}
							className="h-8"
							inputMode="decimal"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="opt-max-pos-cap" className="text-[11px] text-muted-foreground">
							Max Position Cap (%)
						</label>
						<Input
							id="opt-max-pos-cap"
							value={maxPositionCapInput}
							onChange={(event) => setMaxPositionCapInput(event.target.value)}
							className="h-8"
							inputMode="decimal"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="opt-reserve-cash" className="text-[11px] text-muted-foreground">
							Reserve Cash (%)
						</label>
						<Input
							id="opt-reserve-cash"
							value={reserveCashInput}
							onChange={(event) => setReserveCashInput(event.target.value)}
							className="h-8"
							inputMode="decimal"
						/>
					</div>
				</div>
				<div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border p-2">
					<div>
						<p className="text-xs font-medium">Allow adds to losing positions</p>
						<p className="text-[11px] text-muted-foreground">
							Disabled mode converts aggressive adds on losers into review flags.
						</p>
					</div>
					<Switch checked={allowAddsOnLosers} onCheckedChange={setAllowAddsOnLosers} />
				</div>
			</div>

			<div className="mb-3 grid grid-cols-2 gap-2">
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Open Exposure</p>
					<p className="text-sm font-medium">{formatNum(snapshot.metrics.openExposure)}</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Max Drawdown</p>
					<p className="text-sm font-medium text-amber-500">
						{formatPct(Math.abs(snapshot.metrics.maxDrawdown))}
					</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Actions</p>
					<p className="text-sm font-medium">
						+{addCount} / -{trimCount}
						{reviewCount > 0 ? ` / review ${reviewCount}` : ""}
					</p>
				</div>
				<div className="rounded-md border border-border p-2">
					<p className="text-xs text-muted-foreground">Turnover / Budget</p>
					<p className="text-sm font-medium">
						{estimatedTurnoverPct.toFixed(1)}% / {controls.turnoverBudgetPct.toFixed(1)}%
					</p>
					<p className="text-[11px] text-muted-foreground">
						Target invested {targetInvestedPct.toFixed(1)}% (cash reserve{" "}
						{controls.reserveCashPct.toFixed(1)}%)
					</p>
				</div>
			</div>

			{turnoverBudgetExceeded ? (
				<Alert className="mb-3">
					<AlertTitle>Turnover budget pressure</AlertTitle>
					<AlertDescription>
						Proposed moves exceed the configured turnover budget. Deltas are scaled down in this
						preview.
					</AlertDescription>
				</Alert>
			) : null}

			{regime ? (
				<div className="mb-3 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
					<p className="font-medium text-foreground">Regime note</p>
					<p className="mt-1">{regime.note}</p>
				</div>
			) : null}

			{plans.length === 0 ? (
				<Alert>
					<AlertTitle>No positions to optimize</AlertTitle>
					<AlertDescription>
						<p>Optimization preview requires open positions with market value.</p>
					</AlertDescription>
				</Alert>
			) : (
				<div className="space-y-3">
					<div className="rounded-md border border-border p-3">
						<div className="mb-2 flex items-center justify-between gap-2">
							<p className="text-xs font-semibold uppercase text-muted-foreground">
								Largest Rebalance Move
							</p>
							<Badge
								variant="outline"
								className={largestMove ? actionTone(largestMove.action) : ""}
							>
								{largestMove?.action ?? "n/a"}
							</Badge>
						</div>
						{largestMove ? (
							<div className="text-xs">
								<p className="font-medium text-sm">{largestMove.symbol}</p>
								<p className="text-muted-foreground mt-1">
									Current {largestMove.currentWeightPct.toFixed(1)}% {"->"} Target{" "}
									{largestMove.targetWeightPct.toFixed(1)}% ({largestMove.deltaPct > 0 ? "+" : ""}
									{largestMove.deltaPct.toFixed(1)}pp)
								</p>
							</div>
						) : null}
					</div>

					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase text-muted-foreground">
							Allocation Preview (UI-first)
						</p>
						{plans.map((plan) => {
							const currentProgress = Math.max(0, Math.min(100, plan.currentWeightPct));
							const targetProgress = Math.max(0, Math.min(100, plan.targetWeightPct));
							return (
								<div key={plan.symbol} className="rounded-md border border-border p-3">
									<div className="mb-2 flex items-center justify-between gap-2">
										<div>
											<p className="text-sm font-medium">{plan.symbol}</p>
											<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
												{plan.side} · P&L {formatNum(plan.totalPnl)}
											</p>
										</div>
										<Badge variant="outline" className={actionTone(plan.action)}>
											{plan.action}
										</Badge>
									</div>
									<div className="space-y-2">
										<div>
											<div className="mb-1 flex items-center justify-between text-xs">
												<span className="text-muted-foreground">Current weight</span>
												<span>{plan.currentWeightPct.toFixed(1)}%</span>
											</div>
											<Progress value={currentProgress} className="h-1.5" />
										</div>
										<div>
											<div className="mb-1 flex items-center justify-between text-xs">
												<span className="text-muted-foreground">Target weight (heuristic)</span>
												<span>
													{plan.targetWeightPct.toFixed(1)}% ({plan.deltaPct > 0 ? "+" : ""}
													{plan.deltaPct.toFixed(1)}pp)
												</span>
											</div>
											<Progress value={targetProgress} className="h-1.5" />
										</div>
									</div>
								</div>
							);
						})}
					</div>

					<div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
						<p>
							This panel is a{" "}
							<strong className="text-foreground">UI-first optimization preview</strong>. Phase 13
							replaces these heuristics with HRP / Kelly / regime-aware sizing results from the
							portfolio analytics backend.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

export default PortfolioOptimizePanel;
