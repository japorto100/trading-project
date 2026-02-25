"use client";

import { useEffect, useMemo, useState } from "react";
import type { SourceHealthResponse } from "@/features/geopolitical/store";
import type {
	GeoAlertPolicyConfig,
	GeoCentralBankOverlayConfig,
	GeoEvaluationSummary,
} from "@/lib/geopolitical/phase12-types";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";

interface Phase12AdvancedPanelProps {
	activeRegionLabel: string;
	events: GeoEvent[];
	candidates: GeoCandidate[];
	timeline: GeoTimelineEntry[];
	sourceHealth: SourceHealthResponse["entries"];
}

type AlertSeverityThreshold = "low" | "medium" | "high" | "critical";
type ExportFormat = "json" | "csv";

function downloadText(filename: string, content: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

function summarizeTimeline(timeline: GeoTimelineEntry[]) {
	let accepted = 0;
	let rejected = 0;
	let snoozed = 0;
	let contradictionCreated = 0;
	let contradictionResolved = 0;
	for (const entry of timeline) {
		if (entry.action === "candidate_accepted") accepted += 1;
		if (entry.action === "candidate_rejected") rejected += 1;
		if (entry.action === "candidate_snoozed") snoozed += 1;
		if (entry.action === "contradiction_created") contradictionCreated += 1;
		if (entry.action === "contradiction_resolved") contradictionResolved += 1;
	}
	const reviewTotal = accepted + rejected + snoozed;
	return {
		accepted,
		rejected,
		snoozed,
		reviewTotal,
		acceptRate: reviewTotal > 0 ? accepted / reviewTotal : 0,
		rejectRate: reviewTotal > 0 ? rejected / reviewTotal : 0,
		snoozeRate: reviewTotal > 0 ? snoozed / reviewTotal : 0,
		contradictionCreated,
		contradictionResolved,
	};
}

function classifyOfficialSource(
	entry: SourceHealthResponse["entries"][number],
): "cb" | "sanctions" | "other" {
	const provider = `${entry.id ?? ""} ${entry.label ?? ""}`.toLowerCase();
	if (provider.includes("fed") || provider.includes("ecb") || provider.includes("central"))
		return "cb";
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

export function Phase12AdvancedPanel({
	activeRegionLabel,
	events,
	candidates,
	timeline,
	sourceHealth,
}: Phase12AdvancedPanelProps) {
	const [alertSeverityThreshold, setAlertSeverityThreshold] =
		useState<AlertSeverityThreshold>("high");
	const [alertConfidenceThreshold, setAlertConfidenceThreshold] = useState<number>(0.72);
	const [alertCooldownMinutes, setAlertCooldownMinutes] = useState<number>(60);
	const [muteProfileEnabled, setMuteProfileEnabled] = useState<boolean>(false);
	const [playbackAlertTieIn, setPlaybackAlertTieIn] = useState<boolean>(true);
	const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>("json");
	const [cbLayerEnabled, setCbLayerEnabled] = useState<boolean>(true);
	const [cbdcLayerEnabled, setCbdcLayerEnabled] = useState<boolean>(false);
	const [dedollarizationLayerEnabled, setDedollarizationLayerEnabled] = useState<boolean>(false);
	const [financialOpennessLayerEnabled, setFinancialOpennessLayerEnabled] =
		useState<boolean>(false);
	const [alertsLoading, setAlertsLoading] = useState(false);
	const [alertsError, setAlertsError] = useState<string | null>(null);
	const [alertsPreviewResponse, setAlertsPreviewResponse] = useState<{
		totalEvents: number;
		thresholdMatchedEvents: number;
		eligibleAlerts: number;
		suppressedAlerts: number;
		events: GeoEvent[];
	} | null>(null);
	const [policyLoading, setPolicyLoading] = useState(false);
	const [policySaveBusy, setPolicySaveBusy] = useState(false);
	const [policyMessage, setPolicyMessage] = useState<string | null>(null);
	const [evaluationLoading, setEvaluationLoading] = useState(false);
	const [evaluationSummary, setEvaluationSummary] = useState<GeoEvaluationSummary | null>(null);
	const [evaluationError, setEvaluationError] = useState<string | null>(null);
	const [exportBusy, setExportBusy] = useState(false);
	const [exportMessage, setExportMessage] = useState<string | null>(null);
	const [overlayLoading, setOverlayLoading] = useState(false);
	const [overlaySaveBusy, setOverlaySaveBusy] = useState(false);
	const [overlayMessage, setOverlayMessage] = useState<string | null>(null);
	const [overlaySourceSummary, setOverlaySourceSummary] = useState<{
		centralBanks: number;
		sanctions: number;
	} | null>(null);

	const reviewStats = useMemo(() => summarizeTimeline(timeline), [timeline]);
	const openCandidates = useMemo(
		() => candidates.filter((candidate) => candidate.state === "open").length,
		[candidates],
	);
	const officialSourceHealth = useMemo(() => {
		const centralBanks = sourceHealth.filter((entry) => classifyOfficialSource(entry) === "cb");
		const sanctions = sourceHealth.filter((entry) => classifyOfficialSource(entry) === "sanctions");
		return { centralBanks, sanctions };
	}, [sourceHealth]);
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
				// keep local defaults
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
		setEvaluationLoading(true);
		setEvaluationError(null);
		void fetch("/api/geopolitical/evaluation", { cache: "no-store" })
			.then(async (response) => {
				if (!response.ok) throw new Error(`evaluation fetch failed (${response.status})`);
				const payload = (await response.json()) as {
					success?: boolean;
					summary?: GeoEvaluationSummary;
				};
				if (!cancelled) setEvaluationSummary(payload.summary ?? null);
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					setEvaluationError(error instanceof Error ? error.message : "evaluation fetch failed");
				}
			})
			.finally(() => {
				if (!cancelled) setEvaluationLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);
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
				// fallback to local heuristics
			})
			.finally(() => {
				if (!cancelled) setOverlayLoading(false);
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
		const severityWeight: Record<AlertSeverityThreshold, number> = {
			low: 1,
			medium: 2,
			high: 3,
			critical: 4,
		};
		const severityByValue: Record<number, AlertSeverityThreshold> = {
			1: "low",
			2: "medium",
			3: "high",
			4: "critical",
			5: "critical",
		};
		const thresholdWeight = severityWeight[alertSeverityThreshold];
		const matches = events.filter((event) => {
			const normalizedSeverity = severityByValue[event.severity] ?? "low";
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

	const effectiveReviewStats = evaluationSummary
		? {
				...reviewStats,
				...evaluationSummary.review,
				contradictionCreated: evaluationSummary.contradictions.created,
				contradictionResolved: evaluationSummary.contradictions.resolved,
			}
		: reviewStats;
	const effectiveCounts = evaluationSummary?.counts ?? {
		events: events.length,
		candidates: candidates.length,
		openCandidates,
		contradictions: 0,
		openContradictions: 0,
		timeline: timeline.length,
	};
	const effectiveAlertPreviewEvents = alertsPreviewResponse?.events?.slice(0, 5) ?? alertPreview;
	const handleExport = () => {
		setExportBusy(true);
		setExportMessage(null);
		void fetch("/api/geopolitical/export", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				format: selectedExportFormat,
				regionLabel: activeRegionLabel,
				includeItems: selectedExportFormat === "json",
			}),
		})
			.then(async (response) => {
				const payload = (await response.json()) as {
					success?: boolean;
					error?: string;
					filename?: string;
					mimeType?: string;
					content?: string;
				};
				if (!response.ok || !payload.success) {
					throw new Error(payload.error ?? `export failed (${response.status})`);
				}
				if (!payload.filename || !payload.mimeType || typeof payload.content !== "string") {
					throw new Error("export response incomplete");
				}
				downloadText(payload.filename, payload.content, payload.mimeType);
				setExportMessage(`Exported ${selectedExportFormat.toUpperCase()} snapshot`);
			})
			.catch((error: unknown) => {
				setExportMessage(error instanceof Error ? error.message : "export failed");
			})
			.finally(() => setExportBusy(false));
	};

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<div className="mb-2 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-semibold">Phase 12 Advanced (UI)</h2>
					<p className="text-xs text-muted-foreground">
						Alerts, exports, evaluation, central-bank/CBDC overlays (frontend scaffolding)
					</p>
				</div>
				<span className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
					v2.5 prep
				</span>
			</div>

			<div className="space-y-3">
				<section className="rounded border border-border bg-background p-2">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							12c Alerts
						</h3>
						<span className="text-[10px] text-muted-foreground">
							{policyLoading ? "Loading policy…" : "Policy + preview"}
						</span>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<label className="text-xs">
							<div className="mb-1 text-muted-foreground">Min severity</div>
							<select
								className="w-full rounded border border-border bg-background px-2 py-1"
								value={alertSeverityThreshold}
								onChange={(event) =>
									setAlertSeverityThreshold(event.target.value as AlertSeverityThreshold)
								}
							>
								<option value="low">low</option>
								<option value="medium">medium</option>
								<option value="high">high</option>
								<option value="critical">critical</option>
							</select>
						</label>
						<label className="text-xs">
							<div className="mb-1 text-muted-foreground">
								Min confidence ({Math.round(alertConfidenceThreshold * 100)}%)
							</div>
							<input
								type="range"
								min={0.4}
								max={0.99}
								step={0.01}
								value={alertConfidenceThreshold}
								onChange={(event) => setAlertConfidenceThreshold(Number(event.target.value))}
								className="w-full"
							/>
						</label>
						<label className="text-xs">
							<div className="mb-1 text-muted-foreground">
								Cooldown per region/category ({alertCooldownMinutes}m)
							</div>
							<input
								type="range"
								min={5}
								max={240}
								step={5}
								value={alertCooldownMinutes}
								onChange={(event) => setAlertCooldownMinutes(Number(event.target.value))}
								className="w-full"
							/>
						</label>
						<div className="space-y-1 text-xs">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={muteProfileEnabled}
									onChange={(event) => setMuteProfileEnabled(event.target.checked)}
								/>
								<span>Mute profile preview</span>
							</label>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={playbackAlertTieIn}
									onChange={(event) => setPlaybackAlertTieIn(event.target.checked)}
								/>
								<span>Use playback window for alert preview</span>
							</label>
						</div>
					</div>
					<div className="mt-2 rounded border border-dashed border-border px-2 py-2 text-xs">
						<div className="mb-1 font-medium">
							Preview matches (
							{alertsPreviewResponse?.eligibleAlerts ?? effectiveAlertPreviewEvents.length}/
							{alertsPreviewResponse?.totalEvents ?? events.length})
						</div>
						<div className="mb-2 text-[11px] text-muted-foreground">
							threshold matched: {alertsPreviewResponse?.thresholdMatchedEvents ?? "n/a"} ·
							suppressed: {alertsPreviewResponse?.suppressedAlerts ?? "n/a"}
						</div>
						{alertsLoading ? (
							<p className="text-muted-foreground">Loading alert preview…</p>
						) : alertsError ? (
							<p className="text-red-400">{alertsError}</p>
						) : effectiveAlertPreviewEvents.length === 0 ? (
							<p className="text-muted-foreground">No events match the current preview policy.</p>
						) : (
							<ul className="space-y-1 text-muted-foreground">
								{effectiveAlertPreviewEvents.map((event) => (
									<li key={event.id} className="truncate">
										S{event.severity} · {(event.confidence * 100).toFixed(0)}% · {event.title}
									</li>
								))}
							</ul>
						)}
					</div>
					<div className="mt-2 flex items-center gap-2">
						<button
							type="button"
							className="rounded border border-border px-2 py-1 text-xs hover:bg-muted/50 disabled:opacity-50"
							disabled={policySaveBusy}
							onClick={() => {
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
							}}
						>
							{policySaveBusy ? "Saving…" : "Save alert policy"}
						</button>
						{policyMessage ? (
							<span className="text-[11px] text-muted-foreground">{policyMessage}</span>
						) : null}
					</div>
				</section>

				<section className="rounded border border-border bg-background p-2">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							12d Exports
						</h3>
						<span className="text-[10px] text-muted-foreground">
							Server JSON/CSV - PNG/PDF later
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<select
							className="rounded border border-border bg-background px-2 py-1 text-xs"
							value={selectedExportFormat}
							onChange={(event) => setSelectedExportFormat(event.target.value as ExportFormat)}
						>
							<option value="json">JSON snapshot</option>
							<option value="csv">CSV summary</option>
						</select>
						<button
							type="button"
							className="rounded border border-border px-2 py-1 text-xs hover:bg-muted/50 disabled:opacity-50"
							disabled={exportBusy}
							onClick={handleExport}
						>
							{exportBusy ? "Exporting..." : `Export ${selectedExportFormat.toUpperCase()}`}
						</button>
						<button
							type="button"
							className="rounded border border-dashed border-border px-2 py-1 text-xs text-muted-foreground"
							disabled
							title="Phase 12d backend/browser integration (PNG/PDF snapshot) remains open"
						>
							PNG/PDF snapshot (later)
						</button>
						{exportMessage ? (
							<span className="text-[11px] text-muted-foreground">{exportMessage}</span>
						) : null}
					</div>
					<p className="mt-2 text-[11px] text-muted-foreground">
						JSON/CSV snapshots run through a transitional server export endpoint. Signed export
						jobs, PNG/PDF composition, and storage-backed exports remain backend work.
					</p>
				</section>

				<section className="rounded border border-border bg-background p-2">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							12f Evaluation Harness
						</h3>
						<span className="text-[10px] text-muted-foreground">
							{evaluationLoading ? "Loading…" : "API-backed preview"}
						</span>
					</div>
					{evaluationError ? (
						<p className="mb-2 text-[11px] text-red-400">{evaluationError}</p>
					) : null}
					<div className="grid gap-2 sm:grid-cols-2">
						<div className="rounded border border-border px-2 py-2 text-xs">
							<div className="text-muted-foreground">Review actions</div>
							<div className="mt-1 text-sm font-semibold">{effectiveReviewStats.reviewTotal}</div>
							<div className="mt-1 text-[11px] text-muted-foreground">
								A {Math.round(effectiveReviewStats.acceptRate * 100)}% · R{" "}
								{Math.round(effectiveReviewStats.rejectRate * 100)}% · S{" "}
								{Math.round(effectiveReviewStats.snoozeRate * 100)}%
							</div>
						</div>
						<div className="rounded border border-border px-2 py-2 text-xs">
							<div className="text-muted-foreground">Queue pressure</div>
							<div className="mt-1 text-sm font-semibold">{effectiveCounts.openCandidates}</div>
							<div className="mt-1 text-[11px] text-muted-foreground">
								open candidates · {effectiveCounts.candidates} total candidates
							</div>
						</div>
						<div className="rounded border border-border px-2 py-2 text-xs">
							<div className="text-muted-foreground">Contradictions</div>
							<div className="mt-1 text-sm font-semibold">
								{effectiveReviewStats.contradictionCreated}
							</div>
							<div className="mt-1 text-[11px] text-muted-foreground">
								resolved {effectiveReviewStats.contradictionResolved}
							</div>
						</div>
						<div className="rounded border border-border px-2 py-2 text-xs">
							<div className="text-muted-foreground">Timeline records</div>
							<div className="mt-1 text-sm font-semibold">{effectiveCounts.timeline}</div>
							<div className="mt-1 text-[11px] text-muted-foreground">
								Use Go timeline for evaluation exports later
							</div>
						</div>
					</div>
				</section>

				<section className="rounded border border-border bg-background p-2">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							12g Zentralbank / CBDC Layers
						</h3>
						<span className="text-[10px] text-muted-foreground">
							{overlayLoading ? "Loading…" : "Config + source summary"}
						</span>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<label className="flex items-center gap-2 text-xs">
							<input
								type="checkbox"
								checked={cbLayerEnabled}
								onChange={(event) => setCbLayerEnabled(event.target.checked)}
							/>
							<span>Rate decisions layer</span>
						</label>
						<label className="flex items-center gap-2 text-xs">
							<input
								type="checkbox"
								checked={cbdcLayerEnabled}
								onChange={(event) => setCbdcLayerEnabled(event.target.checked)}
							/>
							<span>CBDC status choropleth</span>
						</label>
						<label className="flex items-center gap-2 text-xs">
							<input
								type="checkbox"
								checked={dedollarizationLayerEnabled}
								onChange={(event) => setDedollarizationLayerEnabled(event.target.checked)}
							/>
							<span>De-dollarization trend arrows</span>
						</label>
						<label className="flex items-center gap-2 text-xs">
							<input
								type="checkbox"
								checked={financialOpennessLayerEnabled}
								onChange={(event) => setFinancialOpennessLayerEnabled(event.target.checked)}
							/>
							<span>Financial openness overlay</span>
						</label>
					</div>
					<div className="mt-2 flex items-center gap-2">
						<button
							type="button"
							className="rounded border border-border px-2 py-1 text-xs hover:bg-muted/50 disabled:opacity-50"
							disabled={overlaySaveBusy}
							onClick={() => {
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
										setOverlayMessage(
											error instanceof Error ? error.message : "overlay save failed",
										);
									})
									.finally(() => setOverlaySaveBusy(false));
							}}
						>
							{overlaySaveBusy ? "Saving…" : "Save overlay config"}
						</button>
						{overlayMessage ? (
							<span className="text-[11px] text-muted-foreground">{overlayMessage}</span>
						) : null}
					</div>
					<div className="mt-2 grid gap-2 sm:grid-cols-2">
						<div className="rounded border border-border px-2 py-2 text-xs">
							<div className="text-muted-foreground">Central-bank sources (health)</div>
							<div className="mt-1 text-sm font-semibold">
								{overlaySourceSummary?.centralBanks ?? officialSourceHealth.centralBanks.length}
							</div>
							<p className="mt-1 text-[11px] text-muted-foreground">
								{overlaySourceSummary
									? "Returned by overlay config endpoint (source-health backed)"
									: "Derived from current source-health feed names (heuristic)"}
							</p>
						</div>
						<div className="rounded border border-border px-2 py-2 text-xs">
							<div className="text-muted-foreground">Sanctions/official legal sources</div>
							<div className="mt-1 text-sm font-semibold">
								{overlaySourceSummary?.sanctions ?? officialSourceHealth.sanctions.length}
							</div>
							<p className="mt-1 text-[11px] text-muted-foreground">
								Phase 14 connectors should back these overlays with typed metadata
							</p>
						</div>
					</div>
				</section>
			</div>
		</section>
	);
}
