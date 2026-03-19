export function buildEventDetailHref(eventId: string, returnTo: string): string {
	return `/events/${encodeURIComponent(eventId)}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function buildSurfaceReturnHref(targetPath: string, returnTo: string): string {
	return `${targetPath}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function buildCalendarNotificationHref(eventId: string): string {
	return `/calendar?origin=notification&focusEvent=${encodeURIComponent(eventId)}`;
}
