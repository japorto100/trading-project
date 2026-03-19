"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { IntelligenceCalendarEvent } from "../types";
import { CalendarEventDrilldownActions } from "./CalendarEventDrilldownActions";
import { CalendarEventEvidencePanel } from "./CalendarEventEvidencePanel";
import { CalendarEventHeader } from "./CalendarEventHeader";
import { CalendarEventPlaybookPanel } from "./CalendarEventPlaybookPanel";
import { EventRangeRow } from "./EventRangeRow";
import { EventSurpriseState } from "./EventSurpriseState";

export function CalendarEventCard({ event }: { event: IntelligenceCalendarEvent }) {
	const router = useRouter();

	const handleKeyDown = (keyboardEvent: ReactKeyboardEvent<HTMLElement>) => {
		const cards = Array.from(
			document.querySelectorAll<HTMLElement>("[data-calendar-event-card='true']"),
		);
		const currentIndex = cards.indexOf(keyboardEvent.currentTarget);
		if (currentIndex < 0) return;

		if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
			keyboardEvent.preventDefault();
			router.push(event.targetHref);
			return;
		}

		if (keyboardEvent.key === "ArrowDown" || keyboardEvent.key === "ArrowRight") {
			keyboardEvent.preventDefault();
			cards[Math.min(cards.length - 1, currentIndex + 1)]?.focus();
			return;
		}

		if (keyboardEvent.key === "ArrowUp" || keyboardEvent.key === "ArrowLeft") {
			keyboardEvent.preventDefault();
			cards[Math.max(0, currentIndex - 1)]?.focus();
			return;
		}

		if (keyboardEvent.key === "Home") {
			keyboardEvent.preventDefault();
			cards[0]?.focus();
			return;
		}

		if (keyboardEvent.key === "End") {
			keyboardEvent.preventDefault();
			cards.at(-1)?.focus();
		}
	};

	return (
		<article
			data-calendar-event-card="true"
			data-calendar-event-id={event.eventId}
			tabIndex={0}
			aria-label={`${event.title}, ${event.region}, ${event.impactBand} impact`}
			onKeyDown={handleKeyDown}
			className="rounded-2xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-sky-500/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
		>
			<CalendarEventHeader event={event} />
			<div className="mt-3">
				<EventRangeRow actual={event.actual} range={event.expectedRange} />
			</div>
			<div className="mt-3 flex items-center justify-between gap-3">
				<EventSurpriseState state={event.surpriseState} />
				<span className="text-xs text-muted-foreground">{event.freshnessLabel}</span>
			</div>
			<div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
				<CalendarEventPlaybookPanel event={event} playbook={event.playbook} />
				<CalendarEventEvidencePanel event={event} />
			</div>
			<div className="mt-4">
				<CalendarEventDrilldownActions event={event} />
			</div>
		</article>
	);
}
