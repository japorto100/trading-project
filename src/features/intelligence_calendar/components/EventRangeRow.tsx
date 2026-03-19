import type { IntelligenceCalendarExpectedRange } from "../types";

export function EventRangeRow({
	actual,
	range,
}: {
	actual?: number | string | null;
	range?: IntelligenceCalendarExpectedRange;
}) {
	if (!range) {
		return <p className="text-xs text-muted-foreground">Expected range unavailable</p>;
	}

	return (
		<div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground">
			<span>Min {range.min ?? "n/a"}</span>
			<span>Con {range.consensus ?? "n/a"}</span>
			<span>Max {range.max ?? "n/a"}</span>
			<span>Prev {range.previous ?? "n/a"}</span>
			<span>Act {actual ?? "pending"}</span>
		</div>
	);
}
