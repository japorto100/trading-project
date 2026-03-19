import { Badge } from "@/components/ui/badge";
import type { IntelligenceCalendarEvent } from "../types";
import { intelligenceCalendarImpactTone, intelligenceCalendarOperationalState } from "../utils";

export function CalendarEventHeader({ event }: { event: IntelligenceCalendarEvent }) {
	return (
		<div className="flex items-start justify-between gap-3">
			<div className="space-y-1">
				<p className="text-sm font-semibold text-foreground">{event.title}</p>
				<p className="text-xs text-muted-foreground">
					{event.scheduledAt} · {event.region}
				</p>
				<p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
					{intelligenceCalendarOperationalState(event)}
				</p>
			</div>
			<Badge variant="outline" className={intelligenceCalendarImpactTone(event.impactBand)}>
				{event.impactBand}
			</Badge>
		</div>
	);
}
