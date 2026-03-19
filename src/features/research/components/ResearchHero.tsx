import { Compass } from "lucide-react";
import { researchConfidenceTone } from "../utils";

interface ResearchHeroProps {
	regime: string;
	confidence: number;
	freshnessLabel: string;
}

export function ResearchHero({ regime, confidence, freshnessLabel }: ResearchHeroProps) {
	return (
		<section className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_28%),hsl(var(--card))] p-6">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div className="max-w-3xl">
					<div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
						<Compass className="h-3.5 w-3.5" />
						Research Home
					</div>
					<h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground">
						Decision context first, execution second.
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
						Phase-1 scaffold for the new research surface. The shell route is live, the default
						landing route remains /trading, and the next slice is contract-first BFF work for
						research/home.
					</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-2xl border border-border/70 bg-background/70 p-4">
						<p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Regime</p>
						<p className="mt-2 text-sm font-semibold text-foreground">{regime}</p>
					</div>
					<div className="rounded-2xl border border-border/70 bg-background/70 p-4">
						<p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
							Confidence
						</p>
						<p className={`mt-2 text-sm font-semibold ${researchConfidenceTone(confidence)}`}>
							{(confidence * 100).toFixed(0)}%
						</p>
					</div>
					<div className="rounded-2xl border border-border/70 bg-background/70 p-4">
						<p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
							Freshness
						</p>
						<p className="mt-2 text-sm font-semibold text-foreground">{freshnessLabel}</p>
					</div>
				</div>
			</div>
		</section>
	);
}
