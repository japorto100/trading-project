import { MapPin } from "lucide-react";
import { formatPoint } from "@/features/geopolitical/shell/types";
import type { GeoEvent } from "@/lib/geopolitical/types";

interface MarkerListPanelProps {
	events: GeoEvent[];
	selectedEventId: string | null;
	onSelectEvent: (eventId: string) => void;
}

export function MarkerListPanel({ events, selectedEventId, onSelectEvent }: MarkerListPanelProps) {
	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Marker List</h2>
			<div
				className="mt-2 max-h-[260px] space-y-2 overflow-y-auto pr-1"
				tabIndex={0}
				aria-label="Marker list"
			>
				{events.length === 0 ? (
					<p className="text-xs text-muted-foreground">No markers saved yet.</p>
				) : (
					events.map((event) => {
						const active = selectedEventId === event.id;
						return (
							<button
								key={event.id}
								type="button"
								onClick={() => onSelectEvent(event.id)}
								aria-pressed={active}
								aria-label={`Select marker ${event.title}`}
								className={`w-full rounded-md border px-2 py-2 text-left text-xs transition-colors ${
									active
										? "border-primary bg-primary/10"
										: "border-border bg-background hover:bg-accent"
								}`}
							>
								<div className="flex items-center justify-between">
									<span className="font-medium">{event.title}</span>
									<span className="text-[10px] text-muted-foreground">
										S{event.severity}/C{event.confidence}
									</span>
								</div>
								<div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
									<MapPin className="h-3 w-3" />
									{formatPoint(event)}
								</div>
							</button>
						);
					})
				)}
			</div>
		</section>
	);
}
