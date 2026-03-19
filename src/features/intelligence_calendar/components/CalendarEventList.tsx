import type { IntelligenceCalendarEvent } from "../types";
import { CalendarEventCard } from "./CalendarEventCard";

export function CalendarEventList({ events }: { events: IntelligenceCalendarEvent[] }) {
	return (
		<section aria-labelledby="calendar-events-heading">
			<div className="mb-3 flex items-center justify-between gap-3">
				<h2 id="calendar-events-heading" className="text-sm font-semibold text-foreground">
					Event intelligence queue
				</h2>
				<p className="text-xs text-muted-foreground">{events.length} events</p>
			</div>
			<p id="calendar-events-help" className="sr-only">
				Use Tab to focus a card. Use arrow keys to move between cards. Press Enter to open the
				shared event detail.
			</p>
			<div role="list" aria-describedby="calendar-events-help" className="space-y-4">
				{events.map((event) => (
					<div key={event.eventId} role="listitem">
						<CalendarEventCard event={event} />
					</div>
				))}
			</div>
		</section>
	);
}
