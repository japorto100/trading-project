"use client";

import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { getBodyPointLayerDefaultVisibilityMap } from "@/features/geopolitical/layers/bodyPointLayerCatalog";
import { useGeoMapDerivedUiState } from "@/features/geopolitical/shell/hooks/useGeoMapDerivedUiState";
import { useGeoMapKeyboardShortcuts } from "@/features/geopolitical/shell/hooks/useGeoMapKeyboardShortcuts";
import { useGeopoliticalDrawingCommands } from "@/features/geopolitical/shell/hooks/useGeopoliticalDrawingCommands";
import { useGeopoliticalDrawingInteractions } from "@/features/geopolitical/shell/hooks/useGeopoliticalDrawingInteractions";
import { useGeopoliticalMarkerMutations } from "@/features/geopolitical/shell/hooks/useGeopoliticalMarkerMutations";
import { useGeopoliticalWorkspaceData } from "@/features/geopolitical/shell/hooks/useGeopoliticalWorkspaceData";
import { MapFiltersToolbar } from "@/features/geopolitical/shell/MapFiltersToolbar";
import { MapFooterStatus } from "@/features/geopolitical/shell/MapFooterStatus";
import { MapLeftSidebar } from "@/features/geopolitical/shell/MapLeftSidebar";
import { MapRightSidebar } from "@/features/geopolitical/shell/MapRightSidebar";
import { MapShellHeader } from "@/features/geopolitical/shell/MapShellHeader";
import { MapTimelinePanel } from "@/features/geopolitical/shell/MapTimelinePanel";
import { MapViewportPanel } from "@/features/geopolitical/shell/MapViewportPanel";
import { DEFAULT_EDIT_FORM } from "@/features/geopolitical/shell/types";
import { useGeoMapWorkspaceStore } from "@/features/geopolitical/store";

export function GeopoliticalMapShell() {
	const {
		selectedSymbol,
		setSelectedSymbol,
		selectedEventId,
		setSelectedEventId,
		selectedDrawingId,
		setSelectedDrawingId,
		selectEvent,
		selectDrawing,
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
			setSelectedEventId: state.setSelectedEventId,
			selectedDrawingId: state.selectedDrawingId,
			setSelectedDrawingId: state.setSelectedDrawingId,
			selectEvent: state.selectEvent,
			selectDrawing: state.selectDrawing,
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

	const { fetchAll, fetchRegionNews, fetchGeopoliticalContext, fetchGameTheoryImpact } =
		useGeopoliticalWorkspaceData();
	const {
		createDrawingRecord,
		deleteDrawingById,
		executeDrawingCommand,
		undoDrawingCommand,
		redoDrawingCommand,
	} = useGeopoliticalDrawingCommands({ fetchAll });

	const {
		acledRegionSuggestions,
		acledSubEventSuggestions,
		activeFilterChips,
		selectedEvent,
		activeRegionLabel,
	} = useGeoMapDerivedUiState({
		events,
		regions,
		selectedEventId,
		eventsSource,
		activeRegionId,
		setActiveRegionId,
		searchQuery,
		setSearchQuery,
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
		setAcledPage,
	});

	const applyMapFilters = useCallback(() => {
		void fetchAll();
		void fetchRegionNews();
		void fetchGeopoliticalContext();
		void fetchGameTheoryImpact();
	}, [fetchAll, fetchGeopoliticalContext, fetchGameTheoryImpact, fetchRegionNews]);

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

	return (
		<div className="flex h-screen min-h-screen flex-col overflow-hidden bg-background text-foreground">
			<MapShellHeader
				eventsCount={events.length}
				loading={loading}
				busy={busy}
				onRefresh={() => void fetchAll()}
				onRunHardIngest={() => void runHardIngest()}
				onRunSoftIngest={() => void runSoftIngest()}
			/>

			<div className="flex min-h-0 flex-1 overflow-hidden">
				<MapLeftSidebar
					selectedSymbol={selectedSymbol}
					onSelectSymbol={setSelectedSymbol}
					drawingMode={drawingMode}
					drawingTextLabel={drawingTextLabel}
					pendingPolygonPointsCount={pendingPolygonPoints.length}
					lineStartSet={Boolean(pendingLineStart)}
					busy={busy}
					selectedDrawingId={selectedDrawingId}
					canUndoDrawings={canUndoDrawings}
					canRedoDrawings={canRedoDrawings}
					onModeChange={(mode) => {
						setDrawingMode(mode);
						setPendingLineStart(null);
						setPendingPolygonPoints([]);
					}}
					onTextLabelChange={setDrawingTextLabel}
					onCompletePolygon={() => void completePolygonDrawing()}
					onClearPolygon={() => setPendingPolygonPoints([])}
					onDeleteSelectedDrawing={() => void deleteSelectedDrawing()}
					onUndo={() => void undoDrawingCommand()}
					onRedo={() => void redoDrawingCommand()}
				/>

				<main className="flex min-w-0 flex-1 flex-col">
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
						onApply={applyMapFilters}
					/>

					<MapViewportPanel
						mapBody={mapBody}
						loading={loading}
						events={events}
						candidates={candidates}
						drawings={drawings}
						showRegionLayer={showRegionLayer}
						showHeatmap={showHeatmap}
						showSoftSignals={showSoftSignals}
						bodyPointLayerVisibility={bodyPointLayerVisibility}
						earthChoroplethMode={earthChoroplethMode}
						selectedEventId={selectedEventId}
						selectedDrawingId={selectedDrawingId}
						onSelectEvent={selectEvent}
						onSelectDrawing={selectDrawing}
						onToggleBodyPointLayerVisibility={toggleBodyPointLayerVisibility}
						onResetBodyPointLayerVisibility={() => {
							setBodyPointLayerVisibility((previous) => ({
								...previous,
								...getBodyPointLayerDefaultVisibilityMap(mapBody),
							}));
						}}
						onChangeEarthChoroplethMode={setEarthChoroplethMode}
						onMapClick={(coords) => {
							void handleMapClick(coords);
						}}
						onCountryClick={(countryId) => {
							if (isExternalSource) {
								setAcledCountryFilter(countryId);
								setAcledPage(1);
							} else {
								setSearchQuery(countryId);
							}
						}}
					/>

					<MapTimelinePanel timeline={timeline.slice(0, 40)} />
				</main>

				<MapRightSidebar
					error={error}
					pendingPoint={pendingPoint}
					draftTitle={draftTitle}
					draftSummary={draftSummary}
					draftNote={draftNote}
					draftSeverity={draftSeverity}
					draftConfidence={draftConfidence}
					drawingMode={drawingMode}
					busy={busy}
					onDraftTitleChange={setDraftTitle}
					onDraftSummaryChange={setDraftSummary}
					onDraftNoteChange={setDraftNote}
					onDraftSeverityChange={setDraftSeverity}
					onDraftConfidenceChange={setDraftConfidence}
					onSetPoint={setPendingPoint}
					onCreateMarker={() => void createMarker()}
					onResetCreateForm={resetCreateForm}
					selectedEvent={selectedEvent}
					editForm={editForm}
					onEditFormChange={setEditForm}
					onSaveMarker={() => void updateMarker()}
					onDeleteMarker={() => void deleteMarker()}
					onAddSourceToSelectedEvent={addSourceToSelectedEvent}
					onAddAssetToSelectedEvent={addAssetToSelectedEvent}
					showCandidateQueue={showCandidateQueue}
					candidates={candidates}
					onCandidateAction={(candidateId, action) => {
						void handleCandidateAction(candidateId, action);
					}}
					activeRegionLabel={activeRegionLabel}
					news={news}
					graph={graph}
					gameTheoryEnabled={eventsSource === "acled"}
					gameTheoryLoading={gameTheoryLoading}
					gameTheoryItems={gameTheoryItems}
					gameTheorySummary={gameTheorySummary ?? null}
					contextSource={contextSource}
					onContextSourceChange={setContextSource}
					contextItems={contextItems}
					contextLoading={contextLoading}
					sourceHealth={sourceHealth}
					timeline={timeline}
					events={events}
					selectedEventId={selectedEventId}
					onSelectEvent={selectEvent}
				/>
			</div>

			<MapFooterStatus />
		</div>
	);
}
