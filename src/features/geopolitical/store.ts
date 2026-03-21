"use client";

import { create } from "zustand";
import type { DrawingMode } from "@/features/geopolitical/drawing/types";
import type { GeoFlatViewHandoff } from "@/features/geopolitical/flat-view/flat-view-handoff";
import {
	buildGeoFlatViewStateFromHandoff,
	type GeoFlatViewState,
} from "@/features/geopolitical/flat-view/flat-view-state";
import type { GeoStoryFocusPreset } from "@/features/geopolitical/geo-story-focus";
import {
	buildGeoMultiSelectionState,
	type GeoMultiSelectionMode,
} from "@/features/geopolitical/multi-selection-contract";
import {
	DEFAULT_EDIT_FORM,
	type EditFormState,
	type GeoContextItem,
	type GeoGameTheoryItem,
	type GeoGameTheorySummary,
	type GeoGraphResponse,
	type SourceHealthResponse,
} from "@/features/geopolitical/shell/types";
import type {
	GeoCandidate,
	GeoConfidence,
	GeoDrawing,
	GeoEvent,
	GeoRegion,
	GeoSeverity,
	GeoTimelineEntry,
} from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

export type EventsSource = "local" | "acled" | "gdelt";
export type ContextSource = "all" | "cfr" | "crisiswatch";
export type GeoMapBody = "earth" | "moon";
export type GeoMapViewMode = "globe" | "flat";
export type GeoEarthChoroplethMode = "severity" | "regime" | "macro";
export type GeoReplayRangeMs = [number, number];
export type GeoWorkspaceTab = "inspector" | "timeline";
export interface GeoLatLngPoint {
	lat: number;
	lng: number;
}

type Updater<T> = T | ((previous: T) => T);

function resolveUpdater<T>(previous: T, next: Updater<T>): T {
	return typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
}

interface GeoMapWorkspaceState {
	events: GeoEvent[];
	candidates: GeoCandidate[];
	timeline: GeoTimelineEntry[];
	drawings: GeoDrawing[];
	regions: GeoRegion[];
	news: MarketNewsArticle[];
	sourceHealth: SourceHealthResponse["entries"];
	graph: GeoGraphResponse | null;
	contextItems: GeoContextItem[];
	contextLoading: boolean;
	gameTheoryItems: GeoGameTheoryItem[];
	gameTheorySummary: GeoGameTheorySummary | null;
	gameTheoryLoading: boolean;
	loading: boolean;
	busy: boolean;
	error: string | null;
	drawingMode: DrawingMode;
	drawingTextLabel: string;
	drawingColor: string;
	pendingLineStart: GeoLatLngPoint | null;
	pendingPolygonPoints: GeoLatLngPoint[];
	pendingPoint: GeoLatLngPoint | null;
	draftTitle: string;
	draftSummary: string;
	draftNote: string;
	draftSeverity: GeoSeverity;
	draftConfidence: GeoConfidence;
	editForm: EditFormState;
	canUndoDrawings: boolean;
	canRedoDrawings: boolean;
	selectedSymbol: string;
	selectedEventId: string | null;
	selectedEventIds: string[];
	selectedDrawingId: string | null;
	selectedTimelineId: string | null;
	storyFocusPresets: GeoStoryFocusPreset[];
	activeStoryFocusPresetId: string | null;
	pendingFlatViewHandoff: GeoFlatViewHandoff | null;
	flatViewState: GeoFlatViewState | null;
	activeRegionId: string;
	searchQuery: string;
	minSeverityFilter: number;
	eventsSource: EventsSource;
	contextSource: ContextSource;
	acledCountryFilter: string;
	acledRegionFilter: string;
	acledEventTypeFilter: string;
	acledSubEventTypeFilter: string;
	acledFromFilter: string;
	acledToFilter: string;
	acledPage: number;
	acledPageSize: number;
	acledTotal: number;
	acledHasMore: boolean;
	showCandidateQueue: boolean;
	showRegionLayer: boolean;
	showHeatmap: boolean;
	showSoftSignals: boolean;
	showFiltersToolbar: boolean;
	showBodyLayerLegend: boolean;
	showTimelinePanel: boolean;
	workspaceTab: GeoWorkspaceTab;
	timelineViewRangeMs: GeoReplayRangeMs | null;
	timelineSelectedTimeMs: number | null;
	activeReplayRangeMs: GeoReplayRangeMs | null;
	bodyPointLayerVisibility: Record<string, boolean>;
	earthChoroplethMode: GeoEarthChoroplethMode;
	mapBody: GeoMapBody;
	mapViewMode: GeoMapViewMode;
}

interface GeoMapWorkspaceActions {
	setEvents: (next: Updater<GeoEvent[]>) => void;
	setCandidates: (next: Updater<GeoCandidate[]>) => void;
	setTimeline: (next: Updater<GeoTimelineEntry[]>) => void;
	setDrawings: (next: Updater<GeoDrawing[]>) => void;
	setRegions: (next: Updater<GeoRegion[]>) => void;
	setNews: (next: Updater<MarketNewsArticle[]>) => void;
	setSourceHealth: (next: Updater<SourceHealthResponse["entries"]>) => void;
	setGraph: (next: Updater<GeoGraphResponse | null>) => void;
	setContextItems: (next: Updater<GeoContextItem[]>) => void;
	setContextLoading: (next: Updater<boolean>) => void;
	setGameTheoryItems: (next: Updater<GeoGameTheoryItem[]>) => void;
	setGameTheorySummary: (next: Updater<GeoGameTheorySummary | null>) => void;
	setGameTheoryLoading: (next: Updater<boolean>) => void;
	setLoading: (next: Updater<boolean>) => void;
	setBusy: (next: Updater<boolean>) => void;
	setError: (next: Updater<string | null>) => void;
	setDrawingMode: (next: Updater<DrawingMode>) => void;
	setDrawingTextLabel: (next: Updater<string>) => void;
	setDrawingColor: (next: Updater<string>) => void;
	setPendingLineStart: (next: Updater<GeoLatLngPoint | null>) => void;
	setPendingPolygonPoints: (next: Updater<GeoLatLngPoint[]>) => void;
	setPendingPoint: (next: Updater<GeoLatLngPoint | null>) => void;
	setDraftTitle: (next: Updater<string>) => void;
	setDraftSummary: (next: Updater<string>) => void;
	setDraftNote: (next: Updater<string>) => void;
	setDraftSeverity: (next: Updater<GeoSeverity>) => void;
	setDraftConfidence: (next: Updater<GeoConfidence>) => void;
	setEditForm: (next: Updater<EditFormState>) => void;
	setCanUndoDrawings: (next: Updater<boolean>) => void;
	setCanRedoDrawings: (next: Updater<boolean>) => void;
	setSelectedSymbol: (next: Updater<string>) => void;
	setSelectedEventId: (next: Updater<string | null>) => void;
	setSelectedEventIds: (next: Updater<string[]>) => void;
	setSelectedDrawingId: (next: Updater<string | null>) => void;
	setSelectedTimelineId: (next: Updater<string | null>) => void;
	setStoryFocusPresets: (next: Updater<GeoStoryFocusPreset[]>) => void;
	setActiveStoryFocusPresetId: (next: Updater<string | null>) => void;
	setPendingFlatViewHandoff: (next: Updater<GeoFlatViewHandoff | null>) => void;
	setFlatViewState: (next: Updater<GeoFlatViewState | null>) => void;
	applyPendingFlatViewHandoff: () => void;
	selectEvent: (eventId: string) => void;
	selectEvents: (eventIds: string[], mode?: GeoMultiSelectionMode) => void;
	selectDrawing: (drawingId: string) => void;
	clearSelection: () => void;
	setActiveRegionId: (next: Updater<string>) => void;
	setSearchQuery: (next: Updater<string>) => void;
	setMinSeverityFilter: (next: Updater<number>) => void;
	setEventsSource: (next: Updater<EventsSource>) => void;
	setContextSource: (next: Updater<ContextSource>) => void;
	setAcledCountryFilter: (next: Updater<string>) => void;
	setAcledRegionFilter: (next: Updater<string>) => void;
	setAcledEventTypeFilter: (next: Updater<string>) => void;
	setAcledSubEventTypeFilter: (next: Updater<string>) => void;
	setAcledFromFilter: (next: Updater<string>) => void;
	setAcledToFilter: (next: Updater<string>) => void;
	setAcledPage: (next: Updater<number>) => void;
	setAcledPageSize: (next: Updater<number>) => void;
	setAcledTotal: (next: Updater<number>) => void;
	setAcledHasMore: (next: Updater<boolean>) => void;
	setShowCandidateQueue: (next: Updater<boolean>) => void;
	setShowRegionLayer: (next: Updater<boolean>) => void;
	setShowHeatmap: (next: Updater<boolean>) => void;
	setShowSoftSignals: (next: Updater<boolean>) => void;
	setShowFiltersToolbar: (next: Updater<boolean>) => void;
	setShowBodyLayerLegend: (next: Updater<boolean>) => void;
	setShowTimelinePanel: (next: Updater<boolean>) => void;
	setWorkspaceTab: (next: Updater<GeoWorkspaceTab>) => void;
	setTimelineViewRangeMs: (next: Updater<GeoReplayRangeMs | null>) => void;
	setTimelineSelectedTimeMs: (next: Updater<number | null>) => void;
	setActiveReplayRangeMs: (next: Updater<GeoReplayRangeMs | null>) => void;
	setBodyPointLayerVisibility: (next: Updater<Record<string, boolean>>) => void;
	toggleBodyPointLayerVisibility: (layerId: string) => void;
	resetBodyPointLayerVisibility: () => void;
	setEarthChoroplethMode: (next: Updater<GeoEarthChoroplethMode>) => void;
	setMapBody: (next: Updater<GeoMapBody>) => void;
	setMapViewMode: (next: Updater<GeoMapViewMode>) => void;
	resetExternalFilters: () => void;
}

export type GeoMapWorkspaceStore = GeoMapWorkspaceState & GeoMapWorkspaceActions;
export type { SourceHealthResponse } from "@/features/geopolitical/shell/types";

export const useGeoMapWorkspaceStore = create<GeoMapWorkspaceStore>((set) => ({
	events: [],
	candidates: [],
	timeline: [],
	drawings: [],
	regions: [],
	news: [],
	sourceHealth: [],
	graph: null,
	contextItems: [],
	contextLoading: false,
	gameTheoryItems: [],
	gameTheorySummary: null,
	gameTheoryLoading: false,
	loading: true,
	busy: false,
	error: null,
	drawingMode: "cursor",
	drawingTextLabel: "Note",
	drawingColor: "#22d3ee",
	pendingLineStart: null,
	pendingPolygonPoints: [],
	pendingPoint: null,
	draftTitle: "",
	draftSummary: "",
	draftNote: "",
	draftSeverity: 2,
	draftConfidence: 2,
	editForm: DEFAULT_EDIT_FORM,
	canUndoDrawings: false,
	canRedoDrawings: false,
	selectedSymbol: "tank",
	selectedEventId: null,
	selectedEventIds: [],
	selectedDrawingId: null,
	selectedTimelineId: null,
	storyFocusPresets: [],
	activeStoryFocusPresetId: null,
	pendingFlatViewHandoff: null,
	flatViewState: null,
	activeRegionId: "",
	searchQuery: "",
	minSeverityFilter: 1,
	eventsSource: "local",
	contextSource: "all",
	acledCountryFilter: "",
	acledRegionFilter: "",
	acledEventTypeFilter: "",
	acledSubEventTypeFilter: "",
	acledFromFilter: "",
	acledToFilter: "",
	acledPage: 1,
	acledPageSize: 50,
	acledTotal: 0,
	acledHasMore: false,
	showCandidateQueue: true,
	showRegionLayer: true,
	showHeatmap: true,
	showSoftSignals: true,
	showFiltersToolbar: true,
	showBodyLayerLegend: true,
	showTimelinePanel: true,
	workspaceTab: "inspector",
	timelineViewRangeMs: null,
	timelineSelectedTimeMs: null,
	activeReplayRangeMs: null,
	bodyPointLayerVisibility: {},
	earthChoroplethMode: "severity",
	mapBody: "earth",
	mapViewMode: "globe",

	setEvents: (next) => set((state) => ({ events: resolveUpdater(state.events, next) })),
	setCandidates: (next) => set((state) => ({ candidates: resolveUpdater(state.candidates, next) })),
	setTimeline: (next) => set((state) => ({ timeline: resolveUpdater(state.timeline, next) })),
	setDrawings: (next) => set((state) => ({ drawings: resolveUpdater(state.drawings, next) })),
	setRegions: (next) => set((state) => ({ regions: resolveUpdater(state.regions, next) })),
	setNews: (next) => set((state) => ({ news: resolveUpdater(state.news, next) })),
	setSourceHealth: (next) =>
		set((state) => ({ sourceHealth: resolveUpdater(state.sourceHealth, next) })),
	setGraph: (next) => set((state) => ({ graph: resolveUpdater(state.graph, next) })),
	setContextItems: (next) =>
		set((state) => ({ contextItems: resolveUpdater(state.contextItems, next) })),
	setContextLoading: (next) =>
		set((state) => ({ contextLoading: resolveUpdater(state.contextLoading, next) })),
	setGameTheoryItems: (next) =>
		set((state) => ({ gameTheoryItems: resolveUpdater(state.gameTheoryItems, next) })),
	setGameTheorySummary: (next) =>
		set((state) => ({ gameTheorySummary: resolveUpdater(state.gameTheorySummary, next) })),
	setGameTheoryLoading: (next) =>
		set((state) => ({ gameTheoryLoading: resolveUpdater(state.gameTheoryLoading, next) })),
	setLoading: (next) => set((state) => ({ loading: resolveUpdater(state.loading, next) })),
	setBusy: (next) => set((state) => ({ busy: resolveUpdater(state.busy, next) })),
	setError: (next) => set((state) => ({ error: resolveUpdater(state.error, next) })),
	setDrawingMode: (next) =>
		set((state) => ({ drawingMode: resolveUpdater(state.drawingMode, next) })),
	setDrawingTextLabel: (next) =>
		set((state) => ({ drawingTextLabel: resolveUpdater(state.drawingTextLabel, next) })),
	setDrawingColor: (next) =>
		set((state) => ({ drawingColor: resolveUpdater(state.drawingColor, next) })),
	setPendingLineStart: (next) =>
		set((state) => ({ pendingLineStart: resolveUpdater(state.pendingLineStart, next) })),
	setPendingPolygonPoints: (next) =>
		set((state) => ({
			pendingPolygonPoints: resolveUpdater(state.pendingPolygonPoints, next),
		})),
	setPendingPoint: (next) =>
		set((state) => ({ pendingPoint: resolveUpdater(state.pendingPoint, next) })),
	setDraftTitle: (next) => set((state) => ({ draftTitle: resolveUpdater(state.draftTitle, next) })),
	setDraftSummary: (next) =>
		set((state) => ({ draftSummary: resolveUpdater(state.draftSummary, next) })),
	setDraftNote: (next) => set((state) => ({ draftNote: resolveUpdater(state.draftNote, next) })),
	setDraftSeverity: (next) =>
		set((state) => ({ draftSeverity: resolveUpdater(state.draftSeverity, next) })),
	setDraftConfidence: (next) =>
		set((state) => ({ draftConfidence: resolveUpdater(state.draftConfidence, next) })),
	setEditForm: (next) => set((state) => ({ editForm: resolveUpdater(state.editForm, next) })),
	setCanUndoDrawings: (next) =>
		set((state) => ({ canUndoDrawings: resolveUpdater(state.canUndoDrawings, next) })),
	setCanRedoDrawings: (next) =>
		set((state) => ({ canRedoDrawings: resolveUpdater(state.canRedoDrawings, next) })),
	setSelectedSymbol: (next) =>
		set((state) => ({ selectedSymbol: resolveUpdater(state.selectedSymbol, next) })),
	setSelectedEventId: (next) =>
		set((state) => ({ selectedEventId: resolveUpdater(state.selectedEventId, next) })),
	setSelectedEventIds: (next) =>
		set((state) => ({ selectedEventIds: resolveUpdater(state.selectedEventIds, next) })),
	setSelectedDrawingId: (next) =>
		set((state) => ({ selectedDrawingId: resolveUpdater(state.selectedDrawingId, next) })),
	setSelectedTimelineId: (next) =>
		set((state) => ({ selectedTimelineId: resolveUpdater(state.selectedTimelineId, next) })),
	setStoryFocusPresets: (next) =>
		set((state) => ({ storyFocusPresets: resolveUpdater(state.storyFocusPresets, next) })),
	setActiveStoryFocusPresetId: (next) =>
		set((state) => ({
			activeStoryFocusPresetId: resolveUpdater(state.activeStoryFocusPresetId, next),
		})),
	setPendingFlatViewHandoff: (next) =>
		set((state) => ({
			pendingFlatViewHandoff: resolveUpdater(state.pendingFlatViewHandoff, next),
		})),
	setFlatViewState: (next) =>
		set((state) => ({
			flatViewState: resolveUpdater(state.flatViewState, next),
		})),
	applyPendingFlatViewHandoff: () =>
		set((state) => {
			if (state.pendingFlatViewHandoff === null) {
				return state;
			}
			return {
				flatViewState: buildGeoFlatViewStateFromHandoff(state.pendingFlatViewHandoff),
				mapViewMode: "flat" as const,
				pendingFlatViewHandoff: null,
			};
		}),
	selectEvent: (eventId) =>
		set((state) => {
			const selectedEvent = state.events.find((event) => event.id === eventId) ?? null;
			return {
				selectedEventId: eventId,
				selectedEventIds: [eventId],
				selectedDrawingId: null,
				selectedTimelineId: null,
				activeStoryFocusPresetId: null,
				pendingFlatViewHandoff: null,
				flatViewState:
					state.mapViewMode === "flat" && state.flatViewState
						? {
								...state.flatViewState,
								focus: {
									kind: "event",
									id: eventId,
									regionId: selectedEvent?.regionIds.find((value) => value.trim()) ?? null,
								},
							}
						: state.flatViewState,
			};
		}),
	selectEvents: (eventIds, mode = "replace") =>
		set((state) => {
			const nextSelection = buildGeoMultiSelectionState({
				currentEventIds: state.selectedEventIds,
				nextEventIds: eventIds,
				mode,
			});
			return {
				selectedEventIds: nextSelection.eventIds,
				selectedEventId: nextSelection.eventIds[0] ?? null,
				selectedDrawingId: null,
				selectedTimelineId: null,
				activeStoryFocusPresetId: null,
				pendingFlatViewHandoff: null,
			};
		}),
	selectDrawing: (drawingId) =>
		set({
			selectedDrawingId: drawingId,
			selectedEventId: null,
			selectedEventIds: [],
			selectedTimelineId: null,
			activeStoryFocusPresetId: null,
			pendingFlatViewHandoff: null,
		}),
	clearSelection: () =>
		set((state) => ({
			selectedEventId: null,
			selectedEventIds: [],
			selectedDrawingId: null,
			selectedTimelineId: null,
			activeStoryFocusPresetId: null,
			pendingFlatViewHandoff: null,
			flatViewState:
				state.mapViewMode === "flat" && state.flatViewState
					? { ...state.flatViewState, focus: null }
					: state.flatViewState,
		})),

	setActiveRegionId: (next) =>
		set((state) => ({ activeRegionId: resolveUpdater(state.activeRegionId, next) })),
	setSearchQuery: (next) =>
		set((state) => ({ searchQuery: resolveUpdater(state.searchQuery, next) })),
	setMinSeverityFilter: (next) =>
		set((state) => ({ minSeverityFilter: resolveUpdater(state.minSeverityFilter, next) })),
	setEventsSource: (next) =>
		set((state) => ({ eventsSource: resolveUpdater(state.eventsSource, next) })),
	setContextSource: (next) =>
		set((state) => ({ contextSource: resolveUpdater(state.contextSource, next) })),
	setAcledCountryFilter: (next) =>
		set((state) => ({ acledCountryFilter: resolveUpdater(state.acledCountryFilter, next) })),
	setAcledRegionFilter: (next) =>
		set((state) => ({ acledRegionFilter: resolveUpdater(state.acledRegionFilter, next) })),
	setAcledEventTypeFilter: (next) =>
		set((state) => ({ acledEventTypeFilter: resolveUpdater(state.acledEventTypeFilter, next) })),
	setAcledSubEventTypeFilter: (next) =>
		set((state) => ({
			acledSubEventTypeFilter: resolveUpdater(state.acledSubEventTypeFilter, next),
		})),
	setAcledFromFilter: (next) =>
		set((state) => ({ acledFromFilter: resolveUpdater(state.acledFromFilter, next) })),
	setAcledToFilter: (next) =>
		set((state) => ({ acledToFilter: resolveUpdater(state.acledToFilter, next) })),
	setAcledPage: (next) => set((state) => ({ acledPage: resolveUpdater(state.acledPage, next) })),
	setAcledPageSize: (next) =>
		set((state) => ({ acledPageSize: resolveUpdater(state.acledPageSize, next) })),
	setAcledTotal: (next) => set((state) => ({ acledTotal: resolveUpdater(state.acledTotal, next) })),
	setAcledHasMore: (next) =>
		set((state) => ({ acledHasMore: resolveUpdater(state.acledHasMore, next) })),
	setShowCandidateQueue: (next) =>
		set((state) => ({ showCandidateQueue: resolveUpdater(state.showCandidateQueue, next) })),
	setShowRegionLayer: (next) =>
		set((state) => ({ showRegionLayer: resolveUpdater(state.showRegionLayer, next) })),
	setShowHeatmap: (next) =>
		set((state) => ({ showHeatmap: resolveUpdater(state.showHeatmap, next) })),
	setShowSoftSignals: (next) =>
		set((state) => ({ showSoftSignals: resolveUpdater(state.showSoftSignals, next) })),
	setShowFiltersToolbar: (next) =>
		set((state) => ({ showFiltersToolbar: resolveUpdater(state.showFiltersToolbar, next) })),
	setShowBodyLayerLegend: (next) =>
		set((state) => ({ showBodyLayerLegend: resolveUpdater(state.showBodyLayerLegend, next) })),
	setShowTimelinePanel: (next) =>
		set((state) => ({ showTimelinePanel: resolveUpdater(state.showTimelinePanel, next) })),
	setWorkspaceTab: (next) =>
		set((state) => ({ workspaceTab: resolveUpdater(state.workspaceTab, next) })),
	setTimelineViewRangeMs: (next) =>
		set((state) => ({ timelineViewRangeMs: resolveUpdater(state.timelineViewRangeMs, next) })),
	setTimelineSelectedTimeMs: (next) =>
		set((state) => ({
			timelineSelectedTimeMs: resolveUpdater(state.timelineSelectedTimeMs, next),
		})),
	setActiveReplayRangeMs: (next) =>
		set((state) => ({ activeReplayRangeMs: resolveUpdater(state.activeReplayRangeMs, next) })),
	setBodyPointLayerVisibility: (next) =>
		set((state) => ({
			bodyPointLayerVisibility: resolveUpdater(state.bodyPointLayerVisibility, next),
		})),
	toggleBodyPointLayerVisibility: (layerId) =>
		set((state) => ({
			bodyPointLayerVisibility: {
				...state.bodyPointLayerVisibility,
				[layerId]: !(state.bodyPointLayerVisibility[layerId] ?? true),
			},
		})),
	resetBodyPointLayerVisibility: () => set({ bodyPointLayerVisibility: {} }),
	setEarthChoroplethMode: (next) =>
		set((state) => ({
			earthChoroplethMode: resolveUpdater(state.earthChoroplethMode, next),
		})),
	setMapBody: (next) => set((state) => ({ mapBody: resolveUpdater(state.mapBody, next) })),
	setMapViewMode: (next) =>
		set((state) => ({ mapViewMode: resolveUpdater(state.mapViewMode, next) })),

	resetExternalFilters: () =>
		set({
			acledCountryFilter: "",
			acledRegionFilter: "",
			acledEventTypeFilter: "",
			acledSubEventTypeFilter: "",
			acledFromFilter: "",
			acledToFilter: "",
			acledPage: 1,
			acledTotal: 0,
			acledHasMore: false,
		}),
}));
