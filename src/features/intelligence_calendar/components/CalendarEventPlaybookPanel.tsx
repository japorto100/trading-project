import type { IntelligenceCalendarEvent, IntelligenceCalendarPlaybookItem } from "../types";
import { intelligenceCalendarRequiresEvidence } from "../utils";

export function CalendarEventPlaybookPanel({
	event,
	playbook,
}: {
	event: IntelligenceCalendarEvent;
	playbook: IntelligenceCalendarPlaybookItem[];
}) {
	if (!intelligenceCalendarRequiresEvidence(event)) {
		return (
			<div className="rounded-2xl border border-border/70 bg-background/50 p-3">
				<p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
					Playbook
				</p>
				<p className="mt-3 text-xs text-amber-300">
					Playbook inference is withheld until confidence and at least one evidence source are
					available.
				</p>
			</div>
		);
	}

	if (playbook.length === 0) {
		return (
			<div className="rounded-2xl border border-border/70 bg-background/50 p-3">
				<p className="text-xs text-muted-foreground">No event playbook attached yet.</p>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-border/70 bg-background/50 p-3">
			<p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
				Playbook
			</p>
			<div className="mt-3 space-y-2">
				{playbook.slice(0, 2).map((item) => (
					<div
						key={`${item.scenario}-${item.bias}`}
						className="rounded-xl border border-border/60 p-3"
					>
						<p className="text-xs font-semibold text-foreground">{item.scenario}</p>
						<p className="mt-1 text-xs text-muted-foreground">{item.bias}</p>
						{item.note ? <p className="mt-2 text-xs text-muted-foreground">{item.note}</p> : null}
					</div>
				))}
			</div>
		</div>
	);
}
