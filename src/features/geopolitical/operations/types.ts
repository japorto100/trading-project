"use client";

import type { GeoEvent } from "@/lib/geopolitical/types";

export type GeoAlertSeverityThreshold = "low" | "medium" | "high" | "critical";
export type GeoExportFormat = "json" | "csv" | "png" | "pdf";

export interface GeoAlertsPreviewResponse {
	totalEvents: number;
	thresholdMatchedEvents: number;
	eligibleAlerts: number;
	suppressedAlerts: number;
	events: GeoEvent[];
}
