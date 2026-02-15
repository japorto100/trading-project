"use client";

import { useMemo, useState } from "react";
import type { GeoTimelineEntry } from "@/lib/geopolitical/types";

interface TimelineStripProps {
	timeline: GeoTimelineEntry[];
}

function formatTime(iso: string): string {
	const timestamp = new Date(iso);
	if (!Number.isFinite(timestamp.getTime())) return iso;
	return timestamp.toLocaleString();
}

export function TimelineStrip({ timeline }: TimelineStripProps) {
	const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
	const selectedEntry = useMemo(
		() => timeline.find((entry) => entry.id === selectedTimelineId) ?? timeline[0] ?? null,
		[selectedTimelineId, timeline],
	);

	return (
		<section className="border-t border-border bg-card/40 px-3 py-2">
			<div className="mb-2 flex items-center justify-between">
				<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Timeline
				</h2>
				<span className="text-[11px] text-muted-foreground">{timeline.length} entries</span>
			</div>
			<div className="grid gap-2 md:grid-cols-[1fr_320px]">
				<div className="flex gap-2 overflow-x-auto pb-1">
					{timeline.length === 0 ? (
						<div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
							No timeline entries yet.
						</div>
					) : (
						timeline.map((entry) => (
							<button
								key={entry.id}
								type="button"
								className={`min-w-[260px] rounded-md border bg-background px-3 py-2 text-xs ${
									selectedEntry?.id === entry.id ? "border-primary" : "border-border"
								}`}
								onClick={() => setSelectedTimelineId(entry.id)}
								aria-pressed={selectedEntry?.id === entry.id}
								aria-label={`Timeline entry ${entry.action} at ${formatTime(entry.at)}`}
							>
								<div className="flex items-center justify-between gap-2">
									<span className="font-medium">{entry.action}</span>
									<span className="text-[11px] text-muted-foreground">{formatTime(entry.at)}</span>
								</div>
								<p className="mt-1 text-muted-foreground">{entry.diffSummary}</p>
								<p className="mt-1 text-[11px] text-muted-foreground">actor: {entry.actor}</p>
							</button>
						))
					)}
				</div>

				<aside className="rounded-md border border-border bg-background px-3 py-2 text-xs">
					{selectedEntry ? (
						<>
							<p className="font-medium">{selectedEntry.action}</p>
							<p className="mt-1 text-muted-foreground">{selectedEntry.diffSummary}</p>
							<p className="mt-2 text-[11px] text-muted-foreground">
								eventId: {selectedEntry.eventId}
							</p>
							<p className="text-[11px] text-muted-foreground">actor: {selectedEntry.actor}</p>
							<p className="text-[11px] text-muted-foreground">
								at: {formatTime(selectedEntry.at)}
							</p>
						</>
					) : (
						<p className="text-muted-foreground">Select a timeline item.</p>
					)}
				</aside>
			</div>
		</section>
	);
}
