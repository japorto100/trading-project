import { Badge } from "@/components/ui/badge";
import type { IntelligenceCalendarEvent } from "../types";
import { intelligenceCalendarEvidenceState, intelligenceCalendarEvidenceTone } from "../utils";

export function CalendarEventEvidencePanel({ event }: { event: IntelligenceCalendarEvent }) {
	const evidenceState = intelligenceCalendarEvidenceState(event);

	return (
		<div
			aria-label={`Evidence panel, ${evidenceState}`}
			className="rounded-2xl border border-border/70 bg-background/50 p-3"
		>
			<p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
				Evidence
			</p>
			<div className="mt-3 flex flex-wrap gap-2">
				<Badge variant="outline" className={intelligenceCalendarEvidenceTone(evidenceState)}>
					{evidenceState}
				</Badge>
				<Badge variant="outline">Confidence {(event.confidence * 100).toFixed(0)}%</Badge>
				<Badge variant="outline">{event.sources.length} sources</Badge>
				<Badge variant="outline">{event.affectedAssets.length} assets</Badge>
			</div>
			<p className="mt-3 text-xs text-muted-foreground">
				{event.sources.length > 0
					? event.sources
							.slice(0, 2)
							.map((source) => source.name)
							.join(", ")
					: "No linked sources yet."}
			</p>
			<div className="mt-3 flex flex-wrap gap-2">
				{event.affectedAssets.slice(0, 4).map((asset) => (
					<span
						key={asset}
						className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground"
					>
						{asset}
					</span>
				))}
			</div>
			{event.degradationReasons.length > 0 ? (
				<p className="mt-3 text-xs text-amber-300">
					Partial data: {event.degradationReasons.join(", ")}
				</p>
			) : null}
		</div>
	);
}
