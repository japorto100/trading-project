import { buildCalendarNotificationHref } from "@/lib/event-detail";
import { buildTradingWorkspaceHref } from "@/lib/trading-entry";
import type { AlertNotificationKind } from "./types";

interface NotificationTargetOptions {
	eventId?: string;
}

export function buildAlertNotificationTarget(
	kind: AlertNotificationKind,
	options: NotificationTargetOptions = {},
): string {
	switch (kind) {
		case "event":
			return options.eventId
				? buildCalendarNotificationHref(options.eventId)
				: "/calendar?origin=notification";
		case "portfolio":
			return buildTradingWorkspaceHref({ focus: "portfolio", origin: "notification" });
		case "geopolitical":
			return "/geopolitical-map?origin=notification";
		case "system":
			return "/control/overview?origin=notification";
		default:
			return buildTradingWorkspaceHref({ origin: "notification" });
	}
}
