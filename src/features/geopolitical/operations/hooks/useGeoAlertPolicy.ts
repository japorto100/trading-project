"use client";

import { useEffect, useMemo, useState } from "react";
import type {
	GeoAlertSeverityThreshold,
	GeoAlertsPreviewResponse,
} from "@/features/geopolitical/operations/types";
import type { GeoAlertPolicyConfig } from "@/lib/geopolitical/operations-types";
import type { GeoEvent } from "@/lib/geopolitical/types";

const SEVERITY_WEIGHT: Record<GeoAlertSeverityThreshold, number> = {
	low: 1,
	medium: 2,
	high: 3,
	critical: 4,
};

const SEVERITY_BY_VALUE: Record<number, GeoAlertSeverityThreshold> = {
	1: "low",
	2: "medium",
	3: "high",
	4: "critical",
	5: "critical",
};

export function useGeoAlertPolicy(events: GeoEvent[]) {
	const [alertSeverityThreshold, setAlertSeverityThreshold] =
		useState<GeoAlertSeverityThreshold>("high");
	const [alertConfidenceThreshold, setAlertConfidenceThreshold] = useState<number>(0.72);
	const [alertCooldownMinutes, setAlertCooldownMinutes] = useState<number>(60);
	const [muteProfileEnabled, setMuteProfileEnabled] = useState<boolean>(false);
	const [playbackAlertTieIn, setPlaybackAlertTieIn] = useState<boolean>(true);
	const [alertsLoading, setAlertsLoading] = useState(false);
	const [alertsError, setAlertsError] = useState<string | null>(null);
	const [alertsPreviewResponse, setAlertsPreviewResponse] =
		useState<GeoAlertsPreviewResponse | null>(null);
	const [policyLoading, setPolicyLoading] = useState(false);
	const [policySaveBusy, setPolicySaveBusy] = useState(false);
	const [policyMessage, setPolicyMessage] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setPolicyLoading(true);
		void fetch("/api/geopolitical/alerts/policy", { cache: "no-store" })
			.then(async (response) => {
				if (!response.ok) throw new Error(`policy fetch failed (${response.status})`);
				const payload = (await response.json()) as {
					success?: boolean;
					policy?: GeoAlertPolicyConfig;
				};
				if (!cancelled && payload.policy) {
					setAlertSeverityThreshold(payload.policy.minSeverity);
					setAlertConfidenceThreshold(payload.policy.minConfidence);
					setAlertCooldownMinutes(payload.policy.cooldownMinutes);
					setMuteProfileEnabled(payload.policy.muteProfileEnabled);
					setPlaybackAlertTieIn(payload.policy.usePlaybackWindowPreview);
				}
			})
			.catch(() => {
				// Keep local defaults.
			})
			.finally(() => {
				if (!cancelled) setPolicyLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		setAlertsLoading(true);
		setAlertsError(null);
		const params = new URLSearchParams({
			cooldownMinutes: String(alertCooldownMinutes),
			minConfidence: String(alertConfidenceThreshold),
			minSeverity: alertSeverityThreshold,
		});
		void fetch(`/api/geopolitical/alerts?${params.toString()}`, { cache: "no-store" })
			.then(async (response) => {
				if (!response.ok) throw new Error(`alerts preview failed (${response.status})`);
				const payload = (await response.json()) as {
					success?: boolean;
					totalEvents?: number;
					thresholdMatchedEvents?: number;
					eligibleAlerts?: number;
					suppressedAlerts?: number;
					events?: GeoEvent[];
				};
				if (cancelled) return;
				setAlertsPreviewResponse({
					totalEvents: payload.totalEvents ?? events.length,
					thresholdMatchedEvents: payload.thresholdMatchedEvents ?? 0,
					eligibleAlerts: payload.eligibleAlerts ?? 0,
					suppressedAlerts: payload.suppressedAlerts ?? 0,
					events: Array.isArray(payload.events) ? payload.events : [],
				});
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					setAlertsError(error instanceof Error ? error.message : "alerts preview failed");
					setAlertsPreviewResponse(null);
				}
			})
			.finally(() => {
				if (!cancelled) setAlertsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [alertConfidenceThreshold, alertCooldownMinutes, alertSeverityThreshold, events.length]);

	const alertPreview = useMemo(() => {
		const thresholdWeight = SEVERITY_WEIGHT[alertSeverityThreshold];
		const matches = events.filter((event) => {
			const normalizedSeverity = SEVERITY_BY_VALUE[event.severity] ?? "low";
			const eventWeight =
				normalizedSeverity === "critical"
					? 4
					: normalizedSeverity === "high"
						? 3
						: normalizedSeverity === "medium"
							? 2
							: 1;
			return eventWeight >= thresholdWeight && event.confidence >= alertConfidenceThreshold;
		});
		return matches.slice(0, 5);
	}, [alertConfidenceThreshold, alertSeverityThreshold, events]);

	const saveAlertPolicy = () => {
		setPolicySaveBusy(true);
		setPolicyMessage(null);
		void fetch("/api/geopolitical/alerts/policy", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				minSeverity: alertSeverityThreshold,
				minConfidence: alertConfidenceThreshold,
				cooldownMinutes: alertCooldownMinutes,
				muteProfileEnabled,
				usePlaybackWindowPreview: playbackAlertTieIn,
			}),
		})
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`policy save failed (${response.status})`);
				}
				setPolicyMessage("Policy saved");
			})
			.catch((error: unknown) => {
				setPolicyMessage(error instanceof Error ? error.message : "policy save failed");
			})
			.finally(() => setPolicySaveBusy(false));
	};

	return {
		alertSeverityThreshold,
		setAlertSeverityThreshold,
		alertConfidenceThreshold,
		setAlertConfidenceThreshold,
		alertCooldownMinutes,
		setAlertCooldownMinutes,
		muteProfileEnabled,
		setMuteProfileEnabled,
		playbackAlertTieIn,
		setPlaybackAlertTieIn,
		alertsLoading,
		alertsError,
		alertsPreviewResponse,
		policyLoading,
		policySaveBusy,
		policyMessage,
		alertPreview,
		saveAlertPolicy,
	};
}
