"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

type PositionSignal = {
	symbol: string;
	regime: "bullish" | "bearish" | "ranging";
	traffic_light: "green" | "yellow" | "red";
	recommended_size_pct: number;
	confidence: number;
};

type RegimeSizingResponse = {
	signals: PositionSignal[];
	portfolio_regime: "risk_on" | "neutral" | "risk_off";
	regime_confidence: number;
};

function trafficColor(tl: PositionSignal["traffic_light"]): string {
	switch (tl) {
		case "green":
			return "text-success border-success/30";
		case "red":
			return "text-error border-error/30";
		default:
			return "text-amber-500 border-amber-500/30";
	}
}

function portfolioRegimeBadge(regime: RegimeSizingResponse["portfolio_regime"]): string {
	switch (regime) {
		case "risk_on":
			return "text-success border-success/30";
		case "risk_off":
			return "text-error border-error/30";
		default:
			return "text-amber-500 border-amber-500/30";
	}
}

function trafficDot(tl: PositionSignal["traffic_light"]): string {
	switch (tl) {
		case "green":
			return "bg-success";
		case "red":
			return "bg-error";
		default:
			return "bg-amber-500";
	}
}

export function RegimeSizingPanel({ symbols }: { symbols: string[] }) {
	const [result, setResult] = useState<RegimeSizingResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (symbols.length === 0) return;
		let mounted = true;
		setLoading(true);
		setError(null);

		async function fetch_() {
			try {
				const res = await fetch("/api/fusion/portfolio/analytics/regime-sizing", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ symbols, timeframe: "1D", limit: 100 }),
				});
				if (!res.ok) throw new Error(`Backend error ${res.status}`);
				const data = (await res.json()) as RegimeSizingResponse;
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
					<AlertDescription>Regime sizing needs at least one open position.</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="p-3 text-xs text-muted-foreground animate-pulse">Detecting regimes…</div>
		);
	}

	if (error) {
		return (
			<div className="p-3">
				<Alert>
					<AlertTitle>Regime backend unavailable</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!result) return null;

	const greenCount = result.signals.filter((s) => s.traffic_light === "green").length;
	const yellowCount = result.signals.filter((s) => s.traffic_light === "yellow").length;
	const redCount = result.signals.filter((s) => s.traffic_light === "red").length;

	return (
		<ScrollArea className="flex-1">
			<div className="flex flex-col gap-3 p-3">
				<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					<Badge variant="outline" className={portfolioRegimeBadge(result.portfolio_regime)}>
						{result.portfolio_regime.replace("_", "-").toUpperCase()}
					</Badge>
					<span className="text-muted-foreground">
						Confidence: {(result.regime_confidence * 100).toFixed(0)}%
					</span>
					<Badge variant="outline" className="text-success border-success/30 text-[10px]">
						{greenCount} green
					</Badge>
					<Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
						{yellowCount} yellow
					</Badge>
					<Badge variant="outline" className="text-error border-error/30 text-[10px]">
						{redCount} red
					</Badge>
				</div>

				<div className="space-y-2">
					<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						Position Signals
					</p>
					{result.signals.map((sig) => (
						<div
							key={sig.symbol}
							className="rounded-md border border-border/50 bg-card/20 p-3 hover:bg-accent/20 transition-colors"
						>
							<div className="mb-2 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<div className={`h-2.5 w-2.5 rounded-full ${trafficDot(sig.traffic_light)}`} />
									<p className="text-sm font-bold">{sig.symbol}</p>
								</div>
								<Badge variant="outline" className={trafficColor(sig.traffic_light)}>
									{sig.traffic_light.toUpperCase()}
								</Badge>
							</div>
							<div className="grid grid-cols-3 gap-2 text-[10px]">
								<div>
									<p className="text-muted-foreground uppercase font-bold tracking-wider">Regime</p>
									<p className="font-medium capitalize mt-0.5">{sig.regime}</p>
								</div>
								<div>
									<p className="text-muted-foreground uppercase font-bold tracking-wider">
										Confidence
									</p>
									<p className="font-mono mt-0.5">{(sig.confidence * 100).toFixed(0)}%</p>
								</div>
								<div>
									<p className="text-muted-foreground uppercase font-bold tracking-wider">
										Rec. Size
									</p>
									<p className="font-mono mt-0.5">{sig.recommended_size_pct.toFixed(1)}%</p>
								</div>
							</div>
							<Progress
								value={sig.recommended_size_pct}
								className={`mt-2 h-1 ${sig.traffic_light === "green" ? "text-success" : sig.traffic_light === "red" ? "text-error" : "text-amber-500"}`}
							/>
						</div>
					))}
				</div>

				<div className="rounded-md border border-dashed border-border/50 bg-card/20 p-3 text-[10px] text-muted-foreground">
					<p>
						SMA-Slope + ADX-proxy regime detection. Green = full weight, Yellow = 50%, Red = 15%.
					</p>
				</div>
			</div>
		</ScrollArea>
	);
}

export default RegimeSizingPanel;
