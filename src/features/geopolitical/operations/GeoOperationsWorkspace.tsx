"use client";

import { useMemo } from "react";
import { useGeoAlertPolicy } from "@/features/geopolitical/operations/hooks/useGeoAlertPolicy";
import { useGeoEvaluation } from "@/features/geopolitical/operations/hooks/useGeoEvaluation";
import { useGeoExport } from "@/features/geopolitical/operations/hooks/useGeoExport";
import { useGeoStrategicOverlays } from "@/features/geopolitical/operations/hooks/useGeoStrategicOverlays";
import { GeoAlertPolicySection } from "@/features/geopolitical/operations/sections/GeoAlertPolicySection";
import { GeoEvaluationSection } from "@/features/geopolitical/operations/sections/GeoEvaluationSection";
import { GeoExportsSection } from "@/features/geopolitical/operations/sections/GeoExportsSection";
import { GeoStrategicOverlaysSection } from "@/features/geopolitical/operations/sections/GeoStrategicOverlaysSection";
import { GeoPanelFrame } from "@/features/geopolitical/shell/panels/GeoPanelFrame";
import type { SourceHealthResponse } from "@/features/geopolitical/store";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";

interface GeoOperationsWorkspaceProps {
	activeRegionLabel: string;
	events: GeoEvent[];
	candidates: GeoCandidate[];
	timeline: GeoTimelineEntry[];
	sourceHealth: SourceHealthResponse["entries"];
}

function GeoAlertPolicyPanel({
	effectiveAlertPreviewEvents,
	events,
	alertsPolicy,
}: {
	effectiveAlertPreviewEvents: GeoEvent[];
	events: GeoEvent[];
	alertsPolicy: ReturnType<typeof useGeoAlertPolicy>;
}) {
	return (
		<GeoPanelFrame
			title="Alert Policy"
			description="Thresholds, cooldowns and preview behavior for analyst alerts."
		>
			<GeoAlertPolicySection
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
		</GeoPanelFrame>
	);
}

function GeoExportOperationsPanel({
	activeRegionLabel,
	exportState,
}: {
	activeRegionLabel: string;
	exportState: ReturnType<typeof useGeoExport>;
}) {
	return (
		<GeoPanelFrame
			title="Export Operations"
			description="Current workspace export for artifact capture and handoff."
		>
			<GeoExportsSection
				selectedExportFormat={exportState.selectedExportFormat}
				setSelectedExportFormat={exportState.setSelectedExportFormat}
				exportBusy={exportState.exportBusy}
				exportMessage={exportState.exportMessage}
				onExport={() => exportState.runExport(activeRegionLabel)}
			/>
		</GeoPanelFrame>
	);
}

function GeoEvaluationPanel({ evaluation }: { evaluation: ReturnType<typeof useGeoEvaluation> }) {
	return (
		<GeoPanelFrame
			title="Evaluation"
			description="Review throughput, contradiction handling and analyst decision quality."
		>
			<GeoEvaluationSection
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
		</GeoPanelFrame>
	);
}

function GeoStrategicOverlaysPanel({
	overlays,
}: {
	overlays: ReturnType<typeof useGeoStrategicOverlays>;
}) {
	return (
		<GeoPanelFrame
			title="Strategic Overlays"
			description="Central bank, CBDC and dedollarization overlays for regional context."
		>
			<GeoStrategicOverlaysSection
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
					overlays.overlaySourceSummary?.sanctions ?? overlays.officialSourceHealth.sanctions.length
				}
				usesEndpointSummary={Boolean(overlays.overlaySourceSummary)}
			/>
		</GeoPanelFrame>
	);
}

export function GeoOperationsWorkspace({
	activeRegionLabel,
	events,
	candidates,
	timeline,
	sourceHealth,
}: GeoOperationsWorkspaceProps) {
	const alertsPolicy = useGeoAlertPolicy(events);
	const evaluation = useGeoEvaluation(events, candidates, timeline);
	const overlays = useGeoStrategicOverlays(sourceHealth);
	const exportState = useGeoExport();

	const effectiveAlertPreviewEvents = useMemo(
		() => alertsPolicy.alertsPreviewResponse?.events?.slice(0, 5) ?? alertsPolicy.alertPreview,
		[alertsPolicy.alertPreview, alertsPolicy.alertsPreviewResponse],
	);

	return (
		<>
			<GeoAlertPolicyPanel
				effectiveAlertPreviewEvents={effectiveAlertPreviewEvents}
				events={events}
				alertsPolicy={alertsPolicy}
			/>
			<GeoExportOperationsPanel activeRegionLabel={activeRegionLabel} exportState={exportState} />
			<GeoEvaluationPanel evaluation={evaluation} />
			<GeoStrategicOverlaysPanel overlays={overlays} />
		</>
	);
}
