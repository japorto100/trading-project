import { BellRing, BriefcaseBusiness, Globe, Radar, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { IntelligenceCalendarEvent } from "../types";

export function CalendarEventDrilldownActions({ event }: { event: IntelligenceCalendarEvent }) {
	const returnTarget = encodeURIComponent(event.targetHref);

	return (
		<div aria-label="Event drilldown actions" className="flex flex-wrap gap-2">
			<Button asChild size="sm" variant="secondary">
				<Link href={event.targetHref}>
					<Search className="h-3.5 w-3.5" />
					Event detail
				</Link>
			</Button>
			<Button asChild size="sm" variant="outline">
				<Link href={`/trading?returnTo=${returnTarget}`}>
					<TrendingUp className="h-3.5 w-3.5" />
					Trading
				</Link>
			</Button>
			<Button asChild size="sm" variant="outline">
				<Link href={`/geopolitical-map?returnTo=${returnTarget}`}>
					<Globe className="h-3.5 w-3.5" />
					GeoMap
				</Link>
			</Button>
			<Button asChild size="sm" variant="outline">
				<Link href="/control/overview">
					<Radar className="h-3.5 w-3.5" />
					Control
				</Link>
			</Button>
			<Button
				size="sm"
				variant="outline"
				disabled
				aria-disabled="true"
				title="Portfolio surface is not available in the shell yet."
			>
				<BriefcaseBusiness className="h-3.5 w-3.5" />
				Portfolio pending
			</Button>
			<Button
				size="sm"
				variant="outline"
				disabled
				aria-disabled="true"
				title="Alert surface is not available in the shell yet."
			>
				<BellRing className="h-3.5 w-3.5" />
				Alerts pending
			</Button>
		</div>
	);
}
