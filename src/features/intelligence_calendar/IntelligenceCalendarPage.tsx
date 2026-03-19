"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalChat } from "@/features/agent-chat/context/GlobalChatContext";
import { buildCalendarContext } from "@/lib/chat-context-builders";
import { CalendarEventList } from "./components/CalendarEventList";
import { CalendarHero } from "./components/CalendarHero";
import { CalendarPageSkeleton } from "./components/CalendarPageSkeleton";
import { CalendarStatusBanner } from "./components/CalendarStatusBanner";
import type { CalendarFilters } from "./components/CalendarToolbar";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { useIntelligenceCalendar } from "./hooks/useIntelligenceCalendar";

export function IntelligenceCalendarPage() {
	const query = useIntelligenceCalendar();
	const searchParams = useSearchParams();
	// FC5: chat context injection
	const { open: chatOpen, setChatContext } = useGlobalChat();
	const prevChatOpenRef = useRef(false);
	const [filters, setFilters] = useState<CalendarFilters>({
		query: "",
		impact: "all",
		region: "all",
	});
	const focusEventId = searchParams.get("focusEvent");
	const origin = searchParams.get("origin");

	const events = useMemo(() => {
		const data = query.data?.events ?? [];
		const filtered = data.filter((event) => {
			if (filters.impact !== "all" && event.impactBand !== filters.impact) return false;
			if (filters.region !== "all" && event.region !== filters.region) return false;
			if (focusEventId && event.eventId !== focusEventId && origin === "notification") return false;
			if (!filters.query.trim()) return true;
			const haystack = [event.title, event.region, event.category, ...event.affectedAssets]
				.join(" ")
				.toLowerCase();
			return haystack.includes(filters.query.trim().toLowerCase());
		});
		if (focusEventId) {
			filtered.sort(
				(left, right) =>
					Number(right.eventId === focusEventId) - Number(left.eventId === focusEventId),
			);
		}
		return filtered;
	}, [filters, focusEventId, origin, query.data?.events]);

	// FC5: inject Calendar context when chat opens (before early returns)
	useEffect(() => {
		if (chatOpen && !prevChatOpenRef.current) {
			const focusTitle = events.find((e) => e.eventId === focusEventId)?.title;
			setChatContext(buildCalendarContext(events.length, filters.impact, focusTitle));
		}
		prevChatOpenRef.current = chatOpen;
	}, [chatOpen, events, filters.impact, focusEventId, setChatContext]);

	useEffect(() => {
		if (!focusEventId || query.isLoading) return;
		const target = document.querySelector<HTMLElement>(
			`[data-calendar-event-id="${CSS.escape(focusEventId)}"]`,
		);
		target?.focus();
		target?.scrollIntoView({ block: "center" });
	}, [focusEventId, query.isLoading]);

	const regions = useMemo(
		() => Array.from(new Set((query.data?.events ?? []).map((event) => event.region))).sort(),
		[query.data?.events],
	);

	if (query.isLoading) return <CalendarPageSkeleton />;
	if (query.isError || !query.data) return <CalendarPageSkeleton />;

	return (
		<div className="min-h-full overflow-y-auto bg-background">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
				<CalendarStatusBanner
					degraded={query.data.degraded}
					degradedReasons={query.data.degradedReasons}
					notificationFocused={origin === "notification"}
					source={query.data.source}
				/>
				<CalendarHero source={query.data.source} />
				<CalendarToolbar
					filters={filters}
					regions={regions}
					onQueryChange={(value) => setFilters((current) => ({ ...current, query: value }))}
					onImpactChange={(value) => setFilters((current) => ({ ...current, impact: value }))}
					onRegionChange={(value) => setFilters((current) => ({ ...current, region: value }))}
				/>
				<CalendarEventList events={events} />
			</div>
		</div>
	);
}
