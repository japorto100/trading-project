import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateQueue } from "@/features/geopolitical/CandidateQueue";
import { GeoContradictionsPanel } from "@/features/geopolitical/GeoContradictionsPanel";
import { GeoPulseInsightsPanel } from "@/features/geopolitical/GeoPulseInsightsPanel";
import { GeopoliticalContextPanel } from "@/features/geopolitical/GeopoliticalContextPanel";
import { GeopoliticalGameTheoryPanel } from "@/features/geopolitical/GeopoliticalGameTheoryPanel";
import type { GeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import { Phase12AdvancedPanel } from "@/features/geopolitical/Phase12AdvancedPanel";
import { SourceHealthPanel } from "@/features/geopolitical/SourceHealthPanel";
import { MapTimelinePanel } from "@/features/geopolitical/shell/MapTimelinePanel";
import { RegionNewsPanel } from "@/features/geopolitical/shell/RegionNewsPanel";
import type {
	GeoContextItem,
	GeoGameTheoryItem,
	GeoGameTheorySummary,
	GeoGraphResponse,
} from "@/features/geopolitical/shell/types";
import type {
	ContextSource,
	GeoReplayRangeMs,
	SourceHealthResponse,
} from "@/features/geopolitical/store";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

interface MapRightSidebarProps {
	isEarthContext: boolean;
	error: string | null;
	busy: boolean;
	showCandidateQueue: boolean;
	showTimelinePanel: boolean;
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
	selectedTimelineId: string | null;
	storyFocusPresets: GeoStoryFocusPreset[];
	activeStoryFocusPresetId: string | null;
	events: GeoEvent[];
	timelineViewRangeMs: GeoReplayRangeMs | null;
	timelineSelectedTimeMs: number | null;
	activeReplayRangeMs: GeoReplayRangeMs | null;
	onTimelineViewRangeChange: (next: GeoReplayRangeMs | null) => void;
	onTimelineSelectedTimeChange: (next: number | null) => void;
	onActiveReplayRangeChange: (next: GeoReplayRangeMs | null) => void;
	onSelectEventFromTimeline?: (eventId: string) => void;
	onOpenFlatViewFromTimeline?: (eventId: string) => void;
	onTimelineReset?: () => void;
	onSelectedTimelineIdChange: (next: string | null) => void;
	onStoryFocusPresetsChange: (next: GeoStoryFocusPreset[]) => void;
	onActiveStoryFocusPresetIdChange: (next: string | null) => void;
	onActiveRegionIdChange: (next: string) => void;
}

export function MapRightSidebar({
	isEarthContext,
	error,
	busy,
	showCandidateQueue,
	showTimelinePanel,
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
	selectedTimelineId,
	storyFocusPresets,
	activeStoryFocusPresetId,
	events,
	timelineViewRangeMs,
	timelineSelectedTimeMs,
	activeReplayRangeMs,
	onTimelineViewRangeChange,
	onTimelineSelectedTimeChange,
	onActiveReplayRangeChange,
	onSelectEventFromTimeline,
	onOpenFlatViewFromTimeline,
	onTimelineReset,
	onSelectedTimelineIdChange,
	onStoryFocusPresetsChange,
	onActiveStoryFocusPresetIdChange,
	onActiveRegionIdChange,
}: MapRightSidebarProps) {
	const [workspaceTab, setWorkspaceTab] = useState<"inspector" | "timeline">("inspector");

	useEffect(() => {
		if (!showTimelinePanel && workspaceTab === "timeline") {
			setWorkspaceTab("inspector");
		}
	}, [showTimelinePanel, workspaceTab]);

	return (
		<aside className="w-full flex flex-col h-full overflow-hidden bg-transparent">
			<div className="flex items-center justify-between border-b border-border bg-accent/10 h-10 px-3 shrink-0">
				<div className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
					Intelligence Workspace
				</div>
			</div>
			<Tabs
				value={workspaceTab}
				onValueChange={(value) => {
					if (value === "inspector" || value === "timeline") {
						setWorkspaceTab(value);
					}
				}}
				className="flex min-h-0 flex-1 flex-col"
			>
				<div className="border-b border-border/70 px-3 py-2">
					<TabsList className="h-auto w-full justify-start bg-transparent p-0">
						<TabsTrigger value="inspector" className="text-xs">
							Inspector
						</TabsTrigger>
						{showTimelinePanel ? (
							<TabsTrigger value="timeline" className="text-xs">
								Timeline
							</TabsTrigger>
						) : null}
					</TabsList>
				</div>

				<TabsContent value="inspector" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
					<ScrollArea className="h-full">
						<div className="p-3 space-y-3">
							{error && (
								<div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
									{error}
								</div>
							)}

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
								<section className="rounded-md border border-border bg-card p-3">
									<h2 className="text-sm font-semibold">Candidate Queue</h2>
									<p className="mt-1 text-xs text-muted-foreground">Hidden (toggle with key C)</p>
								</section>
							)}

							{isEarthContext ? (
								<>
									<GeoContradictionsPanel />

									<Phase12AdvancedPanel
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
									/>

									<GeoPulseInsightsPanel graph={graph} />

									<GeopoliticalGameTheoryPanel
										enabled={gameTheoryEnabled}
										loading={gameTheoryLoading}
										items={gameTheoryItems}
										summary={gameTheorySummary}
									/>

									<GeopoliticalContextPanel
										source={contextSource}
										items={contextItems}
										loading={contextLoading}
										onSourceChange={onContextSourceChange}
									/>

									<SourceHealthPanel entries={sourceHealth} />
								</>
							) : null}
						</div>
					</ScrollArea>
				</TabsContent>

				{showTimelinePanel ? (
					<TabsContent
						value="timeline"
						className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden"
					>
						<ScrollArea className="h-full">
							<div className="p-3">
								{timeline.length === 0 ? (
									<section className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
										No timeline entries available.
									</section>
								) : (
									<MapTimelinePanel
										timeline={timeline.slice(0, 80)}
										events={events}
										selectedTimelineId={selectedTimelineId}
										storyFocusPresets={storyFocusPresets}
										activeStoryFocusPresetId={activeStoryFocusPresetId}
										activeRegionId={activeRegionId}
										viewRangeMs={timelineViewRangeMs}
										selectedTimeMs={timelineSelectedTimeMs}
										activeReplayRangeMs={activeReplayRangeMs}
										onViewRangeChange={onTimelineViewRangeChange}
										onSelectedTimeChange={onTimelineSelectedTimeChange}
										onActiveReplayRangeChange={onActiveReplayRangeChange}
										onSelectEventFromTimeline={onSelectEventFromTimeline}
										onOpenFlatViewFromTimeline={onOpenFlatViewFromTimeline}
										onTimelineReset={onTimelineReset}
										onSelectedTimelineIdChange={onSelectedTimelineIdChange}
										onStoryFocusPresetsChange={onStoryFocusPresetsChange}
										onActiveStoryFocusPresetIdChange={onActiveStoryFocusPresetIdChange}
										onActiveRegionIdChange={onActiveRegionIdChange}
									/>
								)}
							</div>
						</ScrollArea>
					</TabsContent>
				) : null}
			</Tabs>
		</aside>
	);
}
