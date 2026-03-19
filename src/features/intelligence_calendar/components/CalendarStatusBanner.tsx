import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { IntelligenceCalendarSource } from "../types";

export function CalendarStatusBanner({
	degraded,
	degradedReasons,
	notificationFocused,
	source,
}: {
	degraded: boolean;
	degradedReasons: string[];
	notificationFocused: boolean;
	source: IntelligenceCalendarSource;
}) {
	if (!degraded) {
		return (
			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>Calendar surface live</AlertTitle>
				<AlertDescription>
					Local event intelligence is available. Source: {source}.
					{notificationFocused ? " Focused from a notification deep-link." : ""}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert variant="destructive">
			<AlertTriangle className="h-4 w-4" />
			<AlertTitle>Calendar surface is degraded</AlertTitle>
			<AlertDescription>Reasons: {degradedReasons.join(", ")}</AlertDescription>
		</Alert>
	);
}
