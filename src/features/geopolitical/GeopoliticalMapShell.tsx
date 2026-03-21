"use client";

import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { CommandPalette } from "@/components/CommandPalette";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useGlobalChat } from "@/features/agent-chat/context/GlobalChatContext";
import { useGeopoliticalDrawingCommands } from "@/features/geopolitical/drawing/hooks/useGeopoliticalDrawingCommands";
import { useGeopoliticalDrawingInteractions } from "@/features/geopolitical/drawing/hooks/useGeopoliticalDrawingInteractions";
import { CreateMarkerPanel } from "@/features/geopolitical/drawing/panels/CreateMarkerPanel";
import { DrawModePanel } from "@/features/geopolitical/drawing/panels/DrawModePanel";
import { EditMarkerPanel } from "@/features/geopolitical/drawing/panels/EditMarkerPanel";
import { EventInspector } from "@/features/geopolitical/EventInspector";
import { buildGeoFlatViewBoundsFromCoordinates } from "@/features/geopolitical/flat-view/flat-view-handoff";
import { getBodyPointLayerDefaultVisibilityMap } from "@/features/geopolitical/layers/bodyPointLayerCatalog";
import { MarkerListModal } from "@/features/geopolitical/markers/MarkerListModal";
import { SymbolToolbar } from "@/features/geopolitical/SymbolToolbar";
import { GeoBulkSelectionBar } from "@/features/geopolitical/shell/GeoBulkSelectionBar";
import { useGeoFlatViewEntry } from "@/features/geopolitical/shell/hooks/useGeoFlatViewEntry";
import { useGeoMapKeyboardShortcuts } from "@/features/geopolitical/shell/hooks/useGeoMapKeyboardShortcuts";
import { useGeopoliticalMarkerMutations } from "@/features/geopolitical/shell/hooks/useGeopoliticalMarkerMutations";
import { useGeopoliticalShellController } from "@/features/geopolitical/shell/hooks/useGeopoliticalShellController";
import { useGeopoliticalShellOrchestration } from "@/features/geopolitical/shell/hooks/useGeopoliticalShellOrchestration";
import { useGeopoliticalShellPersistence } from "@/features/geopolitical/shell/hooks/useGeopoliticalShellPersistence";
import { useGeopoliticalWorkspaceData } from "@/features/geopolitical/shell/hooks/useGeopoliticalWorkspaceData";
import { GeoWorkspaceStage } from "@/features/geopolitical/shell/layout/GeoWorkspaceStage";
import { MapFiltersToolbar } from "@/features/geopolitical/shell/MapFiltersToolbar";
import { MapFooterStatus } from "@/features/geopolitical/shell/MapFooterStatus";
import { MapShellHeader } from "@/features/geopolitical/shell/MapShellHeader";
import { DEFAULT_EDIT_FORM } from "@/features/geopolitical/shell/types";
import { useGeoMapWorkspaceStore } from "@/features/geopolitical/store";
import { useIsMobile } from "@/hooks/use-mobile";

export function GeopoliticalMapShell() {
	// FC3: Chat context injection
	const { open: chatOpen, setChatContext } = useGlobalChat();
	const isMobile = useIsMobile();

	const {
		selectedSymbol,
		setSelectedSymbol,
		selectedEventId,
		selectedEventIds,
		setSelectedEventId,
		selectEvents,
		selectedDrawingId,
		setSelectedDrawingId,
		selectedTimelineId,
		setSelectedTimelineId,
		storyFocusPresets,
		setStoryFocusPresets,
		activeStoryFocusPresetId,
		setActiveStoryFocusPresetId,
		flatViewState,
		mapViewMode,
		setMapViewMode,
		setPendingFlatViewHandoff,
		applyPendingFlatViewHandoff,
		selectEvent,
		selectDrawing,
		clearSelection,
		activeRegionId,
		setActiveRegionId,
		searchQuery,
		setSearchQuery,
		minSeverityFilter,
		setMinSeverityFilter,
		eventsSource,
		setEventsSource,
		contextSource,
		setContextSource,
		acledCountryFilter,
		setAcledCountryFilter,
		acledRegionFilter,
		setAcledRegionFilter,
		acledEventTypeFilter,
		setAcledEventTypeFilter,
		acledSubEventTypeFilter,
		setAcledSubEventTypeFilter,
		acledFromFilter,
		setAcledFromFilter,
		acledToFilter,
		setAcledToFilter,
		acledPage,
		setAcledPage,
		acledTotal,
		acledHasMore,
		showCandidateQueue,
		setShowCandidateQueue,
		showRegionLayer,
		setShowRegionLayer,
		showHeatmap,
		setShowHeatmap,
		showSoftSignals,
		setShowSoftSignals,
		showFiltersToolbar,
		setShowFiltersToolbar,
		showBodyLayerLegend,
		setShowBodyLayerLegend,
		showTimelinePanel,
		setShowTimelinePanel,
		workspaceTab,
		setWorkspaceTab,
		timelineViewRangeMs,
		setTimelineViewRangeMs,
		timelineSelectedTimeMs,
		setTimelineSelectedTimeMs,
		activeReplayRangeMs,
		setActiveReplayRangeMs,
		bodyPointLayerVisibility,
		setBodyPointLayerVisibility,
		toggleBodyPointLayerVisibility,
		earthChoroplethMode,
		setEarthChoroplethMode,
		mapBody,
		setMapBody,
	} = useGeoMapWorkspaceStore(
		useShallow((state) => ({
			selectedSymbol: state.selectedSymbol,
			setSelectedSymbol: state.setSelectedSymbol,
			selectedEventId: state.selectedEventId,
			selectedEventIds: state.selectedEventIds,
			setSelectedEventId: state.setSelectedEventId,
			selectEvents: state.selectEvents,
			selectedDrawingId: state.selectedDrawingId,
			setSelectedDrawingId: state.setSelectedDrawingId,
			selectedTimelineId: state.selectedTimelineId,
			setSelectedTimelineId: state.setSelectedTimelineId,
			storyFocusPresets: state.storyFocusPresets,
			setStoryFocusPresets: state.setStoryFocusPresets,
			activeStoryFocusPresetId: state.activeStoryFocusPresetId,
			setActiveStoryFocusPresetId: state.setActiveStoryFocusPresetId,
			flatViewState: state.flatViewState,
			mapViewMode: state.mapViewMode,
			setMapViewMode: state.setMapViewMode,
			setPendingFlatViewHandoff: state.setPendingFlatViewHandoff,
			applyPendingFlatViewHandoff: state.applyPendingFlatViewHandoff,
			selectEvent: state.selectEvent,
			selectDrawing: state.selectDrawing,
			clearSelection: state.clearSelection,
			activeRegionId: state.activeRegionId,
			setActiveRegionId: state.setActiveRegionId,
			searchQuery: state.searchQuery,
			setSearchQuery: state.setSearchQuery,
			minSeverityFilter: state.minSeverityFilter,
			setMinSeverityFilter: state.setMinSeverityFilter,
			eventsSource: state.eventsSource,
			setEventsSource: state.setEventsSource,
			contextSource: state.contextSource,
			setContextSource: state.setContextSource,
			acledCountryFilter: state.acledCountryFilter,
			setAcledCountryFilter: state.setAcledCountryFilter,
			acledRegionFilter: state.acledRegionFilter,
			setAcledRegionFilter: state.setAcledRegionFilter,
			acledEventTypeFilter: state.acledEventTypeFilter,
			setAcledEventTypeFilter: state.setAcledEventTypeFilter,
			acledSubEventTypeFilter: state.acledSubEventTypeFilter,
			setAcledSubEventTypeFilter: state.setAcledSubEventTypeFilter,
			acledFromFilter: state.acledFromFilter,
			setAcledFromFilter: state.setAcledFromFilter,
			acledToFilter: state.acledToFilter,
			setAcledToFilter: state.setAcledToFilter,
			acledPage: state.acledPage,
			setAcledPage: state.setAcledPage,
			acledTotal: state.acledTotal,
			acledHasMore: state.acledHasMore,
			showCandidateQueue: state.showCandidateQueue,
			setShowCandidateQueue: state.setShowCandidateQueue,
			showRegionLayer: state.showRegionLayer,
			setShowRegionLayer: state.setShowRegionLayer,
			showHeatmap: state.showHeatmap,
			setShowHeatmap: state.setShowHeatmap,
			showSoftSignals: state.showSoftSignals,
			setShowSoftSignals: state.setShowSoftSignals,
			showFiltersToolbar: state.showFiltersToolbar,
			setShowFiltersToolbar: state.setShowFiltersToolbar,
			showBodyLayerLegend: state.showBodyLayerLegend,
			setShowBodyLayerLegend: state.setShowBodyLayerLegend,
			showTimelinePanel: state.showTimelinePanel,
			setShowTimelinePanel: state.setShowTimelinePanel,
			workspaceTab: state.workspaceTab,
			setWorkspaceTab: state.setWorkspaceTab,
			timelineViewRangeMs: state.timelineViewRangeMs,
			setTimelineViewRangeMs: state.setTimelineViewRangeMs,
			timelineSelectedTimeMs: state.timelineSelectedTimeMs,
			setTimelineSelectedTimeMs: state.setTimelineSelectedTimeMs,
			activeReplayRangeMs: state.activeReplayRangeMs,
			setActiveReplayRangeMs: state.setActiveReplayRangeMs,
			bodyPointLayerVisibility: state.bodyPointLayerVisibility,
			setBodyPointLayerVisibility: state.setBodyPointLayerVisibility,
			toggleBodyPointLayerVisibility: state.toggleBodyPointLayerVisibility,
			earthChoroplethMode: state.earthChoroplethMode,
			setEarthChoroplethMode: state.setEarthChoroplethMode,
			mapBody: state.mapBody,
			setMapBody: state.setMapBody,
		})),
	);
	const {
		events,
		candidates,
		timeline,
		drawings,
		regions,
		news,
		sourceHealth,
		graph,
		contextItems,
		contextLoading,
		gameTheoryItems,
		gameTheorySummary,
		gameTheoryLoading,
		loading,
		busy,
		setBusy,
		error,
		setError,
	} = useGeoMapWorkspaceStore(
		useShallow((state) => ({
			events: state.events,
			candidates: state.candidates,
			timeline: state.timeline,
			drawings: state.drawings,
			regions: state.regions,
			news: state.news,
			sourceHealth: state.sourceHealth,
			graph: state.graph,
			contextItems: state.contextItems,
			contextLoading: state.contextLoading,
			gameTheoryItems: state.gameTheoryItems,
			gameTheorySummary: state.gameTheorySummary,
			gameTheoryLoading: state.gameTheoryLoading,
			loading: state.loading,
			busy: state.busy,
			setBusy: state.setBusy,
			error: state.error,
			setError: state.setError,
		})),
	);
	const {
		drawingMode,
		setDrawingMode,
		drawingTextLabel,
		setDrawingTextLabel,
		drawingColor,
		setDrawingColor,
		pendingLineStart,
		setPendingLineStart,
		pendingPolygonPoints,
		setPendingPolygonPoints,
		pendingPoint,
		setPendingPoint,
		draftTitle,
		setDraftTitle,
		draftSummary,
		setDraftSummary,
		draftNote,
		setDraftNote,
		draftSeverity,
		setDraftSeverity,
		draftConfidence,
		setDraftConfidence,
		editForm,
		setEditForm,
		canUndoDrawings,
		canRedoDrawings,
	} = useGeoMapWorkspaceStore(
		useShallow((state) => ({
			drawingMode: state.drawingMode,
			setDrawingMode: state.setDrawingMode,
			drawingTextLabel: state.drawingTextLabel,
			setDrawingTextLabel: state.setDrawingTextLabel,
			drawingColor: state.drawingColor,
			setDrawingColor: state.setDrawingColor,
			pendingLineStart: state.pendingLineStart,
			setPendingLineStart: state.setPendingLineStart,
			pendingPolygonPoints: state.pendingPolygonPoints,
			setPendingPolygonPoints: state.setPendingPolygonPoints,
			pendingPoint: state.pendingPoint,
			setPendingPoint: state.setPendingPoint,
			draftTitle: state.draftTitle,
			setDraftTitle: state.setDraftTitle,
			draftSummary: state.draftSummary,
			setDraftSummary: state.setDraftSummary,
			draftNote: state.draftNote,
			setDraftNote: state.setDraftNote,
			draftSeverity: state.draftSeverity,
			setDraftSeverity: state.setDraftSeverity,
			draftConfidence: state.draftConfidence,
			setDraftConfidence: state.setDraftConfidence,
			editForm: state.editForm,
			setEditForm: state.setEditForm,
			canUndoDrawings: state.canUndoDrawings,
			canRedoDrawings: state.canRedoDrawings,
		})),
	);
	const eventsEditable = eventsSource === "local";
	const isExternalSource = eventsSource !== "local";
	const externalSourceLabel = eventsSource === "gdelt" ? "GDELT" : "ACLED";

	const {
		fetchAll,
		fetchDrawings,
		fetchRegionNews,
		fetchGeopoliticalContext,
		fetchGameTheoryImpact,
	} = useGeopoliticalWorkspaceData();
	const {
		createDrawingRecord,
		deleteDrawingById,
		executeDrawingCommand,
		undoDrawingCommand,
		redoDrawingCommand,
	} = useGeopoliticalDrawingCommands({ fetchDrawings });

	const {
		filterSnapshot,
		visibleContextItems,
		visibleGameTheoryItems,
		visibleEvents,
		acledRegionSuggestions,
		acledSubEventSuggestions,
		activeFilterChips,
		selectedEvent,
		activeRegionLabel,
		activeStoryFocusPreset,
		selectedEvents,
		overlayEvents,
		overlayCandidates,
		overlayTimeline,
		overlaySelectedEventId,
		overlayNews,
		overlayGraph,
		overlaySourceHealth,
		statsSummary,
	} = useGeopoliticalShellOrchestration({
		events,
		candidates,
		timeline,
		news,
		contextItems,
		gameTheoryItems,
		graph,
		sourceHealth,
		regions,
		eventsSource,
		activeRegionId,
		searchQuery,
		minSeverityFilter,
		acledCountryFilter,
		acledRegionFilter,
		acledEventTypeFilter,
		acledSubEventTypeFilter,
		acledFromFilter,
		acledToFilter,
		selectedEventId,
		selectedEventIds,
		selectedTimelineId,
		activeStoryFocusPresetId,
		storyFocusPresets,
		activeReplayRangeMs,
		timelineViewRangeMs,
		timelineSelectedTimeMs,
		mapBody,
		chatOpen,
		setChatContext,
		setSelectedEventId,
		setSelectedTimelineId,
		setActiveStoryFocusPresetId,
		setActiveRegionId,
		setSearchQuery,
		setAcledCountryFilter,
		setAcledRegionFilter,
		setAcledEventTypeFilter,
		setAcledSubEventTypeFilter,
		setAcledFromFilter,
		setAcledToFilter,
		setAcledPage,
		setTimelineViewRangeMs,
		setTimelineSelectedTimeMs,
	});
	const {
		workspaceRef,
		leftCollapsed,
		rightCollapsed,
		drawToolsOpen,
		markerPlacementArmed,
		markerModalOpen,
		markerListModalOpen,
		viewportResetNonce,
		leftPanelStyleWidth,
		rightPanelStyleWidth,
		floatingPanelBottomOffset,
		drawToolsRightOffset,
		setDrawToolsOpen,
		setMarkerPlacementArmed,
		setMarkerModalOpen,
		setMarkerListModalOpen,
		setLeftPanelWidth,
		setRightPanelWidth,
		setLeftCollapsed,
		setRightCollapsed,
		handleToggleDrawTools,
		handleToggleLeftPanel,
		handleToggleRightPanel,
		beginResize,
		bumpViewportResetNonce,
	} = useGeopoliticalShellController({
		isMobile,
		pendingPointActive: pendingPoint !== null,
		selectedEventActive: selectedEvent !== null,
	});

	useGeopoliticalShellPersistence({
		isMobile,
		leftPanelWidth: typeof leftPanelStyleWidth === "number" ? leftPanelStyleWidth : 340,
		rightPanelWidth: typeof rightPanelStyleWidth === "number" ? rightPanelStyleWidth : 460,
		leftCollapsed,
		rightCollapsed,
		showCandidateQueue,
		showFiltersToolbar,
		showBodyLayerLegend,
		showTimelinePanel,
		workspaceTab,
		setLeftPanelWidth,
		setRightPanelWidth,
		setLeftCollapsed,
		setRightCollapsed,
		setShowCandidateQueue,
		setShowFiltersToolbar,
		setShowBodyLayerLegend,
		setShowTimelinePanel,
		setWorkspaceTab,
	});

	const applyMapFilters = useCallback(() => {
		void fetchAll();
		void fetchRegionNews();
		void fetchGeopoliticalContext();
		void fetchGameTheoryImpact();
	}, [fetchAll, fetchGeopoliticalContext, fetchGameTheoryImpact, fetchRegionNews]);
	const {
		canOpenFlatView,
		openFlatViewFromCurrentContext,
		openFlatViewForEvent,
		openFlatViewForEventId,
		openFlatViewForRegion,
		openFlatViewForSelectedDrawing,
		openFlatViewForClusterBounds,
		backToGlobe,
	} = useGeoFlatViewEntry({
		events,
		visibleEvents,
		drawings,
		selectedEvent,
		selectedDrawingId,
		activeStoryFocusPreset,
		activeRegionId,
		filterSnapshot,
		timelineViewRangeMs,
		activeReplayRangeMs,
		timelineSelectedTimeMs,
		mapBody,
		flatViewState,
		setPendingFlatViewHandoff: (next) => setPendingFlatViewHandoff(next),
		applyPendingFlatViewHandoff,
		setMapViewMode: (next) => setMapViewMode(next),
	});
	const handleOpenFlatViewForSelectedEvents = useCallback(() => {
		if (selectedEvents.length === 0) return;
		const bounds = buildGeoFlatViewBoundsFromCoordinates(
			selectedEvents.flatMap((event) => event.coordinates ?? []),
		);
		if (!bounds) return;
		openFlatViewForClusterBounds(bounds);
	}, [openFlatViewForClusterBounds, selectedEvents]);
	const handleKeepPrimarySelectedEvent = useCallback(() => {
		if (selectedEventId) {
			selectEvents([selectedEventId], "replace");
			return;
		}
		if (selectedEventIds.length > 0) {
			const primarySelectedEventId = selectedEventIds[0];
			if (primarySelectedEventId) {
				selectEvents([primarySelectedEventId], "replace");
			}
		}
	}, [selectEvents, selectedEventId, selectedEventIds]);

	useEffect(() => {
		if (!selectedEvent) {
			setEditForm(DEFAULT_EDIT_FORM);
			return;
		}
		setEditForm({
			title: selectedEvent.title,
			severity: selectedEvent.severity,
			confidence: selectedEvent.confidence,
			status: selectedEvent.status,
			summary: selectedEvent.summary ?? "",
			analystNote: selectedEvent.analystNote ?? "",
		});
	}, [selectedEvent, setEditForm]);

	const { handleMapClick, completePolygonDrawing, resetCreateForm, deleteSelectedDrawing } =
		useGeopoliticalDrawingInteractions({
			drawings,
			drawingMode,
			drawingTextLabel,
			drawingColor,
			pendingLineStart,
			pendingPolygonPoints,
			selectedDrawingId,
			pendingPoint,
			draftTitle,
			selectedSymbol,
			eventsEditable,
			externalSourceLabel,
			createDrawingRecord,
			deleteDrawingById,
			executeDrawingCommand,
			setSelectedDrawingId,
			setSelectedEventId,
			setPendingLineStart,
			setPendingPolygonPoints,
			setPendingPoint,
			setDraftTitle,
			setDraftSummary,
			setDraftNote,
			setDraftSeverity,
			setDraftConfidence,
			setError,
		});

	const {
		createMarker,
		updateMarker,
		deleteMarker,
		runHardIngest,
		runSoftIngest,
		handleCandidateAction,
		quickImportCandidate,
		addSourceToSelectedEvent,
		addAssetToSelectedEvent,
	} = useGeopoliticalMarkerMutations({
		fetchAll,
		eventsEditable,
		externalSourceLabel,
		selectedSymbol,
		activeRegionId,
		pendingPoint,
		draftTitle,
		draftSummary,
		draftNote,
		draftSeverity,
		draftConfidence,
		selectedEvent,
		editForm,
		resetCreateForm,
		setSelectedEventId,
		setBusy,
		setError,
	});

	useGeoMapKeyboardShortcuts({
		deleteMarker,
		deleteSelectedDrawing,
		redoDrawingCommand,
		undoDrawingCommand,
		selectedDrawingId,
		selectedEventId,
		setDrawingMode,
		setShowCandidateQueue,
		setShowRegionLayer,
		setShowHeatmap,
		setShowSoftSignals,
	});
	const mapDrawingMode = drawToolsOpen ? drawingMode : null;
	const mapPendingLineStart = drawToolsOpen ? pendingLineStart : null;
	const mapPendingPolygonPoints = drawToolsOpen ? pendingPolygonPoints : [];
	const handleToggleMarkerPlacement = useCallback(() => {
		setDrawToolsOpen(false);
		setPendingLineStart(null);
		setPendingPolygonPoints([]);
		setDrawingMode("marker");
		setMarkerPlacementArmed((previous) => !previous);
	}, [
		setDrawingMode,
		setDrawToolsOpen,
		setMarkerPlacementArmed,
		setPendingLineStart,
		setPendingPolygonPoints,
	]);
	const handleViewportMapClick = useCallback(
		(coords: { lat: number; lng: number }) => {
			if (mapBody !== "earth") return;
			const drawingToolActive =
				drawToolsOpen &&
				(mapDrawingMode === "line" || mapDrawingMode === "polygon" || mapDrawingMode === "text");
			if (!drawingToolActive && !markerPlacementArmed) return;
			void handleMapClick(coords);
			if (markerPlacementArmed) {
				setMarkerPlacementArmed(false);
			}
		},
		[
			drawToolsOpen,
			handleMapClick,
			mapBody,
			mapDrawingMode,
			markerPlacementArmed,
			setMarkerPlacementArmed,
		],
	);
	const handleViewportCountryClick = useCallback(
		(countryId: string) => {
			if (isExternalSource) {
				setAcledCountryFilter(countryId);
				setAcledPage(1);
			} else {
				setSearchQuery(countryId);
			}
		},
		[isExternalSource, setAcledCountryFilter, setAcledPage, setSearchQuery],
	);
	const handleTimelineEventFocus = useCallback(
		(eventId: string) => {
			selectEvent(eventId);
			setMarkerModalOpen(true);
		},
		[selectEvent, setMarkerModalOpen],
	);
	const handleTimelineWorkspaceReset = useCallback(() => {
		clearSelection();
		setMarkerModalOpen(false);
		setTimelineSelectedTimeMs(null);
		setActiveStoryFocusPresetId(null);
		bumpViewportResetNonce();
	}, [
		bumpViewportResetNonce,
		clearSelection,
		setActiveStoryFocusPresetId,
		setMarkerModalOpen,
		setTimelineSelectedTimeMs,
	]);
	const handleResetBodyPointLayerVisibility = useCallback(() => {
		setBodyPointLayerVisibility((previous) => ({
			...previous,
			...getBodyPointLayerDefaultVisibilityMap(mapBody),
		}));
	}, [mapBody, setBodyPointLayerVisibility]);

	return (
		<div className="flex h-screen min-h-screen flex-col overflow-hidden bg-background text-foreground">
			<MapShellHeader
				eventsCount={events.length}
				loading={loading}
				busy={busy}
				mapViewMode={mapViewMode}
				canOpenFlatView={canOpenFlatView}
				onRefresh={() => void fetchAll()}
				onRunHardIngest={() => void runHardIngest()}
				onRunSoftIngest={() => void runSoftIngest()}
				onOpenFlatView={openFlatViewFromCurrentContext}
				onBackToGlobe={backToGlobe}
			/>

			<div className="flex min-h-0 flex-1 overflow-hidden">
				<GeoWorkspaceStage
					workspaceRef={workspaceRef}
					mapViewMode={mapViewMode}
					flatViewState={flatViewState}
					flatViewProps={{
						events: overlayEvents,
						showFiltersToolbar,
						showBodyLayerLegend,
						showTimelinePanel,
						selectedEventId: overlaySelectedEventId,
						onSelectEvent: selectEvent,
						onBackToGlobe: backToGlobe,
					}}
					viewportProps={{
						mapBody,
						viewportResetNonce,
						loading,
						events: overlayEvents,
						candidates: overlayCandidates,
						drawings,
						showRegionLayer,
						showHeatmap,
						showSoftSignals,
						showBodyLayerLegend,
						bodyPointLayerVisibility,
						earthChoroplethMode,
						selectedEventId: overlaySelectedEventId,
						selectedEventIds,
						selectedDrawingId,
						markerPlacementArmed,
						canUndoDrawings,
						canRedoDrawings,
						onSelectEvent: selectEvent,
						onSelectEvents: selectEvents,
						onSelectDrawing: selectDrawing,
						onToggleBodyPointLayerVisibility: toggleBodyPointLayerVisibility,
						onResetBodyPointLayerVisibility: handleResetBodyPointLayerVisibility,
						onChangeEarthChoroplethMode: setEarthChoroplethMode,
						drawingMode: mapDrawingMode,
						pendingLineStart: mapPendingLineStart,
						pendingPolygonPoints: mapPendingPolygonPoints,
						drawingColor,
						onMapClick: handleViewportMapClick,
						onCountryClick: handleViewportCountryClick,
						onOpenFlatViewForCluster: openFlatViewForClusterBounds,
					}}
					viewportChromeProps={{
						showFiltersToolbar,
						filtersToolbar: (
							<MapFiltersToolbar
								eventsSource={eventsSource}
								setEventsSource={setEventsSource}
								mapBody={mapBody}
								setMapBody={setMapBody}
								activeRegionId={activeRegionId}
								setActiveRegionId={setActiveRegionId}
								regions={regions}
								acledCountryFilter={acledCountryFilter}
								setAcledCountryFilter={setAcledCountryFilter}
								minSeverityFilter={minSeverityFilter}
								setMinSeverityFilter={setMinSeverityFilter}
								searchQuery={searchQuery}
								setSearchQuery={setSearchQuery}
								isExternalSource={isExternalSource}
								externalSourceLabel={externalSourceLabel}
								acledRegionFilter={acledRegionFilter}
								setAcledRegionFilter={setAcledRegionFilter}
								acledEventTypeFilter={acledEventTypeFilter}
								setAcledEventTypeFilter={setAcledEventTypeFilter}
								acledSubEventTypeFilter={acledSubEventTypeFilter}
								setAcledSubEventTypeFilter={setAcledSubEventTypeFilter}
								acledFromFilter={acledFromFilter}
								setAcledFromFilter={setAcledFromFilter}
								acledToFilter={acledToFilter}
								setAcledToFilter={setAcledToFilter}
								acledPage={acledPage}
								setAcledPage={setAcledPage}
								acledTotal={acledTotal}
								acledHasMore={acledHasMore}
								activeRegionLabel={activeRegionLabel}
								activeFilterChips={activeFilterChips}
								acledRegionSuggestions={acledRegionSuggestions}
								acledSubEventSuggestions={acledSubEventSuggestions}
								statsSummary={statsSummary}
								onApply={applyMapFilters}
							/>
						),
						bulkSelectionBar:
							selectedEventIds.length > 1 ? (
								<GeoBulkSelectionBar
									count={selectedEventIds.length}
									onClear={clearSelection}
									onKeepPrimary={handleKeepPrimarySelectedEvent}
									onOpenFlatView={handleOpenFlatViewForSelectedEvents}
								/>
							) : null,
						onOpenMarkerList: () => setMarkerListModalOpen(true),
						drawToolsRightOffset,
						drawToolsOpen,
						onToggleDrawTools: handleToggleDrawTools,
						drawToolsPanel: (
							<DrawModePanel
								drawingMode={drawingMode}
								drawingTextLabel={drawingTextLabel}
								drawingColor={drawingColor}
								pendingPolygonPointsCount={pendingPolygonPoints.length}
								lineStartSet={Boolean(pendingLineStart)}
								busy={busy}
								selectedDrawingId={selectedDrawingId}
								canOpenSelectedDrawingInFlatView={selectedDrawingId !== null}
								canUndoDrawings={canUndoDrawings}
								canRedoDrawings={canRedoDrawings}
								onModeChange={(mode) => {
									setDrawingMode(mode);
									setPendingLineStart(null);
									setPendingPolygonPoints([]);
								}}
								onTextLabelChange={setDrawingTextLabel}
								onDrawingColorChange={setDrawingColor}
								onCompletePolygon={() => void completePolygonDrawing()}
								onClearPolygon={() => setPendingPolygonPoints([])}
								onOpenSelectedDrawingInFlatView={() => void openFlatViewForSelectedDrawing()}
								onDeleteSelectedDrawing={() => void deleteSelectedDrawing()}
								onUndo={() => void undoDrawingCommand()}
								onRedo={() => void redoDrawingCommand()}
							/>
						),
					}}
					leftPanelProps={{
						collapsed: leftCollapsed,
						width: leftPanelStyleWidth,
						bottomOffset: floatingPanelBottomOffset,
						isMobile,
						onToggleCollapsed: handleToggleLeftPanel,
						onResizeStart: beginResize("left"),
					}}
					leftSidebarProps={{
						markerPlacementArmed,
						onToggleMarkerPlacement: handleToggleMarkerPlacement,
						showFiltersToolbar,
						onShowFiltersToolbarChange: setShowFiltersToolbar,
						showBodyLayerLegend,
						onShowBodyLayerLegendChange: setShowBodyLayerLegend,
						showTimelinePanel,
						onShowTimelinePanelChange: setShowTimelinePanel,
					}}
					rightPanelProps={{
						collapsed: rightCollapsed,
						width: rightPanelStyleWidth,
						bottomOffset: floatingPanelBottomOffset,
						isMobile,
						onToggleCollapsed: handleToggleRightPanel,
						onResizeStart: beginResize("right"),
					}}
					rightSidebarProps={{
						isEarthContext: mapBody === "earth",
						error,
						busy,
						showCandidateQueue: mapBody === "earth" && showCandidateQueue,
						showTimelinePanel: mapBody === "earth" && showTimelinePanel,
						candidates: overlayCandidates,
						onCandidateAction: (candidateId, action) => {
							void handleCandidateAction(candidateId, action);
						},
						onQuickImportCandidate: (rawText) => {
							void quickImportCandidate(rawText);
						},
						onRefreshWorkspace: () => {
							void fetchAll();
						},
						onRefreshRegionNews: () => {
							void fetchRegionNews();
						},
						onRefreshContext: () => {
							void fetchGeopoliticalContext();
						},
						onRefreshGameTheory: () => {
							void fetchGameTheoryImpact();
						},
						workspaceTab,
						onWorkspaceTabChange: setWorkspaceTab,
						activeRegionLabel,
						news: overlayNews,
						onOpenFlatViewForRegion: openFlatViewForRegion,
						graph: overlayGraph,
						gameTheoryEnabled: mapBody === "earth" && eventsSource === "acled",
						gameTheoryLoading,
						gameTheoryItems: visibleGameTheoryItems,
						gameTheorySummary: gameTheorySummary ?? null,
						contextSource,
						onContextSourceChange: setContextSource,
						contextItems: mapBody === "earth" ? visibleContextItems : [],
						contextLoading,
						sourceHealth: overlaySourceHealth,
						timeline: overlayTimeline,
						selectedTimelineId,
						storyFocusPresets,
						activeStoryFocusPresetId,
						activeRegionId,
						events: overlayEvents,
						timelineViewRangeMs,
						timelineSelectedTimeMs,
						activeReplayRangeMs,
						onTimelineViewRangeChange: setTimelineViewRangeMs,
						onTimelineSelectedTimeChange: setTimelineSelectedTimeMs,
						onActiveReplayRangeChange: setActiveReplayRangeMs,
						onSelectEventFromTimeline: handleTimelineEventFocus,
						onOpenFlatViewFromTimeline: openFlatViewForEventId,
						onTimelineReset: handleTimelineWorkspaceReset,
						onSelectedTimelineIdChange: setSelectedTimelineId,
						onStoryFocusPresetsChange: setStoryFocusPresets,
						onActiveStoryFocusPresetIdChange: setActiveStoryFocusPresetId,
						onActiveRegionIdChange: setActiveRegionId,
					}}
				/>
			</div>

			<Dialog
				open={markerModalOpen}
				onOpenChange={(nextOpen) => {
					setMarkerModalOpen(nextOpen);
					if (!nextOpen) {
						resetCreateForm();
						setSelectedEventId(null);
						setMarkerPlacementArmed(false);
					}
				}}
			>
				<DialogContent className="max-h-[88vh] max-w-[62rem] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create Marker On Map</DialogTitle>
						<DialogDescription>
							Define event name, type and context directly after placing a point.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 lg:grid-cols-[18rem,1fr]">
						<div className="rounded-md border border-border bg-card p-3">
							<SymbolToolbar selectedSymbol={selectedSymbol} onSelectSymbol={setSelectedSymbol} />
						</div>
						<CreateMarkerPanel
							pendingPoint={pendingPoint}
							draftTitle={draftTitle}
							draftSummary={draftSummary}
							draftNote={draftNote}
							draftSeverity={draftSeverity}
							draftConfidence={draftConfidence}
							busy={busy}
							onDraftTitleChange={setDraftTitle}
							onDraftSummaryChange={setDraftSummary}
							onDraftNoteChange={setDraftNote}
							onDraftSeverityChange={setDraftSeverity}
							onDraftConfidenceChange={setDraftConfidence}
							onSetPoint={setPendingPoint}
							onCreate={() => void createMarker()}
							onClear={resetCreateForm}
						/>
					</div>
					<div className="grid gap-3 lg:grid-cols-2">
						<EditMarkerPanel
							selectedEvent={selectedEvent}
							editForm={editForm}
							busy={busy}
							onEditFormChange={setEditForm}
							onSave={() => void updateMarker()}
							onDelete={() => void deleteMarker()}
						/>
						<EventInspector
							event={selectedEvent}
							busy={busy}
							onOpenFlatView={openFlatViewForEvent}
							onAddSource={addSourceToSelectedEvent}
							onAddAsset={addAssetToSelectedEvent}
						/>
					</div>
				</DialogContent>
			</Dialog>
			<MarkerListModal
				open={markerListModalOpen}
				onOpenChange={setMarkerListModalOpen}
				events={overlayEvents}
				selectedEventId={overlaySelectedEventId}
				onSelectEvent={(eventId) => {
					selectEvent(eventId);
					setMarkerModalOpen(true);
				}}
			/>

			<MapFooterStatus />

			<CommandPalette
				onSymbolChange={(symbol) => setSelectedSymbol(symbol.symbol)}
				onTimeframeChange={() => {}}
			/>
		</div>
	);
}
