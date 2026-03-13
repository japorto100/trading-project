"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

type MonteCarloVarResponse = {
	var_95: number;
	var_99: number;
	cvar_95: number;
	cvar_99: number;
	median_return: number;
	simulation_count: number;
};

function formatPct(v: number): string {
	return `${(v * 100).toFixed(3)}%`;
}

function varTone(v: number): string {
	const abs = Math.abs(v);
	if (abs > 0.05) return "text-red-500";
	if (abs > 0.02) return "text-amber-500";
	return "text-muted-foreground";
}

export function MonteCarloVarPanel({
	symbols,
	weights,
}: {
	symbols: string[];
	weights: Record<string, number>;
}) {
	const {
		data: result,
		isLoading: loading,
		error: queryError,
	} = useQuery<MonteCarloVarResponse>({
		queryKey: ["portfolio", "monte-carlo-var", symbols, weights],
		queryFn: async () => {
			const res = await fetch("/api/fusion/portfolio/analytics/monte-carlo-var", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					weights,
					symbols,
					timeframe: "1D",
					limit: 252,
					simulations: 10000,
					horizon_days: 10,
					confidence_levels: [0.95, 0.99],
				}),
			});
			if (!res.ok) throw new Error(`Backend error ${res.status}`);
			return res.json() as Promise<MonteCarloVarResponse>;
		},
		enabled: symbols.length > 0,
		staleTime: 60_000,
	});

	const error = queryError instanceof Error ? queryError.message : null;

	if (symbols.length === 0) {
		return (
			<div className="p-3">
				<Alert>
					<AlertTitle>No open positions</AlertTitle>
					<AlertDescription>Monte Carlo VaR needs at least one open position.</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="p-3 text-xs text-muted-foreground animate-pulse">
				Running Monte Carlo simulations…
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-3">
				<Alert>
					<AlertTitle>Monte Carlo VaR backend unavailable</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!result) return null;

	return (
		<ScrollArea className="flex-1">
			<div className="flex flex-col gap-3 p-3">
				<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					<Badge variant="outline">Monte Carlo VaR</Badge>
					<Badge variant="outline">10,000 sims</Badge>
					<Badge variant="outline">10-day horizon</Badge>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div className="rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							VaR 95%
						</p>
						<p className={`text-sm font-mono font-medium ${varTone(result.var_95)}`}>
							{formatPct(result.var_95)}
						</p>
						<Progress value={Math.min(Math.abs(result.var_95) * 2000, 100)} className="mt-1 h-1" />
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							VaR 99%
						</p>
						<p className={`text-sm font-mono font-medium ${varTone(result.var_99)}`}>
							{formatPct(result.var_99)}
						</p>
						<Progress value={Math.min(Math.abs(result.var_99) * 2000, 100)} className="mt-1 h-1" />
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							CVaR 95%
						</p>
						<p className="text-sm font-mono font-medium text-red-500">
							{formatPct(result.cvar_95)}
						</p>
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							CVaR 99%
						</p>
						<p className="text-sm font-mono font-medium text-red-500">
							{formatPct(result.cvar_99)}
						</p>
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Median Return
						</p>
						<p
							className={`text-sm font-mono font-medium ${result.median_return >= 0 ? "text-success" : "text-error"}`}
						>
							{formatPct(result.median_return)}
						</p>
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Simulations
						</p>
						<p className="text-sm font-mono font-medium">
							{result.simulation_count.toLocaleString()}
						</p>
					</div>
				</div>

				<div className="rounded-md border border-dashed border-border/50 bg-card/20 p-3 text-[10px] text-muted-foreground">
					<p>
						Parametric Monte Carlo via Cholesky-decomposed covariance. VaR = loss not exceeded at
						confidence level. CVaR = expected loss beyond VaR threshold.
					</p>
				</div>
			</div>
		</ScrollArea>
	);
}

export default MonteCarloVarPanel;
