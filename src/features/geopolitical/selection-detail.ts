"use client";

import type { GeoContextItem } from "@/features/geopolitical/shell/types";
import type { GeoCandidate, GeoEvent, GeoTimelineEntry } from "@/lib/geopolitical/types";
import type { MarketNewsArticle } from "@/lib/news/types";

export interface GeoSelectionDetail {
	kind: "event" | "timeline" | "candidate" | "context" | "news";
	id: string;
	linkedEventId?: string;
	title: string;
	subtitle?: string;
	summary?: string;
	primaryMeta: string[];
	secondaryMeta: string[];
}

function formatPoint(event: GeoEvent): string | null {
	const point = event.coordinates?.[0];
	if (!point) return null;
	return `${point.lat.toFixed(2)}, ${point.lng.toFixed(2)}`;
}

function formatTimelineAction(action: GeoTimelineEntry["action"]): string {
	return action
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function formatShortDate(value?: string): string | null {
	if (!value) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toISOString().slice(0, 10);
}

export function buildGeoEventSelectionDetail(event: GeoEvent): GeoSelectionDetail {
	const subtitleParts = [event.category, event.subcategory].filter(Boolean);
	const geography =
		event.countryCodes.length > 0
			? event.countryCodes.join(", ")
			: event.regionIds.length > 0
				? event.regionIds.join(", ")
				: null;
	const point = formatPoint(event);

	return {
		kind: "event",
		id: event.id,
		title: event.title,
		subtitle: subtitleParts.join(" / ") || undefined,
		summary: event.summary ?? event.analystNote ?? undefined,
		primaryMeta: [event.status, `S${event.severity}`, `C${event.confidence}`, event.symbol],
		secondaryMeta: [geography, point, event.externalSource].filter((value): value is string =>
			Boolean(value),
		),
	};
}

export function buildGeoTimelineSelectionDetail(entry: GeoTimelineEntry): GeoSelectionDetail {
	return {
		kind: "timeline",
		id: entry.id,
		linkedEventId: entry.eventId,
		title: formatTimelineAction(entry.action),
		subtitle: `event ${entry.eventId}`,
		summary: entry.diffSummary,
		primaryMeta: [entry.actor, new Date(entry.at).toLocaleString()],
		secondaryMeta: [entry.action],
	};
}

export function buildGeoCandidateSelectionDetail(candidate: GeoCandidate): GeoSelectionDetail {
	const geography = [
		candidate.regionHint,
		candidate.countryHints?.length ? candidate.countryHints.join(", ") : null,
	]
		.filter((value): value is string => Boolean(value))
		.join(" • ");

	return {
		kind: "candidate",
		id: candidate.id,
		title: candidate.headline,
		subtitle: candidate.triggerType.replaceAll("_", " "),
		summary: candidate.reviewNote ?? undefined,
		primaryMeta: [
			candidate.state,
			`S${candidate.severityHint}`,
			`conf ${candidate.confidence.toFixed(2)}`,
			candidate.routeTarget ?? "geo",
			candidate.reviewAction ?? "human_review",
		],
		secondaryMeta: [geography, candidate.category, candidate.symbol].filter(
			(value): value is string => Boolean(value),
		),
	};
}

export function buildGeoContextSelectionDetail(item: GeoContextItem): GeoSelectionDetail {
	return {
		kind: "context",
		id: item.id,
		title: item.title,
		subtitle: item.source.toUpperCase(),
		summary: item.summary ?? undefined,
		primaryMeta: [item.source.toUpperCase(), formatShortDate(item.publishedAt)].filter(
			(value): value is string => Boolean(value),
		),
		secondaryMeta: [item.region].filter((value): value is string => Boolean(value)),
	};
}

export function buildGeoNewsSelectionDetail(article: MarketNewsArticle): GeoSelectionDetail {
	return {
		kind: "news",
		id: article.id,
		title: article.title,
		subtitle: article.source,
		summary: article.summary ?? undefined,
		primaryMeta: [article.provider, formatShortDate(article.publishedAt)].filter(
			(value): value is string => Boolean(value),
		),
		secondaryMeta: [article.sentiment].filter((value): value is string => Boolean(value)),
	};
}
