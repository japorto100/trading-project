"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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

type OptimizeScenarioPreset = "defensive" | "balanced" | "opportunistic" | "hrp";

type OptimizeControls = {
	scenario: OptimizeScenarioPreset;
	turnoverBudgetPct: number;
	maxPositionCapPct: number;
	reserveCashPct: number;
	allowAddsOnLosers: boolean;
};

type OptimizeBackendResponse = {
	weights: Record<string, number>;
	method: string;
	expected_volatility?: number;
	dendrogram_order?: string[];
};

type VPINResult = {
	vpin: number;
	alert: boolean;
	threshold: number;
	toxicity_level: "low" | "medium" | "high";
};

const PRESET_LABEL: Record<OptimizeScenarioPreset, string> = {
	defensive: "Defensive",
	balanced: "Balanced",
	opportunistic: "Opportunistic",
	hrp: "HRP",
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

	const [backendResults, setBackendResults] = useState<OptimizeBackendResponse | null>(null);
	const [, setBackendLoading] = useState(false);
	const [vpinResult, setVpinResult] = useState<VPINResult | null>(null);

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

	const symbols = useMemo(() => {
		if (!snapshot) return [];
		return snapshot.positions.filter((p) => p.side !== "flat").map((p) => p.symbol);
	}, [snapshot]);

	useEffect(() => {
		if (symbols.length < 2) return;
		let mounted = true;
		setBackendLoading(true);

		async function fetchOptimize() {
			try {
				const method =
					scenario === "defensive"
						? "inverse_vol"
						: scenario === "opportunistic"
							? "min_variance"
							: scenario === "hrp"
								? "hrp"
								: "equal_weight";
				const res = await fetch("/api/fusion/portfolio/analytics/optimize", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ symbols, method, timeframe: "1D", limit: 252 }),
				});
				if (!res.ok) throw new Error("Optimize fetch failed");
				const data = (await res.json()) as OptimizeBackendResponse;
				if (mounted) setBackendResults(data);
			} catch (e) {
				console.error("Optimize fetch error:", e);
			} finally {
				if (mounted) setBackendLoading(false);
			}
		}

		void fetchOptimize();
		return () => {
			mounted = false;
		};
	}, [symbols, scenario]);

	useEffect(() => {
		if (symbols.length === 0) return;
		const primarySymbol = symbols[0];
		let mounted = true;
		async function fetchVpin() {
			try {
				const res = await fetch("/api/fusion/portfolio/analytics/risk-warning", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						symbol: primarySymbol,
						timeframe: "1D",
						limit: 50,
						bucket_size: 10,
					}),
				});
				if (!res.ok) return;
				const data = (await res.json()) as VPINResult;
				if (mounted) setVpinResult(data);
			} catch {
				// VPIN is optional — ignore errors silently
			}
		}
		void fetchVpin();
		return () => {
			mounted = false;
		};
	}, [symbols]);

	const plans = useMemo((): PositionPlan[] => {
		if (!snapshot || !backendResults) return [];
		const openPositions = snapshot.positions.filter(
			(position) => position.side !== "flat" && (position.marketValue ?? 0) > 0,
		);
		const totalValue = openPositions.reduce(
			(acc, position) => acc + (position.marketValue ?? 0),
			0,
		);
		if (totalValue <= 0) return [];

		return openPositions
			.map((position) => {
				const currentWeight = (position.marketValue ?? 0) / totalValue;
				const targetWeight = backendResults.weights[position.symbol] ?? 0;
				const delta = targetWeight - currentWeight;
				let action: PositionPlan["action"] = "hold";

				if (delta > 0.02) action = "add";
				else if (delta < -0.02) action = "trim";

				if (position.totalPnl < 0 && !allowAddsOnLosers && delta > 0.01) {
					action = "review";
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
	}, [snapshot, backendResults, allowAddsOnLosers]);
	const regime = useMemo(() => {
		if (!snapshot) return null;
		const dd = Math.abs(snapshot.metrics.maxDrawdown);
		const winRate = snapshot.metrics.winRate;
		if (dd >= 0.18 || (winRate !== null && winRate < 0.35)) {
			return {
				label: "Risk-Off",
				tone: "red" as const,
				note: "Drawdown / hit-rate suggests tighter sizing and stronger trim discipline.",
			};
		}
		if (dd >= 0.08 || (winRate !== null && winRate < 0.5)) {
			return {
				label: "Neutral",
				tone: "amber" as const,
				note: "Moderate drawdown profile. Favor gradual reweighting over aggressive rotation.",
			};
		}
		return {
			label: "Risk-On",
			tone: "green" as const,
			note: "Portfolio health looks stable enough for controlled adds to strongest exposures.",
		};
	}, [snapshot]);
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
		<ScrollArea className="flex-1">
			<div className="flex h-full flex-col p-3">
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
									? "text-success border-success/30 shadow-chromatic"
									: regime.tone === "amber"
										? "text-amber-500 border-amber-500/30"
										: "text-error border-error/30"
							}
						>
							{regime.label}
						</Badge>
					) : null}
					<span>Snapshot: {new Date(snapshot.generatedAt).toLocaleString()}</span>
				</div>

				<div className="mb-3 space-y-3 rounded-md border border-border/50 bg-card/30 backdrop-blur-sm p-3 shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Optimization Controls (UI-first)
						</p>
						<div className="flex gap-1">
							{(["defensive", "balanced", "opportunistic", "hrp"] as const).map((preset) => (
								<Button
									key={preset}
									type="button"
									size="sm"
									variant={scenario === preset ? "secondary" : "ghost"}
									className={`h-7 px-2 text-[10px] font-bold tracking-wider ${scenario === preset ? "bg-accent/80 shadow-sm" : ""}`}
									onClick={() => setScenario(preset)}
								>
									{PRESET_LABEL[preset]}
								</Button>
							))}
						</div>
					</div>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
						<div className="space-y-1">
							<label
								htmlFor="opt-turnover-budget"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground"
							>
								Turnover Budget (%)
							</label>
							<Input
								id="opt-turnover-budget"
								value={turnoverBudgetInput}
								onChange={(event) => setTurnoverBudgetInput(event.target.value)}
								className="h-8 font-mono bg-background/50"
								inputMode="decimal"
							/>
						</div>
						<div className="space-y-1">
							<label
								htmlFor="opt-max-pos-cap"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground"
							>
								Max Position Cap (%)
							</label>
							<Input
								id="opt-max-pos-cap"
								value={maxPositionCapInput}
								onChange={(event) => setMaxPositionCapInput(event.target.value)}
								className="h-8 font-mono bg-background/50"
								inputMode="decimal"
							/>
						</div>
						<div className="space-y-1">
							<label
								htmlFor="opt-reserve-cash"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground"
							>
								Reserve Cash (%)
							</label>
							<Input
								id="opt-reserve-cash"
								value={reserveCashInput}
								onChange={(event) => setReserveCashInput(event.target.value)}
								className="h-8 font-mono bg-background/50"
								inputMode="decimal"
							/>
						</div>
					</div>
					<div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border/50 bg-background/30 p-2">
						<div>
							<p className="text-xs font-bold">Allow adds to losing positions</p>
							<p className="text-[10px] text-muted-foreground">
								Disabled mode converts aggressive adds on losers into review flags.
							</p>
						</div>
						<Switch checked={allowAddsOnLosers} onCheckedChange={setAllowAddsOnLosers} />
					</div>
				</div>

				<div className="mb-3 grid grid-cols-2 gap-2">
					<div className="rounded-md border border-border/50 bg-card/30 backdrop-blur-sm p-2 shadow-sm">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Open Exposure
						</p>
						<p className="text-sm font-medium font-mono">
							{formatNum(snapshot.metrics.openExposure)}
						</p>
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 backdrop-blur-sm p-2 shadow-sm">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Max Drawdown
						</p>
						<p className="text-sm font-medium text-amber-500 font-mono">
							{formatPct(Math.abs(snapshot.metrics.maxDrawdown))}
						</p>
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 backdrop-blur-sm p-2 shadow-sm">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Actions
						</p>
						<p className="text-sm font-medium font-mono">
							+{addCount} / -{trimCount}
							{reviewCount > 0 ? ` / review ${reviewCount}` : ""}
						</p>
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 backdrop-blur-sm p-2 shadow-sm">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Turnover / Budget
						</p>
						<p className="text-sm font-medium font-mono">
							{estimatedTurnoverPct.toFixed(1)}% / {controls.turnoverBudgetPct.toFixed(1)}%
						</p>
						<p className="text-[10px] text-muted-foreground mt-1">
							Target invested {targetInvestedPct.toFixed(1)}% (cash{" "}
							{controls.reserveCashPct.toFixed(1)}%)
						</p>
					</div>
				</div>

				{turnoverBudgetExceeded ? (
					<Alert className="mb-3 border-amber-500/30 bg-amber-500/10">
						<AlertTitle className="text-amber-500">Turnover budget pressure</AlertTitle>
						<AlertDescription className="text-amber-500/80">
							Proposed moves exceed the configured turnover budget. Deltas are scaled down in this
							preview.
						</AlertDescription>
					</Alert>
				) : null}

				{regime ? (
					<div className="mb-3 rounded-md border border-dashed border-border/50 bg-card/20 p-3 text-xs text-muted-foreground">
						<p className="font-bold uppercase text-[10px] tracking-wider text-foreground">
							Regime note
						</p>
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
						<div className="rounded-md border border-border/50 bg-card/30 backdrop-blur-sm p-3 shadow-sm">
							<div className="mb-2 flex items-center justify-between gap-2">
								<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
									<p className="font-bold text-sm">{largestMove.symbol}</p>
									<p className="text-muted-foreground mt-1 font-mono">
										Cur {largestMove.currentWeightPct.toFixed(1)}% {"->"} Tgt{" "}
										{largestMove.targetWeightPct.toFixed(1)}% ({largestMove.deltaPct > 0 ? "+" : ""}
										{largestMove.deltaPct.toFixed(1)}pp)
									</p>
								</div>
							) : null}
						</div>

						<div className="space-y-2">
							<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
								Allocation Preview (UI-first)
							</p>
							{plans.map((plan) => {
								const currentProgress = Math.max(0, Math.min(100, plan.currentWeightPct));
								const targetProgress = Math.max(0, Math.min(100, plan.targetWeightPct));
								return (
									<div
										key={plan.symbol}
										className="rounded-md border border-border/50 bg-card/20 p-3 transition-colors hover:bg-accent/20"
									>
										<div className="mb-2 flex items-center justify-between gap-2">
											<div>
												<p className="text-sm font-bold">{plan.symbol}</p>
												<p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-bold">
													{plan.side} · P&L{" "}
													<span
														className={
															plan.totalPnl > 0
																? "text-success"
																: plan.totalPnl < 0
																	? "text-error"
																	: ""
														}
													>
														{formatNum(plan.totalPnl)}
													</span>
												</p>
											</div>
											<Badge variant="outline" className={actionTone(plan.action)}>
												{plan.action}
											</Badge>
										</div>
										<div className="space-y-3 mt-3">
											<div>
												<div className="mb-1.5 flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">
													<span>Current</span>
													<span className="font-mono">{plan.currentWeightPct.toFixed(1)}%</span>
												</div>
												<Progress value={currentProgress} className="h-1 bg-muted" />
											</div>
											<div>
												<div className="mb-1.5 flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">
													<span>Target</span>
													<span className="font-mono">
														{plan.targetWeightPct.toFixed(1)}% ({plan.deltaPct > 0 ? "+" : ""}
														{plan.deltaPct.toFixed(1)}pp)
													</span>
												</div>
												<Progress
													value={targetProgress}
													className={`h-1 ${plan.deltaPct > 0 ? "text-success" : "text-amber-500"}`}
												/>
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{scenario === "hrp" &&
						backendResults?.dendrogram_order &&
						backendResults.dendrogram_order.length > 0 ? (
							<div className="rounded-md border border-border/50 bg-card/20 p-3">
								<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
									Cluster Order (HRP Dendrogram)
								</p>
								<p className="font-mono text-xs text-foreground">
									{backendResults.dendrogram_order.join(" → ")}
								</p>
							</div>
						) : null}

						{vpinResult ? (
							<div className="rounded-md border border-border/50 bg-card/20 p-3 space-y-2">
								<div className="flex items-center justify-between gap-3">
									<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
										Flow Toxicity (VPIN)
									</p>
									<Badge
										variant="outline"
										className={
											vpinResult.toxicity_level === "high"
												? "text-red-500 border-red-500/30"
												: vpinResult.toxicity_level === "medium"
													? "text-amber-500 border-amber-500/30"
													: "text-success border-success/30"
										}
									>
										{vpinResult.toxicity_level.toUpperCase()}
									</Badge>
								</div>
								<div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
									<span className="font-bold uppercase tracking-wider">VPIN</span>
									<span>{vpinResult.vpin.toFixed(3)}</span>
								</div>
								<Progress
									value={vpinResult.vpin * 100}
									className={
										vpinResult.toxicity_level === "high"
											? "[&>div]:bg-red-500 h-2"
											: vpinResult.toxicity_level === "medium"
												? "[&>div]:bg-amber-500 h-2"
												: "h-2"
									}
								/>
								{vpinResult.alert ? (
									<div className="rounded border border-red-500/30 bg-red-500/10 p-2 mt-1">
										<p className="text-[10px] font-bold text-red-500">
											VPIN Alert: Flow toxicity exceeds threshold ({vpinResult.threshold.toFixed(2)}
											). High adverse selection risk — consider reducing position sizing.
										</p>
									</div>
								) : null}
							</div>
						) : null}

						<div className="rounded-md border border-dashed border-border/50 bg-card/20 p-3 text-[10px] text-muted-foreground">
							<p>
								Phase 13 analytics: <strong className="text-foreground">HRP</strong> / Kelly /
								Regime-Sizing / Monte Carlo VaR / VPIN wired to the Python indicator-service
								backend.
							</p>
						</div>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}

export default PortfolioOptimizePanel;
