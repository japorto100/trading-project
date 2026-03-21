import { getMarkerSeverityColor } from "@/features/geopolitical/d3/scales";
import {
	getMarkerSymbolLabel,
	getMarkerSymbolPath,
	type MarkerSymbol,
} from "@/features/geopolitical/markerSymbols";
import type { GeoMapMarkerPoint } from "@/features/geopolitical/rendering/useGeoMapProjectionModel";
import { buildGeoEventSelectionDetail } from "@/features/geopolitical/selection-detail";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface GeoMarkerInteractionState {
	selected: boolean;
	multiSelected: boolean;
	hovered: boolean;
}

export interface GeoMarkerListItemModel {
	id: string;
	title: string;
	subtitle: string;
	symbolLabel: string;
	symbolPath: string;
	severityColor: string;
	secondaryLabel: string;
	primaryMeta: string[];
	severityBadgeLabel: string;
}

export interface GeoMarkerPopupSourceModel {
	id: string;
	title?: string;
	provider: string;
	url: string;
}

export interface GeoMarkerPopupModel {
	id: string;
	title: string;
	severity: 1 | 2 | 3 | 4 | 5;
	severityColor: string;
	categoryLabel: string;
	summary: string;
	sources: GeoMarkerPopupSourceModel[];
	updatedDateLabel: string;
	x: number;
	y: number;
}

export function buildGeoMarkerInteractionState(params: {
	markerId: string;
	selectedEventId: string | null;
	selectedEventIds: Set<string>;
	hoverEventId: string | null;
}): GeoMarkerInteractionState {
	return {
		selected: params.markerId === params.selectedEventId,
		multiSelected: params.selectedEventIds.has(params.markerId),
		hovered: params.markerId === params.hoverEventId,
	};
}

export function buildGeoMarkerSymbolPath(symbol: MarkerSymbol, scale = 95): string {
	return getMarkerSymbolPath(symbol, scale);
}

export function buildGeoMarkerListItemModel(event: GeoEvent): GeoMarkerListItemModel {
	const detail = buildGeoEventSelectionDetail(event);
	return {
		id: event.id,
		title: detail.title,
		subtitle: detail.subtitle ?? getMarkerSymbolLabel(event.symbol),
		symbolLabel: getMarkerSymbolLabel(event.symbol),
		symbolPath: buildGeoMarkerSymbolPath(event.symbol, 90),
		severityColor: getMarkerSeverityColor(event.severity),
		secondaryLabel: detail.secondaryMeta[0] ?? "n/a",
		primaryMeta: detail.primaryMeta,
		severityBadgeLabel: `S${event.severity}`,
	};
}

export function buildGeoMarkerPopupModel(marker: GeoMapMarkerPoint): GeoMarkerPopupModel {
	return {
		id: marker.id,
		title: marker.title,
		severity: marker.severity as 1 | 2 | 3 | 4 | 5,
		severityColor: getMarkerSeverityColor(marker.severity),
		categoryLabel: marker.raw.category.replace(/_/g, " "),
		summary: marker.raw.summary || "No detailed summary available for this event.",
		sources: marker.raw.sources.map((source) => ({
			id: source.id,
			title: source.title,
			provider: source.provider,
			url: source.url,
		})),
		updatedDateLabel: new Date(marker.raw.updatedAt).toLocaleDateString(),
		x: marker.x,
		y: marker.y,
	};
}
