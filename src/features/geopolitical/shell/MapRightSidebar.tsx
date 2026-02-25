import { CandidateQueue } from "@/features/geopolitical/CandidateQueue";
import { EventInspector } from "@/features/geopolitical/EventInspector";
import { GeoContradictionsPanel } from "@/features/geopolitical/GeoContradictionsPanel";
import { GeoPulseInsightsPanel } from "@/features/geopolitical/GeoPulseInsightsPanel";
import { GeopoliticalContextPanel } from "@/features/geopolitical/GeopoliticalContextPanel";
import { GeopoliticalGameTheoryPanel } from "@/features/geopolitical/GeopoliticalGameTheoryPanel";
import { Phase12AdvancedPanel } from "@/features/geopolitical/Phase12AdvancedPanel";
import { SourceHealthPanel } from "@/features/geopolitical/SourceHealthPanel";
import { CreateMarkerPanel } from "@/features/geopolitical/shell/CreateMarkerPanel";
import { EditMarkerPanel } from "@/features/geopolitical/shell/EditMarkerPanel";
import { MarkerListPanel } from "@/features/geopolitical/shell/MarkerListPanel";
import { RegionNewsPanel } from "@/features/geopolitical/shell/RegionNewsPanel";
import type {
	EditFormState,
	GeoContextItem,
	GeoGameTheoryItem,
	GeoGameTheorySummary,
	GeoGraphResponse,
} from "@/features/geopolitical/shell/types";
import type { ContextSource, SourceHealthResponse } from "@/features/geopolitical/store";
import type {
	GeoCandidate,
	GeoConfidence,
	GeoEvent,
	GeoSeverity,
	GeoTimelineEntry,
} from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

interface MapRightSidebarProps {
	error: string | null;
	pendingPoint: { lat: number; lng: number } | null;
	draftTitle: string;
	draftSummary: string;
	draftNote: string;
	draftSeverity: GeoSeverity;
	draftConfidence: GeoConfidence;
	drawingMode: "marker" | "line" | "polygon" | "text";
	busy: boolean;
	onDraftTitleChange: (value: string) => void;
	onDraftSummaryChange: (value: string) => void;
	onDraftNoteChange: (value: string) => void;
	onDraftSeverityChange: (value: GeoSeverity) => void;
	onDraftConfidenceChange: (value: GeoConfidence) => void;
	onSetPoint: (coords: { lat: number; lng: number }) => void;
	onCreateMarker: () => void;
	onResetCreateForm: () => void;
	selectedEvent: GeoEvent | null;
	editForm: EditFormState;
	onEditFormChange: (next: EditFormState) => void;
	onSaveMarker: () => void;
	onDeleteMarker: () => void;
	onAddSourceToSelectedEvent: (payload: {
		provider: string;
		url: string;
		title?: string;
		sourceTier?: "A" | "B" | "C";
	}) => void;
	onAddAssetToSelectedEvent: (payload: {
		symbol: string;
		assetClass: "equity" | "etf" | "fx" | "commodity" | "crypto" | "index";
		relation: "beneficiary" | "exposed" | "hedge" | "uncertain";
		rationale?: string;
	}) => void;
	showCandidateQueue: boolean;
	candidates: GeoCandidate[];
	onCandidateAction: (candidateId: string, action: "accept" | "reject" | "snooze") => void;
	activeRegionLabel: string;
	news: MarketNewsArticle[];
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
	selectedEventId: string | null;
	onSelectEvent: (eventId: string) => void;
}

export function MapRightSidebar({
	error,
	pendingPoint,
	draftTitle,
	draftSummary,
	draftNote,
	draftSeverity,
	draftConfidence,
	drawingMode,
	busy,
	onDraftTitleChange,
	onDraftSummaryChange,
	onDraftNoteChange,
	onDraftSeverityChange,
	onDraftConfidenceChange,
	onSetPoint,
	onCreateMarker,
	onResetCreateForm,
	selectedEvent,
	editForm,
	onEditFormChange,
	onSaveMarker,
	onDeleteMarker,
	onAddSourceToSelectedEvent,
	onAddAssetToSelectedEvent,
	showCandidateQueue,
	candidates,
	onCandidateAction,
	activeRegionLabel,
	news,
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
	selectedEventId,
	onSelectEvent,
}: MapRightSidebarProps) {
	return (
		<aside className="w-[420px] shrink-0 overflow-y-auto border-l border-border p-3 space-y-3">
			{error && (
				<div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
					{error}
				</div>
			)}

			<CreateMarkerPanel
				pendingPoint={pendingPoint}
				draftTitle={draftTitle}
				draftSummary={draftSummary}
				draftNote={draftNote}
				draftSeverity={draftSeverity}
				draftConfidence={draftConfidence}
				drawingMode={drawingMode}
				busy={busy}
				onDraftTitleChange={onDraftTitleChange}
				onDraftSummaryChange={onDraftSummaryChange}
				onDraftNoteChange={onDraftNoteChange}
				onDraftSeverityChange={onDraftSeverityChange}
				onDraftConfidenceChange={onDraftConfidenceChange}
				onSetPoint={onSetPoint}
				onCreate={onCreateMarker}
				onClear={onResetCreateForm}
			/>

			<EditMarkerPanel
				selectedEvent={selectedEvent}
				editForm={editForm}
				busy={busy}
				onEditFormChange={onEditFormChange}
				onSave={onSaveMarker}
				onDelete={onDeleteMarker}
			/>

			<EventInspector
				event={selectedEvent}
				busy={busy}
				onAddSource={onAddSourceToSelectedEvent}
				onAddAsset={onAddAssetToSelectedEvent}
			/>

			{showCandidateQueue ? (
				<CandidateQueue
					candidates={candidates}
					busy={busy}
					onAccept={(candidateId) => onCandidateAction(candidateId, "accept")}
					onReject={(candidateId) => onCandidateAction(candidateId, "reject")}
					onSnooze={(candidateId) => onCandidateAction(candidateId, "snooze")}
				/>
			) : (
				<section className="rounded-md border border-border bg-card p-3">
					<h2 className="text-sm font-semibold">Candidate Queue</h2>
					<p className="mt-1 text-xs text-muted-foreground">Hidden (toggle with key C)</p>
				</section>
			)}

			<GeoContradictionsPanel />

			<Phase12AdvancedPanel
				activeRegionLabel={activeRegionLabel}
				events={events}
				candidates={candidates}
				timeline={timeline}
				sourceHealth={sourceHealth}
			/>

			<RegionNewsPanel activeRegionLabel={activeRegionLabel} news={news} />

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

			<MarkerListPanel
				events={events}
				selectedEventId={selectedEventId}
				onSelectEvent={onSelectEvent}
			/>
		</aside>
	);
}
