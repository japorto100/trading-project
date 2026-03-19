import { CalendarDays } from "lucide-react";
import type { IntelligenceCalendarSource } from "../types";

export function CalendarHero({ source }: { source: IntelligenceCalendarSource }) {
	return (
		<section className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_28%),hsl(var(--card))] p-6">
			<div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
				<CalendarDays className="h-3.5 w-3.5" />
				Intelligence Calendar
			</div>
			<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
				Operational event intelligence, not a date list.
			</h1>
			<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
				Use this surface for event scanning, expectation gaps, impact triage, and direct drilldowns
				into GeoMap or the Trading Workspace. Current mode: {source}.
			</p>
		</section>
	);
}
