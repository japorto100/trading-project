"use client";

import { CandidateQueue } from "@/features/geopolitical/CandidateQueue";
import { GeoContradictionsPanel } from "@/features/geopolitical/contradictions/GeoContradictionsPanel";
import { GeoPulseInsightsPanel } from "@/features/geopolitical/GeoPulseInsightsPanel";
import { GeopoliticalContextPanel } from "@/features/geopolitical/GeopoliticalContextPanel";
import { GeopoliticalGameTheoryPanel } from "@/features/geopolitical/GeopoliticalGameTheoryPanel";
import { GeoOperationsWorkspace } from "@/features/geopolitical/operations/GeoOperationsWorkspace";
import { SourceHealthPanel } from "@/features/geopolitical/SourceHealthPanel";
import { GeoPanelFrame } from "@/features/geopolitical/shell/panels/GeoPanelFrame";
import { GeoPanelStateNotice } from "@/features/geopolitical/shell/panels/GeoPanelStateNotice";
import { RegionNewsPanel } from "@/features/geopolitical/shell/RegionNewsPanel";
import type {
	GeoContextItem,
	GeoGameTheoryItem,
	GeoGameTheorySummary,
	GeoGraphResponse,
} from "@/features/geopolitical/shell/types";
import type { ContextSource, SourceHealthResponse } from "@/features/geopolitical/store";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

interface GeoInspectorWorkspaceProps {
	isEarthContext: boolean;
	error: string | null;
	busy: boolean;
	showCandidateQueue: boolean;
	candidates: GeoCandidate[];
	onCandidateAction: (
		candidateId: string,
		action: "accept" | "reject" | "snooze" | "reclassify",
	) => void;
	onQuickImportCandidate: (rawText: string) => void;
	activeRegionId: string;
	activeRegionLabel: string;
	news: MarketNewsArticle[];
	onOpenFlatViewForRegion?: (regionId: string) => void;
	graph: GeoGraphResponse | null;
	gameTheoryEnabled: boolean;
	gameTheoryLoading: boolean;
	gameTheoryItems: GeoGameTheoryItem[];
	gameTheorySummary: GeoGameTheorySummary | null;
	contextSource: ContextSource;
	onContextSourceChange: (source: ContextSource) => void;
	contextItems: GeoContextItem[];
	contextLoading: boolean;
	sourceHealth: SourceHealthResponse["entries"];
	timeline: GeoTimelineEntry[];
	events: GeoEvent[];
	onRefreshWorkspace?: () => void;
	onRefreshRegionNews?: () => void;
	onRefreshContext?: () => void;
	onRefreshGameTheory?: () => void;
}

export function GeoInspectorWorkspace({
	isEarthContext,
	error,
	busy,
	showCandidateQueue,
	candidates,
	onCandidateAction,
	onQuickImportCandidate,
	activeRegionId,
	activeRegionLabel,
	news,
	onOpenFlatViewForRegion,
	graph,
	gameTheoryEnabled,
	gameTheoryLoading,
	gameTheoryItems,
	gameTheorySummary,
	contextSource,
	onContextSourceChange,
	contextItems,
	contextLoading,
	sourceHealth,
	timeline,
	events,
	onRefreshWorkspace,
	onRefreshRegionNews,
	onRefreshContext,
	onRefreshGameTheory,
}: GeoInspectorWorkspaceProps) {
	return (
		<div className="p-3 space-y-3">
			{error ? (
				<GeoPanelFrame
					title="Workspace Error"
					status="unavailable"
					className="border-red-500/40 bg-red-500/10"
					bodyClassName="mt-0"
				>
					<GeoPanelStateNotice
						message={error}
						tone="error"
						onRetry={onRefreshWorkspace}
						retryLabel="Reload workspace"
					/>
				</GeoPanelFrame>
			) : null}

			{showCandidateQueue ? (
				<CandidateQueue
					candidates={candidates}
					busy={busy}
					onAccept={(candidateId) => onCandidateAction(candidateId, "accept")}
					onReject={(candidateId) => onCandidateAction(candidateId, "reject")}
					onSnooze={(candidateId) => onCandidateAction(candidateId, "snooze")}
					onReclassify={(candidateId) => onCandidateAction(candidateId, "reclassify")}
					onQuickImport={onQuickImportCandidate}
				/>
			) : (
				<GeoPanelFrame title="Candidate Queue" description="Hidden (toggle with key C)">
					<div />
				</GeoPanelFrame>
			)}

			{isEarthContext ? (
				<>
					<GeoContradictionsPanel />

					<GeoOperationsWorkspace
						activeRegionLabel={activeRegionLabel}
						events={events}
						candidates={candidates}
						timeline={timeline}
						sourceHealth={sourceHealth}
					/>

					<RegionNewsPanel
						activeRegionId={activeRegionId}
						activeRegionLabel={activeRegionLabel}
						news={news}
						onOpenFlatViewForRegion={onOpenFlatViewForRegion}
						onRetry={onRefreshRegionNews}
					/>

					<GeoPulseInsightsPanel graph={graph} onRetry={onRefreshWorkspace} />

					<GeopoliticalGameTheoryPanel
						enabled={gameTheoryEnabled}
						loading={gameTheoryLoading}
						items={gameTheoryItems}
						summary={gameTheorySummary}
						onRetry={onRefreshGameTheory}
					/>

					<GeopoliticalContextPanel
						source={contextSource}
						items={contextItems}
						loading={contextLoading}
						onSourceChange={onContextSourceChange}
						onRetry={onRefreshContext}
					/>

					<SourceHealthPanel entries={sourceHealth} onRetry={onRefreshWorkspace} />
				</>
			) : null}
		</div>
	);
}
