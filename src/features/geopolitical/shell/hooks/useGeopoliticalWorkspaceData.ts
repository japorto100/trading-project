import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import type {
	GeoCandidatesResponse,
	GeoContextResponse,
	GeoDrawingsResponse,
	GeoEventsResponse,
	GeoGameTheoryResponse,
	GeoGraphResponse,
	GeoNewsResponse,
	GeoRegionsResponse,
	GeoTimelineResponse,
	SourceHealthResponse,
} from "@/features/geopolitical/shell/types";
import { useGeoMapWorkspaceStore } from "@/features/geopolitical/store";

export function useGeopoliticalWorkspaceData() {
	const {
		activeRegionId,
		setActiveRegionId,
		searchQuery,
		minSeverityFilter,
		eventsSource,
		acledCountryFilter,
		acledRegionFilter,
		acledEventTypeFilter,
		acledSubEventTypeFilter,
		acledFromFilter,
		acledToFilter,
		acledPage,
		acledPageSize,
		contextSource,
		setAcledPage,
		setAcledPageSize,
		setAcledTotal,
		setAcledHasMore,
		setEvents,
		setCandidates,
		setTimeline,
		setRegions,
		setSourceHealth,
		setDrawings,
		setGraph,
		setNews,
		setContextItems,
		setContextLoading,
		setGameTheoryItems,
		setGameTheorySummary,
		setGameTheoryLoading,
		setLoading,
		setError,
		resetExternalFilters,
	} = useGeoMapWorkspaceStore(
		useShallow((state) => ({
			activeRegionId: state.activeRegionId,
			setActiveRegionId: state.setActiveRegionId,
			searchQuery: state.searchQuery,
			minSeverityFilter: state.minSeverityFilter,
			eventsSource: state.eventsSource,
			acledCountryFilter: state.acledCountryFilter,
			acledRegionFilter: state.acledRegionFilter,
			acledEventTypeFilter: state.acledEventTypeFilter,
			acledSubEventTypeFilter: state.acledSubEventTypeFilter,
			acledFromFilter: state.acledFromFilter,
			acledToFilter: state.acledToFilter,
			acledPage: state.acledPage,
			acledPageSize: state.acledPageSize,
			contextSource: state.contextSource,
			setAcledPage: state.setAcledPage,
			setAcledPageSize: state.setAcledPageSize,
			setAcledTotal: state.setAcledTotal,
			setAcledHasMore: state.setAcledHasMore,
			setEvents: state.setEvents,
			setCandidates: state.setCandidates,
			setTimeline: state.setTimeline,
			setRegions: state.setRegions,
			setSourceHealth: state.setSourceHealth,
			setDrawings: state.setDrawings,
			setGraph: state.setGraph,
			setNews: state.setNews,
			setContextItems: state.setContextItems,
			setContextLoading: state.setContextLoading,
			setGameTheoryItems: state.setGameTheoryItems,
			setGameTheorySummary: state.setGameTheorySummary,
			setGameTheoryLoading: state.setGameTheoryLoading,
			setLoading: state.setLoading,
			setError: state.setError,
			resetExternalFilters: state.resetExternalFilters,
		})),
	);

	const isExternalSource = eventsSource !== "local";

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

		params.set("source", eventsSource);
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
			if (
				(eventsPayload.source === "acled" || eventsPayload.source === "gdelt") &&
				eventsPayload.meta
			) {
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
	}, [
		activeRegionId,
		buildEventsQueryString,
		eventsSource,
		setAcledHasMore,
		setAcledPage,
		setAcledPageSize,
		setAcledTotal,
		setCandidates,
		setDrawings,
		setError,
		setEvents,
		setGraph,
		setLoading,
		setRegions,
		setSourceHealth,
		setTimeline,
	]);

	const fetchRegionNews = useCallback(async () => {
		try {
			const regionParam = isExternalSource
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
	}, [acledRegionFilter, activeRegionId, isExternalSource, setNews]);

	const fetchGeopoliticalContext = useCallback(async () => {
		setContextLoading(true);
		try {
			const regionParam = isExternalSource
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
	}, [
		acledRegionFilter,
		activeRegionId,
		contextSource,
		isExternalSource,
		searchQuery,
		setContextItems,
		setContextLoading,
	]);

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
		setGameTheoryItems,
		setGameTheoryLoading,
		setGameTheorySummary,
	]);

	useEffect(() => {
		void fetchAll();
	}, [fetchAll]);

	useEffect(() => {
		void fetchRegionNews();
	}, [fetchRegionNews]);

	useEffect(() => {
		void fetchGeopoliticalContext();
	}, [fetchGeopoliticalContext]);

	useEffect(() => {
		void fetchGameTheoryImpact();
	}, [fetchGameTheoryImpact]);

	useEffect(() => {
		if (isExternalSource) {
			setActiveRegionId("");
			return;
		}
		resetExternalFilters();
	}, [isExternalSource, resetExternalFilters, setActiveRegionId]);

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

	return {
		fetchAll,
		fetchRegionNews,
		fetchGeopoliticalContext,
		fetchGameTheoryImpact,
	};
}
