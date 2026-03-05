"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

type KellyResponse = {
	allocations: Record<string, number>;
	kelly_fractions: Record<string, number>;
	portfolio_expected_return: number;
	portfolio_variance: number;
};

function formatPct(v: number): string {
	return `${(v * 100).toFixed(2)}%`;
}

function fractionTone(f: number): string {
	if (f > 0.5) return "text-emerald-500 border-emerald-500/30";
	if (f > 0.1) return "text-amber-500 border-amber-500/30";
	return "text-muted-foreground";
}

export function KellyAllocationPanel({ symbols }: { symbols: string[] }) {
	const [result, setResult] = useState<KellyResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (symbols.length === 0) return;
		let mounted = true;
		setLoading(true);
		setError(null);

		async function fetch_() {
			try {
				const res = await fetch("/api/fusion/portfolio/analytics/kelly-allocation", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ symbols, risk_fraction: 0.25, timeframe: "1D", limit: 252 }),
				});
				if (!res.ok) throw new Error(`Backend error ${res.status}`);
				const data = (await res.json()) as KellyResponse;
				if (mounted) setResult(data);
			} catch (e) {
				if (mounted) setError(e instanceof Error ? e.message : "Unknown error");
			} finally {
				if (mounted) setLoading(false);
			}
		}

		void fetch_();
		return () => {
			mounted = false;
		};
	}, [symbols]);

	if (symbols.length === 0) {
		return (
			<div className="p-3">
				<Alert>
					<AlertTitle>No open positions</AlertTitle>
					<AlertDescription>Kelly allocation needs at least one open position.</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="p-3 text-xs text-muted-foreground animate-pulse">
				Computing Kelly fractions…
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-3">
				<Alert>
					<AlertTitle>Kelly backend unavailable</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!result) return null;

	const totalAllocation = Object.values(result.allocations).reduce((a, b) => a + b, 0);

	return (
		<ScrollArea className="flex-1">
			<div className="flex flex-col gap-3 p-3">
				<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					<Badge variant="outline">Kelly Multi-Asset</Badge>
					<Badge variant="outline">risk_fraction=25%</Badge>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div className="rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Exp. Annual Return
						</p>
						<p
							className={`text-sm font-mono font-medium ${result.portfolio_expected_return >= 0 ? "text-success" : "text-error"}`}
						>
							{formatPct(result.portfolio_expected_return)}
						</p>
					</div>
					<div className="rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Portfolio Variance
						</p>
						<p className="text-sm font-mono font-medium text-amber-500">
							{result.portfolio_variance.toFixed(4)}
						</p>
					</div>
					<div className="col-span-2 rounded-md border border-border/50 bg-card/30 p-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Total Allocated
						</p>
						<p className="text-sm font-mono font-medium">{formatPct(totalAllocation)}</p>
						<Progress value={totalAllocation * 100} className="mt-1 h-1" />
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						Per-Asset Kelly
					</p>
					{Object.entries(result.allocations).map(([sym, alloc]) => {
						const raw = result.kelly_fractions[sym] ?? 0;
						return (
							<div
								key={sym}
								className="rounded-md border border-border/50 bg-card/20 p-3 hover:bg-accent/20 transition-colors"
							>
								<div className="mb-2 flex items-center justify-between gap-2">
									<p className="text-sm font-bold">{sym}</p>
									<Badge variant="outline" className={fractionTone(alloc)}>
										{formatPct(alloc)} allocated
									</Badge>
								</div>
								<div className="space-y-1">
									<div className="flex justify-between text-[10px] text-muted-foreground">
										<span className="uppercase font-bold tracking-wider">Raw Kelly</span>
										<span className="font-mono">{raw.toFixed(4)}</span>
									</div>
									<div className="flex justify-between text-[10px] text-muted-foreground">
										<span className="uppercase font-bold tracking-wider">Scaled (25%)</span>
										<span className="font-mono">{formatPct(alloc)}</span>
									</div>
									<Progress value={Math.min(alloc * 400, 100)} className="h-1 mt-1" />
								</div>
							</div>
						);
					})}
				</div>

				<div className="rounded-md border border-dashed border-border/50 bg-card/20 p-3 text-[10px] text-muted-foreground">
					<p>
						Quarter-Kelly sizing (risk_fraction=0.25) applied. Raw fractions {">"}0 only (long-only
						constraint).
					</p>
				</div>
			</div>
		</ScrollArea>
	);
}

export default KellyAllocationPanel;
