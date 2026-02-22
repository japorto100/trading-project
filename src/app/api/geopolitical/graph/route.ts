import { type NextRequest, NextResponse } from "next/server";
import type { GeoEvent } from "@/lib/geopolitical/types";
import { fetchExternalEventsViaGateway } from "@/lib/server/geopolitical-acled-bridge";
import { listGeoEvents } from "@/lib/server/geopolitical-events-store";

export const runtime = "nodejs";

type NodeType = "event" | "region" | "event_type" | "sub_event_type" | "asset";
type EdgeType = "event-region" | "event-type" | "event-subevent" | "event-asset";

interface GraphNode {
	id: string;
	label: string;
	type: NodeType;
	weight: number;
}

interface GraphEdge {
	id: string;
	source: string;
	target: string;
	type: EdgeType;
	weight: number;
}

function normalizeLabel(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

function addNode(map: Map<string, GraphNode>, id: string, label: string, type: NodeType): void {
	const existing = map.get(id);
	if (existing) {
		existing.weight += 1;
		return;
	}
	map.set(id, { id, label, type, weight: 1 });
}

function addEdge(
	map: Map<string, GraphEdge>,
	source: string,
	target: string,
	type: EdgeType,
): void {
	const id = `${type}:${source}->${target}`;
	const existing = map.get(id);
	if (existing) {
		existing.weight += 1;
		return;
	}
	map.set(id, { id, source, target, type, weight: 1 });
}

function buildGraph(events: GeoEvent[]) {
	const nodes = new Map<string, GraphNode>();
	const edges = new Map<string, GraphEdge>();

	for (const event of events) {
		const eventNodeID = `event:${event.id}`;
		addNode(nodes, eventNodeID, event.title, "event");

		const eventType = normalizeLabel(event.externalEventType || event.category || "unknown");
		if (eventType) {
			const eventTypeID = `event_type:${eventType.toLowerCase()}`;
			addNode(nodes, eventTypeID, eventType, "event_type");
			addEdge(edges, eventNodeID, eventTypeID, "event-type");
		}

		const subEventType = normalizeLabel(
			event.externalSubEventType || event.subcategory || "unknown-subevent",
		);
		if (subEventType && subEventType !== "unknown-subevent") {
			const subEventTypeID = `sub_event_type:${subEventType.toLowerCase()}`;
			addNode(nodes, subEventTypeID, subEventType, "sub_event_type");
			addEdge(edges, eventNodeID, subEventTypeID, "event-subevent");
		}

		const regionLabels = new Set<string>();
		if (event.externalRegion) regionLabels.add(event.externalRegion);
		for (const regionID of event.regionIds) {
			regionLabels.add(regionID);
		}
		for (const region of regionLabels) {
			const clean = normalizeLabel(region);
			if (!clean) continue;
			const regionID = `region:${clean.toLowerCase()}`;
			addNode(nodes, regionID, clean, "region");
			addEdge(edges, eventNodeID, regionID, "event-region");
		}

		for (const asset of event.assets) {
			const symbol = normalizeLabel(asset.symbol);
			if (!symbol) continue;
			const assetID = `asset:${symbol.toLowerCase()}`;
			addNode(nodes, assetID, symbol, "asset");
			addEdge(edges, eventNodeID, assetID, "event-asset");
		}
	}

	const allNodes = [...nodes.values()].sort((a, b) => b.weight - a.weight);
	const allEdges = [...edges.values()].sort((a, b) => b.weight - a.weight);
	const topRegions = allNodes
		.filter((node) => node.type === "region")
		.slice(0, 8)
		.map((node) => node.label);
	const topSubEventTypes = allNodes
		.filter((node) => node.type === "sub_event_type")
		.slice(0, 8)
		.map((node) => node.label);

	return {
		nodeCount: allNodes.length,
		edgeCount: allEdges.length,
		nodes: allNodes.slice(0, 160),
		edges: allEdges.slice(0, 200),
		topRegions,
		topSubEventTypes,
	};
}

export async function GET(request: NextRequest) {
	const source = request.nextUrl.searchParams.get("source")?.trim().toLowerCase() ?? "local";
	if (source !== "local" && source !== "acled" && source !== "gdelt") {
		return NextResponse.json({ success: false, error: "invalid source" }, { status: 400 });
	}
	const q = request.nextUrl.searchParams.get("q") ?? undefined;
	const regionID = request.nextUrl.searchParams.get("regionId") ?? undefined;
	const minSeverityRaw = Number(request.nextUrl.searchParams.get("minSeverity") ?? "0");

	try {
		let events: GeoEvent[];
		if (source === "acled" || source === "gdelt") {
			const external = await fetchExternalEventsViaGateway({
				source,
				country: request.nextUrl.searchParams.get("country") ?? undefined,
				region: request.nextUrl.searchParams.get("region") ?? undefined,
				eventType: request.nextUrl.searchParams.get("eventType") ?? undefined,
				subEventType: request.nextUrl.searchParams.get("subEventType") ?? undefined,
				from: request.nextUrl.searchParams.get("from") ?? undefined,
				to: request.nextUrl.searchParams.get("to") ?? undefined,
				page: Number(request.nextUrl.searchParams.get("page") ?? "1"),
				pageSize: Number(request.nextUrl.searchParams.get("pageSize") ?? "200"),
			});
			events = external.events;
		} else {
			events = await listGeoEvents({
				q,
				regionId: regionID ?? undefined,
				minSeverity: Number.isFinite(minSeverityRaw) ? minSeverityRaw : undefined,
			});
		}

		const normalizedQuery = q?.trim().toLowerCase();
		if (Number.isFinite(minSeverityRaw) && minSeverityRaw > 0) {
			events = events.filter((event) => event.severity >= minSeverityRaw);
		}
		if (regionID) {
			events = events.filter((event) => event.regionIds.includes(regionID));
		}
		if (normalizedQuery) {
			events = events.filter(
				(event) =>
					event.title.toLowerCase().includes(normalizedQuery) ||
					event.summary?.toLowerCase().includes(normalizedQuery) ||
					event.category.toLowerCase().includes(normalizedQuery),
			);
		}

		return NextResponse.json({
			success: true,
			source,
			...buildGraph(events),
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "graph generation failed";
		return NextResponse.json({ success: false, error: message }, { status: 500 });
	}
}
