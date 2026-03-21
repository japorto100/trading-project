"use client";

import { useEffect, useMemo, useState } from "react";
import type { SourceHealthResponse } from "@/features/geopolitical/store";
import type { GeoCentralBankOverlayConfig } from "@/lib/geopolitical/operations-types";

function classifyOfficialSource(
	entry: SourceHealthResponse["entries"][number],
): "cb" | "sanctions" | "other" {
	const provider = `${entry.id ?? ""} ${entry.label ?? ""}`.toLowerCase();
	if (provider.includes("fed") || provider.includes("ecb") || provider.includes("central")) {
		return "cb";
	}
	if (
		provider.includes("ofac") ||
		provider.includes("sanction") ||
		provider.includes("un") ||
		provider.includes("uk")
	) {
		return "sanctions";
	}
	return "other";
}

export function useGeoStrategicOverlays(sourceHealth: SourceHealthResponse["entries"]) {
	const [cbLayerEnabled, setCbLayerEnabled] = useState<boolean>(true);
	const [cbdcLayerEnabled, setCbdcLayerEnabled] = useState<boolean>(false);
	const [dedollarizationLayerEnabled, setDedollarizationLayerEnabled] = useState<boolean>(false);
	const [financialOpennessLayerEnabled, setFinancialOpennessLayerEnabled] =
		useState<boolean>(false);
	const [overlayLoading, setOverlayLoading] = useState(false);
	const [overlaySaveBusy, setOverlaySaveBusy] = useState(false);
	const [overlayMessage, setOverlayMessage] = useState<string | null>(null);
	const [overlaySourceSummary, setOverlaySourceSummary] = useState<{
		centralBanks: number;
		sanctions: number;
	} | null>(null);

	const officialSourceHealth = useMemo(() => {
		const centralBanks = sourceHealth.filter((entry) => classifyOfficialSource(entry) === "cb");
		const sanctions = sourceHealth.filter((entry) => classifyOfficialSource(entry) === "sanctions");
		return { centralBanks, sanctions };
	}, [sourceHealth]);

	useEffect(() => {
		let cancelled = false;
		setOverlayLoading(true);
		void fetch("/api/geopolitical/overlays/central-bank", { cache: "no-store" })
			.then(async (response) => {
				if (!response.ok) throw new Error(`overlay config fetch failed (${response.status})`);
				const payload = (await response.json()) as {
					success?: boolean;
					config?: GeoCentralBankOverlayConfig;
					sourceSummary?: { centralBanks: number; sanctions: number };
				};
				if (cancelled) return;
				if (payload.config) {
					setCbLayerEnabled(payload.config.rateDecisionsEnabled);
					setCbdcLayerEnabled(payload.config.cbdcStatusEnabled);
					setDedollarizationLayerEnabled(payload.config.dedollarizationEnabled);
					setFinancialOpennessLayerEnabled(payload.config.financialOpennessEnabled);
				}
				setOverlaySourceSummary(payload.sourceSummary ?? null);
			})
			.catch(() => {
				// Keep local defaults.
			})
			.finally(() => {
				if (!cancelled) setOverlayLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const saveOverlayConfig = () => {
		setOverlaySaveBusy(true);
		setOverlayMessage(null);
		void fetch("/api/geopolitical/overlays/central-bank", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				rateDecisionsEnabled: cbLayerEnabled,
				cbdcStatusEnabled: cbdcLayerEnabled,
				dedollarizationEnabled: dedollarizationLayerEnabled,
				financialOpennessEnabled: financialOpennessLayerEnabled,
			}),
		})
			.then(async (response) => {
				const payload = (await response.json()) as {
					success?: boolean;
					error?: string;
					config?: GeoCentralBankOverlayConfig;
				};
				if (!response.ok || !payload.success || !payload.config) {
					throw new Error(payload.error ?? `overlay save failed (${response.status})`);
				}
				setCbLayerEnabled(payload.config.rateDecisionsEnabled);
				setCbdcLayerEnabled(payload.config.cbdcStatusEnabled);
				setDedollarizationLayerEnabled(payload.config.dedollarizationEnabled);
				setFinancialOpennessLayerEnabled(payload.config.financialOpennessEnabled);
				setOverlayMessage("Overlay config saved");
			})
			.catch((error: unknown) => {
				setOverlayMessage(error instanceof Error ? error.message : "overlay save failed");
			})
			.finally(() => setOverlaySaveBusy(false));
	};

	return {
		cbLayerEnabled,
		setCbLayerEnabled,
		cbdcLayerEnabled,
		setCbdcLayerEnabled,
		dedollarizationLayerEnabled,
		setDedollarizationLayerEnabled,
		financialOpennessLayerEnabled,
		setFinancialOpennessLayerEnabled,
		overlayLoading,
		overlaySaveBusy,
		overlayMessage,
		overlaySourceSummary,
		officialSourceHealth,
		saveOverlayConfig,
	};
}
