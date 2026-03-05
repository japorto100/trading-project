"use client";

import { ChevronLeft, ChevronRight, PencilRuler } from "lucide-react";
import {
	type MouseEvent as ReactMouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { EventInspector } from "@/features/geopolitical/EventInspector";
import { getBodyPointLayerDefaultVisibilityMap } from "@/features/geopolitical/layers/bodyPointLayerCatalog";
import { SymbolToolbar } from "@/features/geopolitical/SymbolToolbar";
import { CreateMarkerPanel } from "@/features/geopolitical/shell/CreateMarkerPanel";
import { DrawModePanel } from "@/features/geopolitical/shell/DrawModePanel";
import { EditMarkerPanel } from "@/features/geopolitical/shell/EditMarkerPanel";
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
import { MapViewportPanel } from "@/features/geopolitical/shell/MapViewportPanel";
import { MarkerListModal } from "@/features/geopolitical/shell/MarkerListModal";
import { DEFAULT_EDIT_FORM } from "@/features/geopolitical/shell/types";
import { useGeoMapWorkspaceStore } from "@/features/geopolitical/store";
import { CommandPalette } from "@/features/trading/CommandPalette";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function GeopoliticalMapShell() {
	const workspaceRef = useRef<HTMLDivElement | null>(null);
	const [leftPanelWidth, setLeftPanelWidth] = useState(340);
	const [rightPanelWidth, setRightPanelWidth] = useState(460);
	const [leftCollapsed, setLeftCollapsed] = useState(false);
	const [rightCollapsed, setRightCollapsed] = useState(false);
	const [drawToolsOpen, setDrawToolsOpen] = useState(false);
	const [markerPlacementArmed, setMarkerPlacementArmed] = useState(false);
	const [markerModalOpen, setMarkerModalOpen] = useState(false);
	const [markerListModalOpen, setMarkerListModalOpen] = useState(false);

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

	useEffect(() => {
		if (pendingPoint || selectedEvent) {
			setMarkerModalOpen(true);
			return;
		}
		setMarkerModalOpen(false);
	}, [pendingPoint, selectedEvent]);

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

	const overlayEvents = mapBody === "earth" ? events : [];
	const overlayCandidates = mapBody === "earth" ? candidates : [];
	const overlayTimeline = mapBody === "earth" ? timeline : [];
	const overlaySelectedEventId = mapBody === "earth" ? selectedEventId : null;
	const overlayNews = mapBody === "earth" ? news : [];
	const overlayGraph = mapBody === "earth" ? graph : null;
	const overlayContextItems = mapBody === "earth" ? contextItems : [];
	const overlaySourceHealth = mapBody === "earth" ? sourceHealth : [];
	const statsSummary = useMemo(() => {
		if (mapBody !== "earth" || overlayEvents.length === 0) {
			return { totalEvents: 0, avgSeverityLabel: "n/a", maxSeverityLabel: "n/a" };
		}
		let sum = 0;
		let max = 0;
		for (const event of overlayEvents) {
			sum += Number(event.severity);
			max = Math.max(max, Number(event.severity));
		}
		return {
			totalEvents: overlayEvents.length,
			avgSeverityLabel: (sum / overlayEvents.length).toFixed(1),
			maxSeverityLabel: `S${max}`,
		};
	}, [mapBody, overlayEvents]);
	const effectiveLeftWidth = leftCollapsed ? 44 : leftPanelWidth;
	const effectiveRightWidth = rightCollapsed ? 44 : rightPanelWidth;
	const mapDrawingMode = drawToolsOpen ? drawingMode : null;
	const mapPendingLineStart = drawToolsOpen ? pendingLineStart : null;
	const mapPendingPolygonPoints = drawToolsOpen ? pendingPolygonPoints : [];
	const handleToggleDrawTools = useCallback(() => {
		if (!drawToolsOpen && drawingMode === "marker") {
			setDrawingMode("line");
		}
		setMarkerPlacementArmed(false);
		setDrawToolsOpen((previous) => !previous);
	}, [drawToolsOpen, drawingMode, setDrawingMode]);
	const handleToggleMarkerPlacement = useCallback(() => {
		setDrawToolsOpen(false);
		setPendingLineStart(null);
		setPendingPolygonPoints([]);
		setDrawingMode("marker");
		setMarkerPlacementArmed((previous) => !previous);
	}, [setDrawingMode, setPendingLineStart, setPendingPolygonPoints]);
	const handleViewportMapClick = useCallback(
		(coords: { lat: number; lng: number }) => {
			if (mapBody !== "earth") return;
			if (!drawToolsOpen && !markerPlacementArmed) return;
			void handleMapClick(coords);
			if (markerPlacementArmed) {
				setMarkerPlacementArmed(false);
			}
		},
		[drawToolsOpen, handleMapClick, mapBody, markerPlacementArmed],
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
	const handleResetBodyPointLayerVisibility = useCallback(() => {
		setBodyPointLayerVisibility((previous) => ({
			...previous,
			...getBodyPointLayerDefaultVisibilityMap(mapBody),
		}));
	}, [mapBody, setBodyPointLayerVisibility]);

	const beginResize = useCallback(
		(panel: "left" | "right") => (event: ReactMouseEvent<HTMLDivElement>) => {
			event.preventDefault();
			const workspace = workspaceRef.current;
			if (!workspace) return;
			const rect = workspace.getBoundingClientRect();
			const gap = 12;
			const minSide = 280;
			const maxSide = Math.max(360, rect.width * 0.45);
			const previousUserSelect = document.body.style.userSelect;
			const previousCursor = document.body.style.cursor;
			document.body.style.userSelect = "none";
			document.body.style.cursor = "ew-resize";

			const onMove = (moveEvent: MouseEvent) => {
				const currentRect = workspace.getBoundingClientRect();
				if (panel === "left") {
					const next = moveEvent.clientX - currentRect.left - gap;
					setLeftPanelWidth(clamp(next, minSide, maxSide));
					return;
				}
				const next = currentRect.right - moveEvent.clientX - gap;
				setRightPanelWidth(clamp(next, minSide, maxSide));
			};

			const onUp = () => {
				window.removeEventListener("mousemove", onMove);
				window.removeEventListener("mouseup", onUp);
				document.body.style.userSelect = previousUserSelect;
				document.body.style.cursor = previousCursor;
			};

			window.addEventListener("mousemove", onMove);
			window.addEventListener("mouseup", onUp);
		},
		[],
	);

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
				<main ref={workspaceRef} className="relative min-h-0 flex-1 overflow-hidden">
					<MapViewportPanel
						mapBody={mapBody}
						loading={loading}
						events={overlayEvents}
						candidates={overlayCandidates}
						drawings={drawings}
						showRegionLayer={showRegionLayer}
						showHeatmap={showHeatmap}
						showSoftSignals={showSoftSignals}
						bodyPointLayerVisibility={bodyPointLayerVisibility}
						earthChoroplethMode={earthChoroplethMode}
						selectedEventId={overlaySelectedEventId}
						selectedDrawingId={selectedDrawingId}
						onSelectEvent={selectEvent}
						onSelectDrawing={selectDrawing}
						onToggleBodyPointLayerVisibility={toggleBodyPointLayerVisibility}
						onResetBodyPointLayerVisibility={handleResetBodyPointLayerVisibility}
						onChangeEarthChoroplethMode={setEarthChoroplethMode}
						drawingMode={mapDrawingMode}
						pendingLineStart={mapPendingLineStart}
						pendingPolygonPoints={mapPendingPolygonPoints}
						drawingColor={drawingColor}
						onMapClick={handleViewportMapClick}
						onCountryClick={handleViewportCountryClick}
					/>

					<div className="pointer-events-none absolute inset-0 z-20">
						<div className="pointer-events-auto absolute left-3 right-3 top-3">
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
						</div>

						<div className="pointer-events-auto absolute right-3 top-3 z-40">
							<Button
								type="button"
								size="sm"
								variant="secondary"
								className="h-9 border border-border/70 bg-card/90 shadow-lg backdrop-blur"
								onClick={() => setMarkerListModalOpen(true)}
								aria-label="Open marker list"
							>
								Marker List
							</Button>
						</div>
						<div
							className="pointer-events-auto absolute top-[6.75rem] z-40"
							style={{ right: effectiveRightWidth + 18 }}
						>
							<Button
								type="button"
								size="sm"
								variant="secondary"
								className="h-9 border border-border/70 bg-card/90 shadow-lg backdrop-blur"
								onClick={handleToggleDrawTools}
								aria-expanded={drawToolsOpen}
								aria-label="Toggle drawing tools"
								title={drawToolsOpen ? "Hide drawing tools" : "Show drawing tools"}
							>
								<PencilRuler className="h-4 w-4" />
							</Button>
							{drawToolsOpen ? (
								<div className="mt-2 max-w-[19rem] rounded-lg border border-border/70 bg-card/95 p-2 shadow-xl backdrop-blur">
									<DrawModePanel
										drawingMode={drawingMode}
										drawingTextLabel={drawingTextLabel}
										drawingColor={drawingColor}
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
										onDrawingColorChange={setDrawingColor}
										onCompletePolygon={() => void completePolygonDrawing()}
										onClearPolygon={() => setPendingPolygonPoints([])}
										onDeleteSelectedDrawing={() => void deleteSelectedDrawing()}
										onUndo={() => void undoDrawingCommand()}
										onRedo={() => void redoDrawingCommand()}
									/>
								</div>
							) : null}
						</div>

						<div
							className="pointer-events-auto absolute left-3 top-[7.75rem] overflow-hidden rounded-lg border border-border/70 bg-card/85 shadow-xl backdrop-blur"
							style={{ width: effectiveLeftWidth, bottom: 12 }}
						>
							<div className="flex h-10 items-center justify-between border-b border-border px-2">
								<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
									Left Panel
								</span>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-7"
									onClick={() => setLeftCollapsed((previous) => !previous)}
									aria-label={leftCollapsed ? "Expand left panel" : "Collapse left panel"}
								>
									{leftCollapsed ? (
										<ChevronRight className="h-4 w-4" />
									) : (
										<ChevronLeft className="h-4 w-4" />
									)}
								</Button>
							</div>
							{leftCollapsed ? null : (
								<>
									<div className="h-[calc(100%-2.5rem)] overflow-y-auto">
										<MapLeftSidebar
											markerPlacementArmed={markerPlacementArmed}
											onToggleMarkerPlacement={handleToggleMarkerPlacement}
										/>
									</div>
									<div
										className="absolute bottom-0 right-0 top-0 z-30 w-2 cursor-ew-resize"
										onMouseDown={beginResize("left")}
										role="separator"
										aria-label="Resize left panel"
									/>
								</>
							)}
						</div>

						<div
							className="pointer-events-auto absolute right-3 top-[7.75rem] overflow-hidden rounded-lg border border-border/70 bg-card/85 shadow-xl backdrop-blur"
							style={{ width: effectiveRightWidth, bottom: 12 }}
						>
							<div className="flex h-10 items-center justify-between border-b border-border px-2">
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-7"
									onClick={() => setRightCollapsed((previous) => !previous)}
									aria-label={rightCollapsed ? "Expand right panel" : "Collapse right panel"}
								>
									{rightCollapsed ? (
										<ChevronLeft className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
								<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
									Right Panel
								</span>
							</div>
							{rightCollapsed ? null : (
								<>
									<div className="h-[calc(100%-2.5rem)] overflow-y-auto">
										<MapRightSidebar
											isEarthContext={mapBody === "earth"}
											error={error}
											busy={busy}
											showCandidateQueue={mapBody === "earth" && showCandidateQueue}
											candidates={overlayCandidates}
											onCandidateAction={(candidateId, action) => {
												void handleCandidateAction(candidateId, action);
											}}
											onQuickImportCandidate={(rawText) => {
												void quickImportCandidate(rawText);
											}}
											activeRegionLabel={activeRegionLabel}
											news={overlayNews}
											graph={overlayGraph}
											gameTheoryEnabled={mapBody === "earth" && eventsSource === "acled"}
											gameTheoryLoading={gameTheoryLoading}
											gameTheoryItems={gameTheoryItems}
											gameTheorySummary={gameTheorySummary ?? null}
											contextSource={contextSource}
											onContextSourceChange={setContextSource}
											contextItems={overlayContextItems}
											contextLoading={contextLoading}
											sourceHealth={overlaySourceHealth}
											timeline={overlayTimeline}
											events={overlayEvents}
										/>
									</div>
									<div
										className="absolute bottom-0 left-0 top-0 z-30 w-2 cursor-ew-resize"
										onMouseDown={beginResize("right")}
										role="separator"
										aria-label="Resize right panel"
									/>
								</>
							)}
						</div>
					</div>
				</main>
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
				onThemeToggle={() => {}}
				isDarkMode={true}
			/>
		</div>
	);
}
