"use client";

import { useMemo } from "react";
import { usePhase12AlertsPolicy } from "@/features/geopolitical/phase12/hooks/usePhase12AlertsPolicy";
import { usePhase12Evaluation } from "@/features/geopolitical/phase12/hooks/usePhase12Evaluation";
import { usePhase12Export } from "@/features/geopolitical/phase12/hooks/usePhase12Export";
import { usePhase12OverlayConfig } from "@/features/geopolitical/phase12/hooks/usePhase12OverlayConfig";
import { Phase12AlertsSection } from "@/features/geopolitical/phase12/sections/Phase12AlertsSection";
import { Phase12EvaluationSection } from "@/features/geopolitical/phase12/sections/Phase12EvaluationSection";
import { Phase12ExportsSection } from "@/features/geopolitical/phase12/sections/Phase12ExportsSection";
import { Phase12OverlaysSection } from "@/features/geopolitical/phase12/sections/Phase12OverlaysSection";
import type { SourceHealthResponse } from "@/features/geopolitical/store";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";

interface Phase12AdvancedPanelProps {
	activeRegionLabel: string;
	events: GeoEvent[];
	candidates: GeoCandidate[];
	timeline: GeoTimelineEntry[];
	sourceHealth: SourceHealthResponse["entries"];
}

export function Phase12AdvancedPanel({
	activeRegionLabel,
	events,
	candidates,
	timeline,
	sourceHealth,
}: Phase12AdvancedPanelProps) {
	const alertsPolicy = usePhase12AlertsPolicy(events);
	const evaluation = usePhase12Evaluation(events, candidates, timeline);
	const overlays = usePhase12OverlayConfig(sourceHealth);
	const exportState = usePhase12Export();

	const effectiveAlertPreviewEvents = useMemo(
		() => alertsPolicy.alertsPreviewResponse?.events?.slice(0, 5) ?? alertsPolicy.alertPreview,
		[alertsPolicy.alertPreview, alertsPolicy.alertsPreviewResponse],
	);

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
				<Phase12AlertsSection
					policyLoading={alertsPolicy.policyLoading}
					alertSeverityThreshold={alertsPolicy.alertSeverityThreshold}
					setAlertSeverityThreshold={alertsPolicy.setAlertSeverityThreshold}
					alertConfidenceThreshold={alertsPolicy.alertConfidenceThreshold}
					setAlertConfidenceThreshold={alertsPolicy.setAlertConfidenceThreshold}
					alertCooldownMinutes={alertsPolicy.alertCooldownMinutes}
					setAlertCooldownMinutes={alertsPolicy.setAlertCooldownMinutes}
					muteProfileEnabled={alertsPolicy.muteProfileEnabled}
					setMuteProfileEnabled={alertsPolicy.setMuteProfileEnabled}
					playbackAlertTieIn={alertsPolicy.playbackAlertTieIn}
					setPlaybackAlertTieIn={alertsPolicy.setPlaybackAlertTieIn}
					alertsLoading={alertsPolicy.alertsLoading}
					alertsError={alertsPolicy.alertsError}
					previewEvents={effectiveAlertPreviewEvents}
					previewEligibleAlerts={alertsPolicy.alertsPreviewResponse?.eligibleAlerts}
					previewTotalEvents={alertsPolicy.alertsPreviewResponse?.totalEvents ?? events.length}
					previewThresholdMatchedEvents={alertsPolicy.alertsPreviewResponse?.thresholdMatchedEvents}
					previewSuppressedAlerts={alertsPolicy.alertsPreviewResponse?.suppressedAlerts}
					policySaveBusy={alertsPolicy.policySaveBusy}
					policyMessage={alertsPolicy.policyMessage}
					onSavePolicy={alertsPolicy.saveAlertPolicy}
				/>

				<Phase12ExportsSection
					selectedExportFormat={exportState.selectedExportFormat}
					setSelectedExportFormat={exportState.setSelectedExportFormat}
					exportBusy={exportState.exportBusy}
					exportMessage={exportState.exportMessage}
					onExport={() => exportState.runExport(activeRegionLabel)}
				/>

				<Phase12EvaluationSection
					evaluationLoading={evaluation.evaluationLoading}
					evaluationError={evaluation.evaluationError}
					reviewTotal={evaluation.effectiveReviewStats.reviewTotal}
					acceptRate={evaluation.effectiveReviewStats.acceptRate}
					rejectRate={evaluation.effectiveReviewStats.rejectRate}
					snoozeRate={evaluation.effectiveReviewStats.snoozeRate}
					openCandidates={evaluation.effectiveCounts.openCandidates}
					totalCandidates={evaluation.effectiveCounts.candidates}
					contradictionCreated={evaluation.effectiveReviewStats.contradictionCreated}
					contradictionResolved={evaluation.effectiveReviewStats.contradictionResolved}
					timelineCount={evaluation.effectiveCounts.timeline}
				/>

				<Phase12OverlaysSection
					overlayLoading={overlays.overlayLoading}
					cbLayerEnabled={overlays.cbLayerEnabled}
					setCbLayerEnabled={overlays.setCbLayerEnabled}
					cbdcLayerEnabled={overlays.cbdcLayerEnabled}
					setCbdcLayerEnabled={overlays.setCbdcLayerEnabled}
					dedollarizationLayerEnabled={overlays.dedollarizationLayerEnabled}
					setDedollarizationLayerEnabled={overlays.setDedollarizationLayerEnabled}
					financialOpennessLayerEnabled={overlays.financialOpennessLayerEnabled}
					setFinancialOpennessLayerEnabled={overlays.setFinancialOpennessLayerEnabled}
					overlaySaveBusy={overlays.overlaySaveBusy}
					overlayMessage={overlays.overlayMessage}
					onSaveOverlay={overlays.saveOverlayConfig}
					centralBankSources={
						overlays.overlaySourceSummary?.centralBanks ??
						overlays.officialSourceHealth.centralBanks.length
					}
					sanctionsSources={
						overlays.overlaySourceSummary?.sanctions ??
						overlays.officialSourceHealth.sanctions.length
					}
					usesEndpointSummary={Boolean(overlays.overlaySourceSummary)}
				/>
			</div>
		</section>
	);
}
