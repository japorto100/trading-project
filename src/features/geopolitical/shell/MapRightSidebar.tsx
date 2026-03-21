import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import { GeoInspectorWorkspace } from "@/features/geopolitical/shell/rail/GeoInspectorWorkspace";
import { GeoTimelineWorkspace } from "@/features/geopolitical/shell/rail/GeoTimelineWorkspace";
import type {
	GeoContextItem,
	GeoGameTheoryItem,
	GeoGameTheorySummary,
	GeoGraphResponse,
} from "@/features/geopolitical/shell/types";
import type {
	ContextSource,
	GeoReplayRangeMs,
	GeoWorkspaceTab,
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
	onRefreshWorkspace?: () => void;
	onRefreshRegionNews?: () => void;
	onRefreshContext?: () => void;
	onRefreshGameTheory?: () => void;
	workspaceTab: GeoWorkspaceTab;
	onWorkspaceTabChange: (next: GeoWorkspaceTab) => void;
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
	onRefreshWorkspace,
	onRefreshRegionNews,
	onRefreshContext,
	onRefreshGameTheory,
	workspaceTab,
	onWorkspaceTabChange,
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
	useEffect(() => {
		if (!showTimelinePanel && workspaceTab === "timeline") {
			onWorkspaceTabChange("inspector");
		}
	}, [onWorkspaceTabChange, showTimelinePanel, workspaceTab]);

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
						onWorkspaceTabChange(value);
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
						<GeoInspectorWorkspace
							isEarthContext={isEarthContext}
							error={error}
							busy={busy}
							showCandidateQueue={showCandidateQueue}
							candidates={candidates}
							onCandidateAction={onCandidateAction}
							onQuickImportCandidate={onQuickImportCandidate}
							onRefreshWorkspace={onRefreshWorkspace}
							onRefreshRegionNews={onRefreshRegionNews}
							onRefreshContext={onRefreshContext}
							onRefreshGameTheory={onRefreshGameTheory}
							activeRegionId={activeRegionId}
							activeRegionLabel={activeRegionLabel}
							news={news}
							onOpenFlatViewForRegion={onOpenFlatViewForRegion}
							graph={graph}
							gameTheoryEnabled={gameTheoryEnabled}
							gameTheoryLoading={gameTheoryLoading}
							gameTheoryItems={gameTheoryItems}
							gameTheorySummary={gameTheorySummary}
							contextSource={contextSource}
							onContextSourceChange={onContextSourceChange}
							contextItems={contextItems}
							contextLoading={contextLoading}
							sourceHealth={sourceHealth}
							timeline={timeline}
							events={events}
						/>
					</ScrollArea>
				</TabsContent>

				{showTimelinePanel ? (
					<TabsContent
						value="timeline"
						className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden"
					>
						<ScrollArea className="h-full">
							<GeoTimelineWorkspace
								timeline={timeline}
								events={events}
								selectedTimelineId={selectedTimelineId}
								storyFocusPresets={storyFocusPresets}
								activeStoryFocusPresetId={activeStoryFocusPresetId}
								activeRegionId={activeRegionId}
								timelineViewRangeMs={timelineViewRangeMs}
								timelineSelectedTimeMs={timelineSelectedTimeMs}
								activeReplayRangeMs={activeReplayRangeMs}
								onTimelineViewRangeChange={onTimelineViewRangeChange}
								onTimelineSelectedTimeChange={onTimelineSelectedTimeChange}
								onActiveReplayRangeChange={onActiveReplayRangeChange}
								onSelectEventFromTimeline={onSelectEventFromTimeline}
								onOpenFlatViewFromTimeline={onOpenFlatViewFromTimeline}
								onTimelineReset={onTimelineReset}
								onSelectedTimelineIdChange={onSelectedTimelineIdChange}
								onStoryFocusPresetsChange={onStoryFocusPresetsChange}
								onActiveStoryFocusPresetIdChange={onActiveStoryFocusPresetIdChange}
								onActiveRegionIdChange={onActiveRegionIdChange}
							/>
						</ScrollArea>
					</TabsContent>
				) : null}
			</Tabs>
		</aside>
	);
}
