"use client";

import type { GeoGraphResponse } from "@/features/geopolitical/shell/types";

interface GeoPulseInsightsPanelProps {
	graph: GeoGraphResponse | null;
}

export function GeoPulseInsightsPanel({ graph }: GeoPulseInsightsPanelProps) {
	if (!graph || !graph.success) {
		return (
			<section className="rounded-md border border-border bg-card p-3">
				<h2 className="text-sm font-semibold">GeoPulse Insights</h2>
				<p className="mt-1 text-xs text-muted-foreground">No graph data yet.</p>
			</section>
		);
	}

	const topEdges = graph.edges.slice(0, 6);

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">GeoPulse Insights</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				Graph slice from backend: {graph.nodeCount} nodes, {graph.edgeCount} edges.
			</p>

			<div className="mt-3 rounded-md border border-border bg-background p-2">
				<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Top Regions
				</h3>
				<div className="mt-2 flex flex-wrap gap-1">
					{graph.topRegions.length === 0 ? (
						<span className="text-xs text-muted-foreground">No regions in graph.</span>
					) : (
						graph.topRegions.slice(0, 8).map((region) => (
							<span key={region} className="rounded border border-border px-2 py-0.5 text-[11px]">
								{region}
							</span>
						))
					)}
				</div>
			</div>

			<div className="mt-3 rounded-md border border-border bg-background p-2">
				<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Top Sub-Events
				</h3>
				<div className="mt-2 flex flex-wrap gap-1">
					{graph.topSubEventTypes.length === 0 ? (
						<span className="text-xs text-muted-foreground">No sub-event clusters.</span>
					) : (
						graph.topSubEventTypes.slice(0, 8).map((entry) => (
							<span key={entry} className="rounded border border-border px-2 py-0.5 text-[11px]">
								{entry}
							</span>
						))
					)}
				</div>
			</div>

			<div className="mt-3 rounded-md border border-border bg-background p-2">
				<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Strongest Links
				</h3>
				<div className="mt-2 space-y-1 text-xs">
					{topEdges.length === 0 ? (
						<p className="text-muted-foreground">No relation edges yet.</p>
					) : (
						topEdges.map((edge) => (
							<p key={edge.id}>
								{edge.type} | w={edge.weight}
							</p>
						))
					)}
				</div>
			</div>
		</section>
	);
}
