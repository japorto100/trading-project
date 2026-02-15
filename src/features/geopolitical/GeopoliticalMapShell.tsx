"use client";

import { Crosshair } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CandidateQueue } from "@/features/geopolitical/CandidateQueue";
import { EventInspector } from "@/features/geopolitical/EventInspector";
import { GeoPulseInsightsPanel } from "@/features/geopolitical/GeoPulseInsightsPanel";
import { GeopoliticalContextPanel } from "@/features/geopolitical/GeopoliticalContextPanel";
import { GeopoliticalGameTheoryPanel } from "@/features/geopolitical/GeopoliticalGameTheoryPanel";
import { MapCanvas } from "@/features/geopolitical/MapCanvas";
import { SourceHealthPanel } from "@/features/geopolitical/SourceHealthPanel";
import { SymbolToolbar } from "@/features/geopolitical/SymbolToolbar";
import { CreateMarkerPanel } from "@/features/geopolitical/shell/CreateMarkerPanel";
import { DrawModePanel } from "@/features/geopolitical/shell/DrawModePanel";
import { EditMarkerPanel } from "@/features/geopolitical/shell/EditMarkerPanel";
import { MapShellHeader } from "@/features/geopolitical/shell/MapShellHeader";
import { MarkerListPanel } from "@/features/geopolitical/shell/MarkerListPanel";
import { RegionNewsPanel } from "@/features/geopolitical/shell/RegionNewsPanel";
import {
	DEFAULT_EDIT_FORM,
	type DrawingHistoryCommand,
	type DrawingMode,
	type EditFormState,
	type GeoCandidatesResponse,
	type GeoContextItem,
	type GeoContextResponse,
	type GeoDrawingResponse,
	type GeoDrawingsResponse,
	type GeoEventResponse,
	type GeoEventsResponse,
	type GeoGameTheoryItem,
	type GeoGameTheoryResponse,
	type GeoGraphResponse,
	type GeoNewsResponse,
	type GeoRegionsResponse,
	type GeoTimelineResponse,
	type SourceHealthResponse,
} from "@/features/geopolitical/shell/types";
import { TimelineStrip } from "@/features/geopolitical/TimelineStrip";
import { getGeoCatalogEntry } from "@/lib/geopolitical/catalog";
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

type EventsSource = "local" | "acled";
type ContextSource = "all" | "cfr" | "crisiswatch";

export function GeopoliticalMapShell() {
	const [events, setEvents] = useState<GeoEvent[]>([]);
	const [candidates, setCandidates] = useState<GeoCandidate[]>([]);
	const [timeline, setTimeline] = useState<GeoTimelineEntry[]>([]);
	const [drawings, setDrawings] = useState<GeoDrawing[]>([]);
	const [regions, setRegions] = useState<GeoRegion[]>([]);
	const [news, setNews] = useState<MarketNewsArticle[]>([]);
	const [sourceHealth, setSourceHealth] = useState<SourceHealthResponse["entries"]>([]);
	const [graph, setGraph] = useState<GeoGraphResponse | null>(null);
	const [contextItems, setContextItems] = useState<GeoContextItem[]>([]);
	const [contextSource, setContextSource] = useState<ContextSource>("all");
	const [contextLoading, setContextLoading] = useState(false);
	const [gameTheoryItems, setGameTheoryItems] = useState<GeoGameTheoryItem[]>([]);
	const [gameTheorySummary, setGameTheorySummary] = useState<
		GeoGameTheoryResponse["summary"] | null
	>(null);
	const [gameTheoryLoading, setGameTheoryLoading] = useState(false);

	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [selectedSymbol, setSelectedSymbol] = useState("tank");
	const [drawingMode, setDrawingMode] = useState<DrawingMode>("marker");
	const [drawingTextLabel, setDrawingTextLabel] = useState("Note");
	const [pendingLineStart, setPendingLineStart] = useState<{ lat: number; lng: number } | null>(
		null,
	);
	const [pendingPolygonPoints, setPendingPolygonPoints] = useState<
		Array<{ lat: number; lng: number }>
	>([]);
	const [pendingPoint, setPendingPoint] = useState<{ lat: number; lng: number } | null>(null);
	const [draftTitle, setDraftTitle] = useState("");
	const [draftSummary, setDraftSummary] = useState("");
	const [draftNote, setDraftNote] = useState("");
	const [draftSeverity, setDraftSeverity] = useState<GeoSeverity>(2);
	const [draftConfidence, setDraftConfidence] = useState<GeoConfidence>(2);

	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
	const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<EditFormState>(DEFAULT_EDIT_FORM);
	const [activeRegionId, setActiveRegionId] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [minSeverityFilter, setMinSeverityFilter] = useState<number>(1);
	const [eventsSource, setEventsSource] = useState<EventsSource>("local");
	const [acledCountryFilter, setAcledCountryFilter] = useState("");
	const [acledRegionFilter, setAcledRegionFilter] = useState("");
	const [acledEventTypeFilter, setAcledEventTypeFilter] = useState("");
	const [acledSubEventTypeFilter, setAcledSubEventTypeFilter] = useState("");
	const [acledFromFilter, setAcledFromFilter] = useState("");
	const [acledToFilter, setAcledToFilter] = useState("");
	const [acledPage, setAcledPage] = useState(1);
	const [acledPageSize, setAcledPageSize] = useState(50);
	const [acledTotal, setAcledTotal] = useState(0);
	const [acledHasMore, setAcledHasMore] = useState(false);
	const [showCandidateQueue, setShowCandidateQueue] = useState(true);
	const [showRegionLayer, setShowRegionLayer] = useState(true);
	const [canUndoDrawings, setCanUndoDrawings] = useState(false);
	const [canRedoDrawings, setCanRedoDrawings] = useState(false);

	const undoStackRef = useRef<DrawingHistoryCommand[]>([]);
	const redoStackRef = useRef<DrawingHistoryCommand[]>([]);
	const eventsEditable = eventsSource === "local";

	const syncDrawingHistoryState = useCallback(() => {
		setCanUndoDrawings(undoStackRef.current.length > 0);
		setCanRedoDrawings(redoStackRef.current.length > 0);
	}, []);

	const acledRegionSuggestions = useMemo(() => {
		const values = events
			.map((event) => event.externalRegion?.trim())
			.filter((value): value is string => Boolean(value));
		return [...new Set(values)].slice(0, 12);
	}, [events]);

	const acledSubEventSuggestions = useMemo(() => {
		const values = events
			.map((event) => event.externalSubEventType?.trim())
			.filter((value): value is string => Boolean(value));
		return [...new Set(values)].slice(0, 12);
	}, [events]);

	const activeFilterChips = useMemo(() => {
		const chips: Array<{ key: string; label: string; clear: () => void }> = [];
		if (eventsSource === "local") {
			if (activeRegionId) {
				chips.push({
					key: "local-region",
					label: `Region: ${activeRegionId}`,
					clear: () => setActiveRegionId(""),
				});
			}
			if (searchQuery.trim()) {
				chips.push({
					key: "local-q",
					label: `Search: ${searchQuery.trim()}`,
					clear: () => setSearchQuery(""),
				});
			}
			return chips;
		}

		if (acledCountryFilter.trim()) {
			chips.push({
				key: "acled-country",
				label: `Country: ${acledCountryFilter.trim()}`,
				clear: () => {
					setAcledCountryFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledRegionFilter.trim()) {
			chips.push({
				key: "acled-region",
				label: `Region: ${acledRegionFilter.trim()}`,
				clear: () => {
					setAcledRegionFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledEventTypeFilter.trim()) {
			chips.push({
				key: "acled-event-type",
				label: `Type: ${acledEventTypeFilter.trim()}`,
				clear: () => {
					setAcledEventTypeFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledSubEventTypeFilter.trim()) {
			chips.push({
				key: "acled-sub-event-type",
				label: `Sub-Event: ${acledSubEventTypeFilter.trim()}`,
				clear: () => {
					setAcledSubEventTypeFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledFromFilter.trim()) {
			chips.push({
				key: "acled-from",
				label: `From: ${acledFromFilter.trim()}`,
				clear: () => {
					setAcledFromFilter("");
					setAcledPage(1);
				},
			});
		}
		if (acledToFilter.trim()) {
			chips.push({
				key: "acled-to",
				label: `To: ${acledToFilter.trim()}`,
				clear: () => {
					setAcledToFilter("");
					setAcledPage(1);
				},
			});
		}
		if (searchQuery.trim()) {
			chips.push({
				key: "acled-q",
				label: `Search: ${searchQuery.trim()}`,
				clear: () => setSearchQuery(""),
			});
		}
		return chips;
	}, [
		activeRegionId,
		acledCountryFilter,
		acledEventTypeFilter,
		acledFromFilter,
		acledRegionFilter,
		acledSubEventTypeFilter,
		acledToFilter,
		eventsSource,
		searchQuery,
	]);

	const buildEventsQueryString = useCallback(() => {
		const params = new URLSearchParams({
			minSeverity: String(minSeverityFilter),
		});
		if (searchQuery.trim()) {
			params.set("q", searchQuery.trim());
		}

		if (eventsSource === "local") {
			if (activeRegionId) {
				params.set("regionId", activeRegionId);
			}
			return params.toString();
		}

		params.set("source", "acled");
		params.set("page", String(acledPage));
		params.set("pageSize", String(acledPageSize));
		if (acledCountryFilter.trim()) params.set("country", acledCountryFilter.trim());
		if (acledRegionFilter.trim()) params.set("region", acledRegionFilter.trim());
		if (acledEventTypeFilter.trim()) params.set("eventType", acledEventTypeFilter.trim());
		if (acledSubEventTypeFilter.trim()) params.set("subEventType", acledSubEventTypeFilter.trim());
		if (acledFromFilter.trim()) params.set("from", acledFromFilter.trim());
		if (acledToFilter.trim()) params.set("to", acledToFilter.trim());
		return params.toString();
	}, [
		acledCountryFilter,
		acledEventTypeFilter,
		acledFromFilter,
		acledPage,
		acledPageSize,
		acledRegionFilter,
		acledSubEventTypeFilter,
		acledToFilter,
		activeRegionId,
		eventsSource,
		minSeverityFilter,
		searchQuery,
	]);

	const createDrawingRecord = useCallback(
		async (payload: {
			type: "line" | "polygon" | "text";
			points: Array<{ lat: number; lng: number }>;
			color?: string;
			label?: string;
			eventId?: string;
		}): Promise<GeoDrawing> => {
			const response = await fetch("/api/geopolitical/drawings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
				throw new Error(errorPayload.error ?? `Drawing create failed (${response.status})`);
			}
			const parsed = (await response.json()) as GeoDrawingResponse;
			return parsed.drawing;
		},
		[],
	);

	const deleteDrawingById = useCallback(async (drawingId: string): Promise<void> => {
		const response = await fetch(`/api/geopolitical/drawings/${encodeURIComponent(drawingId)}`, {
			method: "DELETE",
		});
		if (!response.ok && response.status !== 404) {
			const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
			throw new Error(errorPayload.error ?? `Drawing delete failed (${response.status})`);
		}
	}, []);

	const fetchAll = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const eventsQuery = buildEventsQueryString();
			const candidateRegionHint =
				eventsSource === "local" && activeRegionId
					? `&regionHint=${encodeURIComponent(activeRegionId)}`
					: "";
			const [
				eventsRes,
				candidatesRes,
				timelineRes,
				regionsRes,
				sourceHealthRes,
				drawingsRes,
				graphRes,
			] = await Promise.all([
				fetch(`/api/geopolitical/events?${eventsQuery}`, { cache: "no-store" }),
				fetch(`/api/geopolitical/candidates?state=open${candidateRegionHint}`, {
					cache: "no-store",
				}),
				fetch("/api/geopolitical/timeline?limit=120", { cache: "no-store" }),
				fetch("/api/geopolitical/regions", { cache: "no-store" }),
				fetch("/api/geopolitical/sources/health", { cache: "no-store" }),
				fetch("/api/geopolitical/drawings", { cache: "no-store" }),
				fetch(`/api/geopolitical/graph?${eventsQuery}`, { cache: "no-store" }),
			]);

			if (!eventsRes.ok) {
				throw new Error(`Failed to fetch events (${eventsRes.status})`);
			}
			if (!candidatesRes.ok) {
				throw new Error(`Failed to fetch candidates (${candidatesRes.status})`);
			}
			if (!timelineRes.ok) {
				throw new Error(`Failed to fetch timeline (${timelineRes.status})`);
			}

			const eventsPayload = (await eventsRes.json()) as GeoEventsResponse;
			const candidatesPayload = (await candidatesRes.json()) as GeoCandidatesResponse;
			const timelinePayload = (await timelineRes.json()) as GeoTimelineResponse;
			const regionsPayload = (await regionsRes.json()) as GeoRegionsResponse;
			const sourceHealthPayload = (await sourceHealthRes.json()) as SourceHealthResponse;
			const drawingsPayload = (await drawingsRes.json()) as GeoDrawingsResponse;
			const graphPayload = graphRes.ok ? ((await graphRes.json()) as GeoGraphResponse) : null;

			setEvents(Array.isArray(eventsPayload.events) ? eventsPayload.events : []);
			if (eventsPayload.source === "acled" && eventsPayload.meta) {
				setAcledPage(eventsPayload.meta.page);
				setAcledPageSize(eventsPayload.meta.pageSize);
				setAcledTotal(eventsPayload.meta.total);
				setAcledHasMore(eventsPayload.meta.hasMore);
			} else {
				setAcledTotal(0);
				setAcledHasMore(false);
			}
			setCandidates(
				Array.isArray(candidatesPayload.candidates) ? candidatesPayload.candidates : [],
			);
			setTimeline(Array.isArray(timelinePayload.timeline) ? timelinePayload.timeline : []);
			setRegions(Array.isArray(regionsPayload.regions) ? regionsPayload.regions : []);
			setSourceHealth(
				Array.isArray(sourceHealthPayload.entries) ? sourceHealthPayload.entries : [],
			);
			setDrawings(Array.isArray(drawingsPayload.drawings) ? drawingsPayload.drawings : []);
			setGraph(graphPayload?.success ? graphPayload : null);
		} catch (fetchError) {
			setError(fetchError instanceof Error ? fetchError.message : "Unknown loading error");
		} finally {
			setLoading(false);
		}
	}, [activeRegionId, buildEventsQueryString, eventsSource]);

	useEffect(() => {
		void fetchAll();
	}, [fetchAll]);

	const executeDrawingCommand = useCallback(
		async (command: DrawingHistoryCommand) => {
			setBusy(true);
			setError(null);
			try {
				await command.redo();
				undoStackRef.current.push(command);
				redoStackRef.current = [];
				syncDrawingHistoryState();
				await fetchAll();
			} catch (commandError) {
				setError(commandError instanceof Error ? commandError.message : "Drawing command failed");
			} finally {
				setBusy(false);
			}
		},
		[fetchAll, syncDrawingHistoryState],
	);

	const undoDrawingCommand = useCallback(async () => {
		const command = undoStackRef.current.pop();
		if (!command) return;
		setBusy(true);
		setError(null);
		try {
			await command.undo();
			redoStackRef.current.push(command);
			syncDrawingHistoryState();
			await fetchAll();
		} catch (commandError) {
			undoStackRef.current.push(command);
			setError(commandError instanceof Error ? commandError.message : "Undo failed");
			syncDrawingHistoryState();
		} finally {
			setBusy(false);
		}
	}, [fetchAll, syncDrawingHistoryState]);

	const redoDrawingCommand = useCallback(async () => {
		const command = redoStackRef.current.pop();
		if (!command) return;
		setBusy(true);
		setError(null);
		try {
			await command.redo();
			undoStackRef.current.push(command);
			syncDrawingHistoryState();
			await fetchAll();
		} catch (commandError) {
			redoStackRef.current.push(command);
			setError(commandError instanceof Error ? commandError.message : "Redo failed");
			syncDrawingHistoryState();
		} finally {
			setBusy(false);
		}
	}, [fetchAll, syncDrawingHistoryState]);

	const fetchRegionNews = useCallback(async () => {
		try {
			const regionParam =
				eventsSource === "acled"
					? acledRegionFilter.trim() || undefined
					: activeRegionId || undefined;
			const response = await fetch(
				`/api/geopolitical/news?${new URLSearchParams({
					...(regionParam ? { region: regionParam } : {}),
					limit: "8",
				}).toString()}`,
				{ cache: "no-store" },
			);
			if (!response.ok) return;
			const payload = (await response.json()) as GeoNewsResponse;
			setNews(Array.isArray(payload.articles) ? payload.articles : []);
		} catch {
			// keep previous news
		}
	}, [acledRegionFilter, activeRegionId, eventsSource]);

	useEffect(() => {
		void fetchRegionNews();
	}, [fetchRegionNews]);

	const fetchGeopoliticalContext = useCallback(async () => {
		setContextLoading(true);
		try {
			const regionParam =
				eventsSource === "acled"
					? acledRegionFilter.trim() || undefined
					: activeRegionId || undefined;
			const query = new URLSearchParams({
				source: contextSource,
				limit: "12",
				...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
				...(regionParam ? { region: regionParam } : {}),
			});
			const response = await fetch(`/api/geopolitical/context?${query.toString()}`, {
				cache: "no-store",
			});
			if (!response.ok) {
				return;
			}
			const payload = (await response.json()) as GeoContextResponse;
			setContextItems(Array.isArray(payload.items) ? payload.items : []);
		} catch {
			// keep previous context
		} finally {
			setContextLoading(false);
		}
	}, [acledRegionFilter, activeRegionId, contextSource, eventsSource, searchQuery]);

	useEffect(() => {
		void fetchGeopoliticalContext();
	}, [fetchGeopoliticalContext]);

	const fetchGameTheoryImpact = useCallback(async () => {
		if (eventsSource !== "acled") {
			setGameTheoryItems([]);
			setGameTheorySummary(null);
			setGameTheoryLoading(false);
			return;
		}

		setGameTheoryLoading(true);
		try {
			const query = new URLSearchParams({
				limit: "80",
				...(acledCountryFilter.trim() ? { country: acledCountryFilter.trim() } : {}),
				...(acledRegionFilter.trim() ? { region: acledRegionFilter.trim() } : {}),
				...(acledEventTypeFilter.trim() ? { eventType: acledEventTypeFilter.trim() } : {}),
				...(acledSubEventTypeFilter.trim() ? { subEventType: acledSubEventTypeFilter.trim() } : {}),
				...(acledFromFilter.trim() ? { from: acledFromFilter.trim() } : {}),
				...(acledToFilter.trim() ? { to: acledToFilter.trim() } : {}),
			});
			const response = await fetch(`/api/geopolitical/game-theory/impact?${query.toString()}`, {
				cache: "no-store",
			});
			if (!response.ok) {
				return;
			}

			const payload = (await response.json()) as GeoGameTheoryResponse;
			setGameTheoryItems(Array.isArray(payload.items) ? payload.items : []);
			setGameTheorySummary(payload.summary ?? null);
		} catch {
			// keep previous game-theory view
		} finally {
			setGameTheoryLoading(false);
		}
	}, [
		acledCountryFilter,
		acledEventTypeFilter,
		acledFromFilter,
		acledRegionFilter,
		acledSubEventTypeFilter,
		acledToFilter,
		eventsSource,
	]);

	useEffect(() => {
		void fetchGameTheoryImpact();
	}, [fetchGameTheoryImpact]);

	useEffect(() => {
		if (eventsSource === "acled") {
			setActiveRegionId("");
			return;
		}
		setAcledCountryFilter("");
		setAcledRegionFilter("");
		setAcledEventTypeFilter("");
		setAcledSubEventTypeFilter("");
		setAcledFromFilter("");
		setAcledToFilter("");
		setAcledPage(1);
		setAcledTotal(0);
		setAcledHasMore(false);
	}, [eventsSource]);

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.EventSource === "undefined") return;
		const source = new window.EventSource("/api/geopolitical/stream");
		source.addEventListener("candidate.new", () => {
			void fetchAll();
		});
		source.addEventListener("candidate.updated", () => {
			void fetchAll();
		});
		source.addEventListener("event.updated", () => {
			void fetchAll();
		});
		source.addEventListener("timeline.appended", () => {
			void fetchAll();
		});

		return () => {
			source.close();
		};
	}, [fetchAll]);

	const selectedEvent = useMemo(
		() => events.find((entry) => entry.id === selectedEventId) ?? null,
		[events, selectedEventId],
	);

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
	}, [selectedEvent]);

	const handleMapClick = useCallback(
		async (coords: { lat: number; lng: number }) => {
			if (drawingMode === "line") {
				if (!pendingLineStart) {
					setPendingLineStart(coords);
					return;
				}
				const payload = {
					type: "line" as const,
					points: [pendingLineStart, coords],
					color: "#22d3ee",
					label: "Line",
				};
				let currentId: string | null = null;
				await executeDrawingCommand({
					label: "create line",
					redo: async () => {
						const drawing = await createDrawingRecord(payload);
						currentId = drawing.id;
						setSelectedDrawingId(drawing.id);
					},
					undo: async () => {
						if (!currentId) return;
						await deleteDrawingById(currentId);
						setSelectedDrawingId((prev) => (prev === currentId ? null : prev));
					},
				});
				setPendingLineStart(null);
				return;
			}

			if (drawingMode === "polygon") {
				setPendingPolygonPoints((prev) => [...prev, coords]);
				return;
			}

			if (drawingMode === "text") {
				const payload = {
					type: "text" as const,
					points: [coords],
					label: drawingTextLabel || "Text",
					color: "#f8fafc",
				};
				let currentId: string | null = null;
				await executeDrawingCommand({
					label: "create text",
					redo: async () => {
						const drawing = await createDrawingRecord(payload);
						currentId = drawing.id;
						setSelectedDrawingId(drawing.id);
					},
					undo: async () => {
						if (!currentId) return;
						await deleteDrawingById(currentId);
						setSelectedDrawingId((prev) => (prev === currentId ? null : prev));
					},
				});
				return;
			}

			setSelectedEventId(null);
			if (!eventsEditable) {
				setError("ACLED mode is read-only. Switch source to Local to place markers.");
				return;
			}
			setPendingPoint(coords);
			if (!draftTitle.trim()) {
				const defaultLabel = getGeoCatalogEntry(selectedSymbol)?.label ?? "New event";
				setDraftTitle(`${defaultLabel} marker`);
			}
		},
		[
			createDrawingRecord,
			deleteDrawingById,
			draftTitle,
			drawingMode,
			drawingTextLabel,
			eventsEditable,
			executeDrawingCommand,
			pendingLineStart,
			selectedSymbol,
		],
	);

	const completePolygonDrawing = useCallback(async () => {
		if (pendingPolygonPoints.length < 3) {
			setError("Polygon requires at least 3 points.");
			return;
		}
		const payload = {
			type: "polygon" as const,
			points: pendingPolygonPoints,
			color: "#f59e0b",
			label: "Polygon",
		};
		let currentId: string | null = null;
		await executeDrawingCommand({
			label: "create polygon",
			redo: async () => {
				const drawing = await createDrawingRecord(payload);
				currentId = drawing.id;
				setSelectedDrawingId(drawing.id);
			},
			undo: async () => {
				if (!currentId) return;
				await deleteDrawingById(currentId);
				setSelectedDrawingId((prev) => (prev === currentId ? null : prev));
			},
		});
		setPendingPolygonPoints([]);
	}, [createDrawingRecord, deleteDrawingById, executeDrawingCommand, pendingPolygonPoints]);

	const resetCreateForm = useCallback(() => {
		setPendingPoint(null);
		setDraftTitle("");
		setDraftSummary("");
		setDraftNote("");
		setDraftSeverity(2);
		setDraftConfidence(2);
	}, []);

	const createMarker = useCallback(async () => {
		if (!eventsEditable) {
			setError("ACLED mode is read-only. Switch source to Local to create/edit markers.");
			return;
		}
		if (!pendingPoint) {
			setError("Select a point on the map before creating a marker.");
			return;
		}
		if (draftTitle.trim().length < 3) {
			setError("Title must be at least 3 characters.");
			return;
		}

		const category = getGeoCatalogEntry(selectedSymbol)?.category;
		setBusy(true);
		setError(null);
		try {
			const response = await fetch("/api/geopolitical/events", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: draftTitle.trim(),
					symbol: selectedSymbol,
					category,
					severity: draftSeverity,
					confidence: draftConfidence,
					lat: pendingPoint.lat,
					lng: pendingPoint.lng,
					summary: draftSummary.trim(),
					analystNote: draftNote.trim(),
					status: "confirmed",
					countryCodes: [],
					regionIds: activeRegionId ? [activeRegionId] : [],
				}),
			});

			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
				throw new Error(errorPayload.error ?? `Create failed (${response.status})`);
			}

			const payload = (await response.json()) as GeoEventResponse;
			setSelectedEventId(payload.event.id);
			await fetchAll();
			resetCreateForm();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Could not create marker");
		} finally {
			setBusy(false);
		}
	}, [
		draftConfidence,
		draftNote,
		draftSeverity,
		draftSummary,
		draftTitle,
		fetchAll,
		pendingPoint,
		resetCreateForm,
		selectedSymbol,
		activeRegionId,
		eventsEditable,
	]);

	const updateMarker = useCallback(async () => {
		if (!eventsEditable) {
			setError("ACLED mode is read-only. Switch source to Local to create/edit markers.");
			return;
		}
		if (!selectedEvent) {
			setError("No marker selected for update.");
			return;
		}
		if (editForm.title.trim().length < 3) {
			setError("Title must be at least 3 characters.");
			return;
		}

		setBusy(true);
		setError(null);
		try {
			const response = await fetch(
				`/api/geopolitical/events/${encodeURIComponent(selectedEvent.id)}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title: editForm.title.trim(),
						severity: editForm.severity,
						confidence: editForm.confidence,
						status: editForm.status,
						summary: editForm.summary.trim(),
						analystNote: editForm.analystNote.trim(),
					}),
				},
			);

			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
				throw new Error(errorPayload.error ?? `Update failed (${response.status})`);
			}

			await fetchAll();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Could not update marker");
		} finally {
			setBusy(false);
		}
	}, [editForm, eventsEditable, fetchAll, selectedEvent]);

	const deleteMarker = useCallback(async () => {
		if (!eventsEditable) {
			setError("ACLED mode is read-only. Switch source to Local to create/edit markers.");
			return;
		}
		if (!selectedEvent) {
			setError("No marker selected for deletion.");
			return;
		}
		if (typeof window !== "undefined") {
			const confirmed = window.confirm(`Delete marker "${selectedEvent.title}"?`);
			if (!confirmed) {
				return;
			}
		}

		setBusy(true);
		setError(null);
		try {
			const response = await fetch(
				`/api/geopolitical/events/${encodeURIComponent(selectedEvent.id)}`,
				{
					method: "DELETE",
				},
			);
			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
				throw new Error(errorPayload.error ?? `Delete failed (${response.status})`);
			}

			setSelectedEventId(null);
			await fetchAll();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Could not delete marker");
		} finally {
			setBusy(false);
		}
	}, [eventsEditable, fetchAll, selectedEvent]);

	const runHardIngest = useCallback(async () => {
		setBusy(true);
		await fetch("/api/geopolitical/candidates/ingest/hard", { method: "POST" });
		setBusy(false);
		await fetchAll();
	}, [fetchAll]);

	const handleCandidateAction = useCallback(
		async (candidateId: string, action: "accept" | "reject" | "snooze") => {
			setBusy(true);
			await fetch(`/api/geopolitical/candidates/${encodeURIComponent(candidateId)}/${action}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reviewNote: `${action} via queue` }),
			});
			setBusy(false);
			await fetchAll();
		},
		[fetchAll],
	);

	const addSourceToSelectedEvent = useCallback(
		async (payload: {
			provider: string;
			url: string;
			title?: string;
			sourceTier?: "A" | "B" | "C";
		}) => {
			if (!eventsEditable) {
				setError("ACLED mode is read-only. Switch source to Local to modify event sources.");
				return;
			}
			if (!selectedEvent) return;
			setBusy(true);
			await fetch(`/api/geopolitical/events/${encodeURIComponent(selectedEvent.id)}/sources`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			setBusy(false);
			await fetchAll();
		},
		[eventsEditable, fetchAll, selectedEvent],
	);

	const addAssetToSelectedEvent = useCallback(
		async (payload: {
			symbol: string;
			assetClass: "equity" | "etf" | "fx" | "commodity" | "crypto" | "index";
			relation: "beneficiary" | "exposed" | "hedge" | "uncertain";
			rationale?: string;
		}) => {
			if (!eventsEditable) {
				setError("ACLED mode is read-only. Switch source to Local to modify event assets.");
				return;
			}
			if (!selectedEvent) return;
			setBusy(true);
			await fetch(`/api/geopolitical/events/${encodeURIComponent(selectedEvent.id)}/assets`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			setBusy(false);
			await fetchAll();
		},
		[eventsEditable, fetchAll, selectedEvent],
	);

	const deleteSelectedDrawing = useCallback(async () => {
		if (!selectedDrawingId) return;
		const drawing = drawings.find((entry) => entry.id === selectedDrawingId);
		if (!drawing) {
			setSelectedDrawingId(null);
			return;
		}

		const restorePayload = {
			type: drawing.type,
			points: drawing.points,
			label: drawing.label,
			color: drawing.color,
			eventId: drawing.eventId,
		};
		let activeDeletedId = drawing.id;

		await executeDrawingCommand({
			label: "delete drawing",
			redo: async () => {
				await deleteDrawingById(activeDeletedId);
				setSelectedDrawingId((prev) => (prev === activeDeletedId ? null : prev));
			},
			undo: async () => {
				const restored = await createDrawingRecord(restorePayload);
				activeDeletedId = restored.id;
				setSelectedDrawingId(restored.id);
			},
		});
	}, [createDrawingRecord, deleteDrawingById, drawings, executeDrawingCommand, selectedDrawingId]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const tagName = target?.tagName?.toLowerCase();
			const isEditable =
				target?.isContentEditable ||
				tagName === "input" ||
				tagName === "textarea" ||
				tagName === "select";
			if (isEditable) {
				return;
			}

			const key = event.key.toLowerCase();
			const withModifier = event.ctrlKey || event.metaKey;
			if (withModifier && key === "z") {
				event.preventDefault();
				if (event.shiftKey) {
					void redoDrawingCommand();
				} else {
					void undoDrawingCommand();
				}
				return;
			}
			if (withModifier && key === "y") {
				event.preventDefault();
				void redoDrawingCommand();
				return;
			}

			if (key === "m") setDrawingMode("marker");
			if (key === "l") setDrawingMode("line");
			if (key === "p") setDrawingMode("polygon");
			if (key === "t") setDrawingMode("text");
			if (key === "c") setShowCandidateQueue((prev) => !prev);
			if (key === "r") setShowRegionLayer((prev) => !prev);

			if (event.key === "Delete") {
				if (selectedDrawingId) {
					void deleteSelectedDrawing();
				} else if (selectedEventId) {
					void deleteMarker();
				}
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [
		deleteMarker,
		deleteSelectedDrawing,
		redoDrawingCommand,
		selectedDrawingId,
		selectedEventId,
		undoDrawingCommand,
	]);

	const activeRegionLabel = useMemo(() => {
		if (eventsSource === "acled") {
			return acledRegionFilter.trim() || "All regions";
		}
		if (!activeRegionId) return "All regions";
		return regions.find((region) => region.id === activeRegionId)?.label ?? activeRegionId;
	}, [acledRegionFilter, activeRegionId, eventsSource, regions]);

	return (
		<div className="flex h-screen min-h-screen flex-col overflow-hidden bg-background text-foreground">
			<MapShellHeader
				eventsCount={events.length}
				loading={loading}
				busy={busy}
				onRefresh={() => void fetchAll()}
				onRunHardIngest={() => void runHardIngest()}
			/>

			<div className="flex min-h-0 flex-1 overflow-hidden">
				<aside className="w-72 shrink-0 overflow-y-auto border-r border-border p-3 space-y-3">
					<SymbolToolbar selectedSymbol={selectedSymbol} onSelectSymbol={setSelectedSymbol} />

					<DrawModePanel
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
				</aside>

				<main className="flex min-w-0 flex-1 flex-col">
					<div className="flex items-center gap-2 border-b border-border px-3 py-2">
						<select
							className="h-9 rounded-md border border-input bg-background px-2 text-sm"
							value={eventsSource}
							onChange={(event) => {
								setEventsSource(event.target.value as EventsSource);
								setAcledPage(1);
							}}
							aria-label="Event source mode"
						>
							<option value="local">Local</option>
							<option value="acled">ACLED (Go Gateway)</option>
						</select>
						{eventsSource === "local" ? (
							<select
								className="h-9 rounded-md border border-input bg-background px-2 text-sm"
								value={activeRegionId}
								onChange={(event) => setActiveRegionId(event.target.value)}
								aria-label="Filter events by region"
							>
								<option value="">All regions</option>
								{regions.map((region) => (
									<option key={region.id} value={region.id}>
										{region.label}
									</option>
								))}
							</select>
						) : (
							<Input
								value={acledCountryFilter}
								onChange={(event) => {
									setAcledCountryFilter(event.target.value);
									setAcledPage(1);
								}}
								placeholder="ACLED country"
								aria-label="ACLED country filter"
							/>
						)}
						<select
							className="h-9 rounded-md border border-input bg-background px-2 text-sm"
							value={minSeverityFilter}
							onChange={(event) => setMinSeverityFilter(Number(event.target.value))}
							aria-label="Minimum severity filter"
						>
							{[1, 2, 3, 4, 5].map((value) => (
								<option key={value} value={value}>
									Min S{value}
								</option>
							))}
						</select>
						<Input
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search events"
							aria-label="Search geopolitical events"
						/>
						{eventsSource === "acled" && (
							<>
								<Input
									value={acledRegionFilter}
									onChange={(event) => {
										setAcledRegionFilter(event.target.value);
										setAcledPage(1);
									}}
									placeholder="ACLED region"
									aria-label="ACLED region filter"
								/>
								<Input
									value={acledEventTypeFilter}
									onChange={(event) => {
										setAcledEventTypeFilter(event.target.value);
										setAcledPage(1);
									}}
									placeholder="Event type"
									aria-label="ACLED event type filter"
								/>
								<Input
									value={acledSubEventTypeFilter}
									onChange={(event) => {
										setAcledSubEventTypeFilter(event.target.value);
										setAcledPage(1);
									}}
									placeholder="Sub-event type"
									aria-label="ACLED sub-event type filter"
								/>
								<Input
									value={acledFromFilter}
									onChange={(event) => {
										setAcledFromFilter(event.target.value);
										setAcledPage(1);
									}}
									placeholder="From YYYY-MM-DD"
									aria-label="ACLED from date"
								/>
								<Input
									value={acledToFilter}
									onChange={(event) => {
										setAcledToFilter(event.target.value);
										setAcledPage(1);
									}}
									placeholder="To YYYY-MM-DD"
									aria-label="ACLED to date"
								/>
							</>
						)}
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								void fetchAll();
								void fetchRegionNews();
								void fetchGeopoliticalContext();
								void fetchGameTheoryImpact();
							}}
							aria-label="Apply geopolitical filters"
						>
							<Crosshair className="mr-2 h-4 w-4" />
							Apply
						</Button>
						<span className="text-xs text-muted-foreground">region: {activeRegionLabel}</span>
					</div>
					<div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-3 py-2">
						{activeFilterChips.length === 0 ? (
							<span className="text-xs text-muted-foreground">No active filters.</span>
						) : (
							activeFilterChips.map((chip) => (
								<button
									type="button"
									key={chip.key}
									className="rounded border border-border px-2 py-0.5 text-[11px] hover:bg-muted"
									onClick={chip.clear}
									title="Click to clear filter"
								>
									{chip.label} ×
								</button>
							))
						)}
						{eventsSource === "acled" && (
							<>
								<span className="ml-2 text-xs text-muted-foreground">
									page {acledPage} | total {acledTotal}
								</span>
								<Button
									size="sm"
									variant="outline"
									disabled={acledPage <= 1}
									onClick={() => setAcledPage((previous) => Math.max(1, previous - 1))}
								>
									Prev
								</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={!acledHasMore}
									onClick={() => setAcledPage((previous) => previous + 1)}
								>
									Next
								</Button>
							</>
						)}
					</div>
					{eventsSource === "acled" && (
						<div className="flex flex-wrap gap-2 border-b border-border/60 px-3 py-2">
							{acledRegionSuggestions.slice(0, 8).map((region) => (
								<button
									key={`region-${region}`}
									type="button"
									className="rounded border border-border px-2 py-0.5 text-[11px] hover:bg-muted"
									onClick={() => {
										setAcledRegionFilter(region);
										setAcledPage(1);
									}}
								>
									region: {region}
								</button>
							))}
							{acledSubEventSuggestions.slice(0, 8).map((subEventType) => (
								<button
									key={`sub-${subEventType}`}
									type="button"
									className="rounded border border-border px-2 py-0.5 text-[11px] hover:bg-muted"
									onClick={() => {
										setAcledSubEventTypeFilter(subEventType);
										setAcledPage(1);
									}}
								>
									sub: {subEventType}
								</button>
							))}
						</div>
					)}

					<div className="flex min-h-0 flex-1 overflow-hidden p-3">
						{loading ? (
							<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
								Loading geopolitical workspace...
							</div>
						) : (
							<MapCanvas
								events={events}
								drawings={drawings}
								showRegionLayer={showRegionLayer}
								selectedEventId={selectedEventId}
								selectedDrawingId={selectedDrawingId}
								onSelectEvent={(eventId) => {
									setSelectedEventId(eventId);
									setSelectedDrawingId(null);
								}}
								onSelectDrawing={(drawingId) => {
									setSelectedDrawingId(drawingId);
									setSelectedEventId(null);
								}}
								onMapClick={(coords) => {
									void handleMapClick(coords);
								}}
								onCountryClick={(countryId) => {
									if (eventsSource === "acled") {
										setAcledCountryFilter(countryId);
										setAcledPage(1);
									} else {
										setSearchQuery(countryId);
									}
								}}
							/>
						)}
					</div>

					<TimelineStrip timeline={timeline.slice(0, 40)} />
				</main>

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
						onDraftTitleChange={setDraftTitle}
						onDraftSummaryChange={setDraftSummary}
						onDraftNoteChange={setDraftNote}
						onDraftSeverityChange={setDraftSeverity}
						onDraftConfidenceChange={setDraftConfidence}
						onSetPoint={setPendingPoint}
						onCreate={() => void createMarker()}
						onClear={resetCreateForm}
					/>

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

					{showCandidateQueue ? (
						<CandidateQueue
							candidates={candidates}
							busy={busy}
							onAccept={(candidateId) => {
								void handleCandidateAction(candidateId, "accept");
							}}
							onReject={(candidateId) => {
								void handleCandidateAction(candidateId, "reject");
							}}
							onSnooze={(candidateId) => {
								void handleCandidateAction(candidateId, "snooze");
							}}
						/>
					) : (
						<section className="rounded-md border border-border bg-card p-3">
							<h2 className="text-sm font-semibold">Candidate Queue</h2>
							<p className="mt-1 text-xs text-muted-foreground">Hidden (toggle with key C)</p>
						</section>
					)}

					<RegionNewsPanel activeRegionLabel={activeRegionLabel} news={news} />

					<GeoPulseInsightsPanel graph={graph} />

					<GeopoliticalGameTheoryPanel
						enabled={eventsSource === "acled"}
						loading={gameTheoryLoading}
						items={gameTheoryItems}
						summary={gameTheorySummary ?? null}
					/>

					<GeopoliticalContextPanel
						source={contextSource}
						items={contextItems}
						loading={contextLoading}
						onSourceChange={setContextSource}
					/>

					<SourceHealthPanel entries={sourceHealth} />

					<MarkerListPanel
						events={events}
						selectedEventId={selectedEventId}
						onSelectEvent={(eventId) => {
							setSelectedEventId(eventId);
							setSelectedDrawingId(null);
						}}
					/>
				</aside>
			</div>

			<footer className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
				SSE, candidate workflow, timeline, source health, region news, CFR/CrisisWatch context
				panel, GeoPulse graph insights, GameTheory impact slice, and drawing primitives are active.
			</footer>
		</div>
	);
}
