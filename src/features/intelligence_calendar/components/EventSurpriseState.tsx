import type { IntelligenceCalendarSurpriseState } from "../types";
import { intelligenceCalendarSurpriseTone } from "../utils";

const LABELS: Record<IntelligenceCalendarSurpriseState, string> = {
	unknown: "Surprise unknown",
	pending: "Pre-event pending",
	in_range: "In range",
	above_range: "Above range",
	below_range: "Below range",
};

export function EventSurpriseState({ state }: { state: IntelligenceCalendarSurpriseState }) {
	return (
		<p className={`text-xs font-medium ${intelligenceCalendarSurpriseTone(state)}`}>
			{LABELS[state]}
		</p>
	);
}
