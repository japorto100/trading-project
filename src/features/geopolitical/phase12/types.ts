"use client";

import type { GeoEvent } from "@/lib/geopolitical/types";

export type AlertSeverityThreshold = "low" | "medium" | "high" | "critical";
export type ExportFormat = "json" | "csv" | "png" | "pdf";

export interface AlertsPreviewResponse {
	totalEvents: number;
	thresholdMatchedEvents: number;
	eligibleAlerts: number;
	suppressedAlerts: number;
	events: GeoEvent[];
}
