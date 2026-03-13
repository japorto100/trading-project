import type { EventsSource } from "@/features/geopolitical/store";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

export interface GeoFilterStateSnapshot {
	eventsSource: EventsSource;
	activeRegionId: string;
	searchQuery: string;
	minSeverityFilter: number;
	acledCountryFilter: string;
	acledRegionFilter: string;
	acledEventTypeFilter: string;
	acledSubEventTypeFilter: string;
	acledFromFilter: string;
	acledToFilter: string;
}

export interface GeoFilterChipDescriptor {
	key: string;
	label: string;
}

function containsIgnoreCase(value: string | undefined, query: string): boolean {
	if (!value) return false;
	return value.toLowerCase().includes(query.toLowerCase());
}

export function buildGeoFilterChips(snapshot: GeoFilterStateSnapshot): GeoFilterChipDescriptor[] {
	const chips: GeoFilterChipDescriptor[] = [];
	if (snapshot.eventsSource === "local") {
		if (snapshot.activeRegionId.trim()) {
			chips.push({
				key: "local-region",
				label: `Region: ${snapshot.activeRegionId.trim()}`,
			});
		}
		if (snapshot.searchQuery.trim()) {
			chips.push({
				key: "local-q",
				label: `Search: ${snapshot.searchQuery.trim()}`,
			});
		}
		if (snapshot.minSeverityFilter > 1) {
			chips.push({
				key: "local-severity",
				label: `Min Severity: S${snapshot.minSeverityFilter}`,
			});
		}
		return chips;
	}

	if (snapshot.acledCountryFilter.trim()) {
		chips.push({
			key: "acled-country",
			label: `Country: ${snapshot.acledCountryFilter.trim()}`,
		});
	}
	if (snapshot.acledRegionFilter.trim()) {
		chips.push({
			key: "acled-region",
			label: `Region: ${snapshot.acledRegionFilter.trim()}`,
		});
	}
	if (snapshot.acledEventTypeFilter.trim()) {
		chips.push({
			key: "acled-event-type",
			label: `Type: ${snapshot.acledEventTypeFilter.trim()}`,
		});
	}
	if (snapshot.acledSubEventTypeFilter.trim()) {
		chips.push({
			key: "acled-sub-event-type",
			label: `Sub-Event: ${snapshot.acledSubEventTypeFilter.trim()}`,
		});
	}
	if (snapshot.acledFromFilter.trim()) {
		chips.push({
			key: "acled-from",
			label: `From: ${snapshot.acledFromFilter.trim()}`,
		});
	}
	if (snapshot.acledToFilter.trim()) {
		chips.push({
			key: "acled-to",
			label: `To: ${snapshot.acledToFilter.trim()}`,
		});
	}
	if (snapshot.searchQuery.trim()) {
		chips.push({
			key: "acled-q",
			label: `Search: ${snapshot.searchQuery.trim()}`,
		});
	}
	if (snapshot.minSeverityFilter > 1) {
		chips.push({
			key: "acled-severity",
			label: `Min Severity: S${snapshot.minSeverityFilter}`,
		});
	}
	return chips;
}

export function matchesGeoEventFilters(event: GeoEvent, snapshot: GeoFilterStateSnapshot): boolean {
	if (event.severity < snapshot.minSeverityFilter) {
		return false;
	}

	if (snapshot.eventsSource === "local") {
		if (
			snapshot.activeRegionId.trim() &&
			!event.regionIds.includes(snapshot.activeRegionId.trim())
		) {
			return false;
		}
		if (snapshot.searchQuery.trim()) {
			const query = snapshot.searchQuery.trim();
			const searchHaystack = [
				event.title,
				event.summary,
				event.analystNote,
				event.category,
				event.subcategory,
				event.symbol,
				...event.countryCodes,
				...event.regionIds,
			];
			if (!searchHaystack.some((value) => containsIgnoreCase(value, query))) {
				return false;
			}
		}
		return true;
	}

	if (
		snapshot.acledCountryFilter.trim() &&
		!event.countryCodes.some((code) => containsIgnoreCase(code, snapshot.acledCountryFilter.trim()))
	) {
		return false;
	}
	if (
		snapshot.acledRegionFilter.trim() &&
		!containsIgnoreCase(event.externalRegion, snapshot.acledRegionFilter.trim())
	) {
		return false;
	}
	if (
		snapshot.acledEventTypeFilter.trim() &&
		!containsIgnoreCase(event.externalEventType, snapshot.acledEventTypeFilter.trim())
	) {
		return false;
	}
	if (
		snapshot.acledSubEventTypeFilter.trim() &&
		!containsIgnoreCase(event.externalSubEventType, snapshot.acledSubEventTypeFilter.trim())
	) {
		return false;
	}
	if (snapshot.acledFromFilter.trim()) {
		const fromMs = new Date(snapshot.acledFromFilter.trim()).getTime();
		const eventMs = new Date(event.createdAt).getTime();
		if (Number.isFinite(fromMs) && Number.isFinite(eventMs) && eventMs < fromMs) {
			return false;
		}
	}
	if (snapshot.acledToFilter.trim()) {
		const toMs = new Date(snapshot.acledToFilter.trim()).getTime();
		const eventMs = new Date(event.createdAt).getTime();
		if (Number.isFinite(toMs) && Number.isFinite(eventMs) && eventMs > toMs) {
			return false;
		}
	}
	if (snapshot.searchQuery.trim()) {
		const query = snapshot.searchQuery.trim();
		const searchHaystack = [
			event.title,
			event.summary,
			event.analystNote,
			event.externalRegion,
			event.externalEventType,
			event.externalSubEventType,
			...event.countryCodes,
		];
		if (!searchHaystack.some((value) => containsIgnoreCase(value, query))) {
			return false;
		}
	}
	return true;
}

export function filterGeoEventsByFilters(
	events: GeoEvent[],
	snapshot: GeoFilterStateSnapshot,
): GeoEvent[] {
	return events.filter((event) => matchesGeoEventFilters(event, snapshot));
}

export function matchesGeoCandidateFilters(
	candidate: GeoCandidate,
	snapshot: GeoFilterStateSnapshot,
): boolean {
	if (candidate.severityHint < snapshot.minSeverityFilter) {
		return false;
	}

	const normalizedRegionHint = candidate.regionHint?.trim().toLowerCase() ?? "";
	const normalizedCountryHints =
		candidate.countryHints?.map((hint) => hint.trim().toLowerCase()) ?? [];

	if (snapshot.eventsSource === "local") {
		if (
			snapshot.activeRegionId.trim() &&
			normalizedRegionHint &&
			normalizedRegionHint !== snapshot.activeRegionId.trim().toLowerCase()
		) {
			return false;
		}

		if (snapshot.searchQuery.trim()) {
			const query = snapshot.searchQuery.trim();
			const searchHaystack = [
				candidate.headline,
				candidate.reviewNote,
				candidate.category,
				candidate.symbol,
				candidate.regionHint,
				...(candidate.countryHints ?? []),
			];
			if (!searchHaystack.some((value) => containsIgnoreCase(value, query))) {
				return false;
			}
		}

		return true;
	}

	if (
		snapshot.acledRegionFilter.trim() &&
		normalizedRegionHint &&
		!containsIgnoreCase(normalizedRegionHint, snapshot.acledRegionFilter.trim())
	) {
		return false;
	}

	if (
		snapshot.acledCountryFilter.trim() &&
		normalizedCountryHints.length > 0 &&
		!normalizedCountryHints.some((value) =>
			containsIgnoreCase(value, snapshot.acledCountryFilter.trim()),
		)
	) {
		return false;
	}

	if (snapshot.searchQuery.trim()) {
		const query = snapshot.searchQuery.trim();
		const searchHaystack = [
			candidate.headline,
			candidate.reviewNote,
			candidate.category,
			candidate.symbol,
			candidate.regionHint,
			...(candidate.countryHints ?? []),
		];
		if (!searchHaystack.some((value) => containsIgnoreCase(value, query))) {
			return false;
		}
	}

	return true;
}

export function filterGeoCandidatesByFilters(
	candidates: GeoCandidate[],
	snapshot: GeoFilterStateSnapshot,
): GeoCandidate[] {
	return candidates.filter((candidate) => matchesGeoCandidateFilters(candidate, snapshot));
}

export function filterGeoNewsByFilters(
	articles: MarketNewsArticle[],
	snapshot: GeoFilterStateSnapshot,
): MarketNewsArticle[] {
	if (!snapshot.searchQuery.trim()) {
		return articles;
	}

	const query = snapshot.searchQuery.trim();
	return articles.filter((article) =>
		[article.title, article.summary, article.source, article.provider].some((value) =>
			containsIgnoreCase(value, query),
		),
	);
}

export function filterGeoTimelineByVisibleEvents(
	timeline: GeoTimelineEntry[],
	events: GeoEvent[],
): GeoTimelineEntry[] {
	if (events.length === 0 || timeline.length === 0) {
		return [];
	}
	const visibleEventIds = new Set(events.map((event) => event.id));
	return timeline.filter((entry) => visibleEventIds.has(entry.eventId));
}
