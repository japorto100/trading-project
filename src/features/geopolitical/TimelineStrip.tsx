"use client";

import { extent, max, rollup } from "d3-array";
import { axisBottom } from "d3-axis";
import { brushX, type D3BrushEvent } from "d3-brush";
import { format } from "d3-format";
import { type HierarchyRectangularNode, hierarchy, treemap } from "d3-hierarchy";
import { scaleLinear, scaleOrdinal, scaleTime } from "d3-scale";
import { select } from "d3-selection";
import { area, curveMonotoneX, line } from "d3-shape";
import { annotation, annotationLabel } from "d3-svg-annotation";
import { legendColor } from "d3-svg-legend";
import { timeHour } from "d3-time";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GeoTimelineEntry } from "@/lib/geopolitical/types";

interface TimelineStripProps {
	timeline: GeoTimelineEntry[];
}

function formatTime(iso: string): string {
	const timestamp = new Date(iso);
	if (!Number.isFinite(timestamp.getTime())) return iso;
	return timestamp.toLocaleString();
}

const formatCount = format(",d");

interface TimelineChartPoint {
	at: Date;
	count: number;
}

interface TimelineActionCell {
	action: string;
	actionGroup: TimelineActionGroup;
	count: number;
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

type TimelineActionGroup = "contradictions" | "candidates" | "event_edits" | "events" | "other";

interface TimelineLegendItem {
	key: TimelineActionGroup;
	label: string;
	color: string;
}

const TIMELINE_ACTION_LEGEND: TimelineLegendItem[] = [
	{ key: "events", label: "Event lifecycle", color: "#60a5fa" },
	{ key: "event_edits", label: "Event edits", color: "#a78bfa" },
	{ key: "candidates", label: "Candidate workflow", color: "#f59e0b" },
	{ key: "contradictions", label: "Contradictions", color: "#ef4444" },
	{ key: "other", label: "Other", color: "#94a3b8" },
];

const PLAYBACK_SPEED_OPTIONS = [
	{ label: "0.5x", multiplier: 0.5 },
	{ label: "1x", multiplier: 1 },
	{ label: "4x", multiplier: 4 },
	{ label: "12x", multiplier: 12 },
] as const;

const PLAYBACK_WINDOW_OPTIONS = [
	{ label: "6h", hours: 6 },
	{ label: "24h", hours: 24 },
	{ label: "72h", hours: 72 },
	{ label: "7d", hours: 24 * 7 },
] as const;

function clamp(value: number, minValue: number, maxValue: number): number {
	return Math.min(maxValue, Math.max(minValue, value));
}

function getDecayPreviewScore(
	atIso: string,
	cursorMs: number,
	halfLifeHours: number,
): number | null {
	const atMs = new Date(atIso).getTime();
	if (!Number.isFinite(atMs) || !Number.isFinite(cursorMs) || halfLifeHours <= 0) return null;
	const deltaHours = Math.max(0, (cursorMs - atMs) / 3_600_000);
	const score = 0.5 ** (deltaHours / halfLifeHours);
	return Number.isFinite(score) ? score : null;
}

function getTimelineActionGroup(action: GeoTimelineEntry["action"] | string): TimelineActionGroup {
	if (action.startsWith("contradiction_")) return "contradictions";
	if (action.startsWith("candidate_")) return "candidates";
	if (
		[
			"status_changed",
			"severity_changed",
			"confidence_changed",
			"geometry_changed",
			"sources_updated",
			"assets_updated",
			"note_updated",
		].includes(action)
	) {
		return "event_edits";
	}
	if (["created", "archived"].includes(action)) return "events";
	return "other";
}

function buildTimelineChartPoints(timeline: GeoTimelineEntry[]): TimelineChartPoint[] {
	const parsedDates = timeline
		.map((entry) => new Date(entry.at))
		.filter((value) => Number.isFinite(value.getTime()));

	const buckets = rollup(
		parsedDates,
		(values) => values.length,
		(value) => timeHour.floor(value).getTime(),
	);

	return [...buckets.entries()]
		.map(([ms, count]) => ({ at: new Date(ms), count }))
		.sort((a, b) => a.at.getTime() - b.at.getTime());
}

function buildActionDistributionCells(timeline: GeoTimelineEntry[]): TimelineActionCell[] {
	if (timeline.length === 0) return [];
	const actionCounts = [
		...rollup(
			timeline,
			(items) => items.length,
			(entry) => entry.action,
		).entries(),
	]
		.map(([action, count]) => ({ name: action, value: count }))
		.sort((a, b) => b.value - a.value);
	const root = hierarchy<{ name: string; children: Array<{ name: string; value: number }> }>({
		name: "timeline",
		children: actionCounts,
	})
		.sum((node) => ("value" in node ? Number(node.value ?? 0) : 0))
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	const layoutRoot: HierarchyRectangularNode<{
		name: string;
		children: Array<{ name: string; value: number }>;
	}> = treemap<{ name: string; children: Array<{ name: string; value: number }> }>()
		.size([320, 68])
		.paddingInner(3)
		.paddingTop(2)(root);

	return layoutRoot.leaves().map((leaf) => ({
		action: String(leaf.data.name ?? "unknown"),
		actionGroup: getTimelineActionGroup(String(leaf.data.name ?? "unknown")),
		count: Math.max(0, Math.round(leaf.value ?? 0)),
		x0: leaf.x0,
		y0: leaf.y0,
		x1: leaf.x1,
		y1: leaf.y1,
	}));
}

export function TimelineStrip({ timeline }: TimelineStripProps) {
	const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
	const [brushRangeMs, setBrushRangeMs] = useState<[number, number] | null>(null);
	const [playbackEnabled, setPlaybackEnabled] = useState(false);
	const [playbackRunning, setPlaybackRunning] = useState(false);
	const [playbackSpeedMultiplier, setPlaybackSpeedMultiplier] = useState<number>(1);
	const [playbackWindowHours, setPlaybackWindowHours] = useState<number>(24);
	const [playbackCursorMs, setPlaybackCursorMs] = useState<number | null>(null);
	const [decayPreviewEnabled, setDecayPreviewEnabled] = useState(false);
	const [decayHalfLifeHours, setDecayHalfLifeHours] = useState<number>(24);
	const xAxisRef = useRef<SVGGElement | null>(null);
	const brushRef = useRef<SVGGElement | null>(null);
	const annotationRef = useRef<SVGGElement | null>(null);
	const treemapLegendRef = useRef<SVGGElement | null>(null);
	const chartModel = useMemo(() => {
		const points = buildTimelineChartPoints(timeline);
		if (points.length === 0) {
			return null;
		}

		const chartWidth = 420;
		const chartHeight = 96;
		const paddingX = 8;
		const paddingTop = 8;
		const paddingBottom = 18;
		const innerWidth = chartWidth - paddingX * 2;
		const innerHeight = chartHeight - paddingTop - paddingBottom;
		const domain = extent(points, (point) => point.at) as [Date, Date];
		const maxCount = max(points, (point) => point.count) ?? 1;
		const x = scaleTime()
			.domain(
				domain[0].getTime() === domain[1].getTime()
					? [
							new Date(domain[0].getTime() - 30 * 60_000),
							new Date(domain[1].getTime() + 30 * 60_000),
						]
					: domain,
			)
			.range([paddingX, paddingX + innerWidth]);
		const y = scaleLinear()
			.domain([0, maxCount])
			.nice()
			.range([paddingTop + innerHeight, paddingTop]);
		const linePath =
			line<TimelineChartPoint>()
				.x((point) => x(point.at))
				.y((point) => y(point.count))
				.curve(curveMonotoneX)(points) ?? "";
		const areaPath =
			area<TimelineChartPoint>()
				.x((point) => x(point.at))
				.y0(y(0))
				.y1((point) => y(point.count))
				.curve(curveMonotoneX)(points) ?? "";

		const tickCount = Math.min(4, Math.max(2, points.length));
		const xTicks = x.ticks(tickCount).map((tick) => ({
			at: tick,
			x: x(tick),
			label: tick.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		}));
		const yTicks = y.ticks(Math.min(3, maxCount)).map((tick) => ({
			value: tick,
			y: y(tick),
			label: formatCount(tick),
		}));
		const plotTop = paddingTop;
		const plotBottom = chartHeight - paddingBottom;

		return {
			chartWidth,
			chartHeight,
			paddingX,
			paddingTop,
			paddingBottom,
			linePath,
			areaPath,
			xTicks,
			yTicks,
			maxCount,
			bucketCount: points.length,
			points,
			xScale: x,
			yScale: y,
			plotTop,
			plotBottom,
		};
	}, [timeline]);
	const timelineDomainMs = useMemo<[number, number] | null>(() => {
		if (!chartModel) return null;
		const first = chartModel.points[0]?.at.getTime();
		const lastPoint = chartModel.points[chartModel.points.length - 1];
		const last = lastPoint?.at.getTime();
		if (!Number.isFinite(first) || !Number.isFinite(last)) return null;
		return [first, last];
	}, [chartModel]);
	useEffect(() => {
		if (!timelineDomainMs) {
			setPlaybackCursorMs(null);
			setPlaybackRunning(false);
			return;
		}
		setPlaybackCursorMs((previous) => {
			if (previous === null) return timelineDomainMs[1];
			return clamp(previous, timelineDomainMs[0], timelineDomainMs[1]);
		});
	}, [timelineDomainMs]);
	useEffect(() => {
		if (!playbackEnabled || !playbackRunning || !timelineDomainMs) return;
		const intervalMs = 400;
		const baseStepMs = 15 * 60_000;
		const timer = window.setInterval(() => {
			setPlaybackCursorMs((previous) => {
				const current = previous ?? timelineDomainMs[0];
				const next = current + baseStepMs * playbackSpeedMultiplier;
				if (next >= timelineDomainMs[1]) {
					window.setTimeout(() => setPlaybackRunning(false), 0);
					return timelineDomainMs[1];
				}
				return next;
			});
		}, intervalMs);
		return () => window.clearInterval(timer);
	}, [playbackEnabled, playbackRunning, playbackSpeedMultiplier, timelineDomainMs]);
	const actionDistributionCells = useMemo(() => buildActionDistributionCells(timeline), [timeline]);
	const playbackTimeline = useMemo(() => {
		if (!playbackEnabled || playbackCursorMs === null) return timeline;
		const windowStartMs = playbackCursorMs - playbackWindowHours * 3_600_000;
		return timeline.filter((entry) => {
			const atMs = new Date(entry.at).getTime();
			return Number.isFinite(atMs) && atMs <= playbackCursorMs && atMs >= windowStartMs;
		});
	}, [playbackCursorMs, playbackEnabled, playbackWindowHours, timeline]);
	const visibleTimeline = useMemo(() => {
		if (!brushRangeMs) return playbackTimeline;
		const [startMs, endMs] = brushRangeMs;
		return playbackTimeline.filter((entry) => {
			const atMs = new Date(entry.at).getTime();
			return Number.isFinite(atMs) && atMs >= startMs && atMs <= endMs;
		});
	}, [brushRangeMs, playbackTimeline]);
	const actionGroupColorScale = useMemo(
		() =>
			scaleOrdinal<TimelineActionGroup, string>()
				.domain(TIMELINE_ACTION_LEGEND.map((item) => item.key))
				.range(TIMELINE_ACTION_LEGEND.map((item) => item.color)),
		[],
	);
	const densityAnnotation = useMemo(() => {
		if (!chartModel) return null;
		const candidatePoints = brushRangeMs
			? chartModel.points.filter((point) => {
					const ms = point.at.getTime();
					return ms >= brushRangeMs[0] && ms <= brushRangeMs[1];
				})
			: chartModel.points;
		if (candidatePoints.length === 0) return null;
		const peak = candidatePoints.reduce(
			(best, point) => (point.count > best.count ? point : best),
			candidatePoints[0],
		);
		return {
			x: chartModel.xScale(peak.at),
			y: chartModel.yScale(peak.count),
			label: `Peak ${formatCount(peak.count)}`,
			title: peak.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		};
	}, [brushRangeMs, chartModel]);
	const selectedEntry = useMemo(() => {
		const preferred =
			visibleTimeline.find((entry) => entry.id === selectedTimelineId) ??
			playbackTimeline.find((entry) => entry.id === selectedTimelineId) ??
			timeline.find((entry) => entry.id === selectedTimelineId);
		return preferred ?? visibleTimeline[0] ?? playbackTimeline[0] ?? timeline[0] ?? null;
	}, [playbackTimeline, selectedTimelineId, timeline, visibleTimeline]);
	const selectedRangeLabel = useMemo(() => {
		if (!brushRangeMs) return "All entries";
		const [startMs, endMs] = brushRangeMs;
		return `${new Date(startMs).toLocaleString()} → ${new Date(endMs).toLocaleString()}`;
	}, [brushRangeMs]);
	const playbackCursorLabel = useMemo(() => {
		if (playbackCursorMs === null) return "Live";
		return new Date(playbackCursorMs).toLocaleString();
	}, [playbackCursorMs]);
	const selectedEntryDecayScore = useMemo(() => {
		if (!decayPreviewEnabled || playbackCursorMs === null || !selectedEntry) return null;
		return getDecayPreviewScore(selectedEntry.at, playbackCursorMs, decayHalfLifeHours);
	}, [decayHalfLifeHours, decayPreviewEnabled, playbackCursorMs, selectedEntry]);

	useEffect(() => {
		if (!chartModel || !xAxisRef.current) return;
		const axis = axisBottom(chartModel.xScale)
			.ticks(Math.min(4, Math.max(2, chartModel.bucketCount)))
			.tickSizeOuter(0);
		select(xAxisRef.current).call(axis);
	}, [chartModel]);

	useEffect(() => {
		if (!chartModel || !annotationRef.current || !densityAnnotation) {
			if (annotationRef.current) select(annotationRef.current).selectAll("*").remove();
			return;
		}
		const makeAnnotation = annotation()
			.type(annotationLabel)
			.annotations([
				{
					note: {
						label: densityAnnotation.label,
						title: densityAnnotation.title,
					},
					x: densityAnnotation.x,
					y: densityAnnotation.y,
					dx: 18,
					dy: -18,
				},
			]);
		const layer = select(annotationRef.current);
		layer.selectAll("*").remove();
		layer.call(makeAnnotation as never);
		layer.selectAll("path").attr("stroke", "currentColor").attr("stroke-opacity", 0.35);
		layer
			.selectAll("text")
			.attr("fill", "currentColor")
			.attr("font-size", 10)
			.attr("opacity", 0.85);
		layer
			.selectAll("rect")
			.attr("fill", "currentColor")
			.attr("fill-opacity", 0.04)
			.attr("stroke-opacity", 0.18);
	}, [chartModel, densityAnnotation]);

	useEffect(() => {
		if (!treemapLegendRef.current) return;
		const legend = legendColor<string>()
			.shapeWidth(10)
			.shapeHeight(10)
			.shapePadding(8)
			.labelOffset(6)
			.orient("horizontal")
			.scale(actionGroupColorScale)
			.labels(TIMELINE_ACTION_LEGEND.map((item) => item.label));
		const layer = select(treemapLegendRef.current);
		layer.selectAll("*").remove();
		layer.call(legend as never);
		layer.selectAll("text").attr("fill", "currentColor").attr("font-size", 10).attr("opacity", 0.8);
		layer.selectAll("path.domain").attr("stroke-opacity", 0);
	}, [actionGroupColorScale]);

	useEffect(() => {
		if (!chartModel || !brushRef.current) return;
		const brush = brushX()
			.extent([
				[chartModel.paddingX, chartModel.plotTop],
				[chartModel.chartWidth - chartModel.paddingX, chartModel.plotBottom],
			])
			.on("end", (event: D3BrushEvent<unknown>) => {
				if (!event.selection) {
					setBrushRangeMs(null);
					return;
				}
				const [x0, x1] = event.selection as [number, number];
				const start = chartModel.xScale.invert(x0).getTime();
				const end = chartModel.xScale.invert(x1).getTime();
				setBrushRangeMs([Math.min(start, end), Math.max(start, end)]);
			});
		const selection = select(brushRef.current);
		selection.call(brush);
		selection.selectAll(".overlay,.selection").attr("cursor", "crosshair");
		selection.selectAll(".selection").attr("fill-opacity", 0.12);
	}, [chartModel]);

	return (
		<section data-testid="timeline-strip" className="border-t border-border bg-card/40 px-3 py-2">
			<div className="mb-2 flex items-center justify-between">
				<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Timeline
				</h2>
				<span className="text-[11px] text-muted-foreground">
					{visibleTimeline.length}
					{brushRangeMs ? ` / ${timeline.length}` : ""} entries
				</span>
			</div>
			<div className="mb-2 rounded-md border border-border bg-background px-2 py-2">
				<div className="flex flex-wrap items-center gap-2 text-[11px]">
					<button
						type="button"
						className={`rounded border px-2 py-1 ${playbackEnabled ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`}
						onClick={() => {
							setPlaybackEnabled((value) => {
								const next = !value;
								if (!next) setPlaybackRunning(false);
								return next;
							});
						}}
					>
						Playback {playbackEnabled ? "On" : "Off"}
					</button>
					<button
						type="button"
						className="rounded border border-border px-2 py-1 hover:bg-muted/50 disabled:opacity-50"
						onClick={() => setPlaybackRunning((value) => !value)}
						disabled={!playbackEnabled || !timelineDomainMs}
					>
						{playbackRunning ? "Pause" : "Play"}
					</button>
					<button
						type="button"
						className="rounded border border-border px-2 py-1 hover:bg-muted/50 disabled:opacity-50"
						onClick={() => {
							if (!timelineDomainMs) return;
							setPlaybackCursorMs(timelineDomainMs[0]);
							setPlaybackRunning(false);
						}}
						disabled={!playbackEnabled || !timelineDomainMs}
					>
						Reset
					</button>
					<button
						type="button"
						className="rounded border border-border px-2 py-1 hover:bg-muted/50 disabled:opacity-50"
						onClick={() => {
							if (!timelineDomainMs) return;
							setPlaybackCursorMs(timelineDomainMs[1]);
							setPlaybackRunning(false);
						}}
						disabled={!playbackEnabled || !timelineDomainMs}
					>
						Live
					</button>
					<label className="flex items-center gap-1 text-muted-foreground">
						<span>Speed</span>
						<select
							className="rounded border border-border bg-background px-1 py-1 text-[11px]"
							value={String(playbackSpeedMultiplier)}
							onChange={(event) => setPlaybackSpeedMultiplier(Number(event.target.value) || 1)}
							disabled={!playbackEnabled}
						>
							{PLAYBACK_SPEED_OPTIONS.map((option) => (
								<option key={option.label} value={option.multiplier}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label className="flex items-center gap-1 text-muted-foreground">
						<span>Window</span>
						<select
							className="rounded border border-border bg-background px-1 py-1 text-[11px]"
							value={String(playbackWindowHours)}
							onChange={(event) => setPlaybackWindowHours(Number(event.target.value) || 24)}
							disabled={!playbackEnabled}
						>
							{PLAYBACK_WINDOW_OPTIONS.map((option) => (
								<option key={option.label} value={option.hours}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label className="ml-auto flex items-center gap-1 text-muted-foreground">
						<input
							type="checkbox"
							checked={decayPreviewEnabled}
							onChange={(event) => setDecayPreviewEnabled(event.target.checked)}
						/>
						<span>Decay preview</span>
					</label>
					{decayPreviewEnabled ? (
						<label className="flex items-center gap-1 text-muted-foreground">
							<span>Half-life</span>
							<select
								className="rounded border border-border bg-background px-1 py-1 text-[11px]"
								value={String(decayHalfLifeHours)}
								onChange={(event) => setDecayHalfLifeHours(Number(event.target.value) || 24)}
							>
								<option value="6">6h</option>
								<option value="24">24h</option>
								<option value="72">72h</option>
								<option value="168">7d</option>
							</select>
						</label>
					) : null}
				</div>
				{playbackEnabled && timelineDomainMs && playbackCursorMs !== null ? (
					<div className="mt-2 space-y-1">
						<div className="flex items-center justify-between text-[11px] text-muted-foreground">
							<span>Cursor: {playbackCursorLabel}</span>
							<span>
								Window: last {playbackWindowHours}h · {playbackRunning ? "running" : "paused"}
							</span>
						</div>
						<input
							type="range"
							min={timelineDomainMs[0]}
							max={timelineDomainMs[1]}
							step={15 * 60_000}
							value={clamp(playbackCursorMs, timelineDomainMs[0], timelineDomainMs[1])}
							onChange={(event) => {
								setPlaybackRunning(false);
								setPlaybackCursorMs(Number(event.target.value));
							}}
							className="w-full"
						/>
					</div>
				) : null}
			</div>
			<div className="grid gap-2 md:grid-cols-[1fr_320px]">
				<div className="space-y-2">
					{chartModel ? (
						<div className="rounded-md border border-border bg-background px-2 py-2">
							<div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
								<span>Activity density (hour buckets)</span>
								<span>
									{chartModel.bucketCount} buckets, peak {formatCount(chartModel.maxCount)}
								</span>
							</div>
							<div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
								<span className="truncate">{selectedRangeLabel}</span>
								{brushRangeMs ? (
									<button
										type="button"
										className="rounded border border-border px-2 py-0.5 text-[10px] hover:bg-muted/50"
										onClick={() => setBrushRangeMs(null)}
									>
										Clear range
									</button>
								) : null}
							</div>
							<svg
								viewBox={`0 0 ${chartModel.chartWidth} ${chartModel.chartHeight}`}
								className="h-24 w-full"
								role="img"
								aria-label="Timeline activity density chart"
							>
								{chartModel.yTicks.map((tick) => (
									<g key={`y-${tick.value}`}>
										<line
											x1={chartModel.paddingX}
											x2={chartModel.chartWidth - chartModel.paddingX}
											y1={tick.y}
											y2={tick.y}
											stroke="currentColor"
											strokeOpacity={0.1}
										/>
										<text
											x={chartModel.chartWidth - 2}
											y={tick.y - 2}
											textAnchor="end"
											fontSize="10"
											fill="currentColor"
											opacity={0.65}
										>
											{tick.label}
										</text>
									</g>
								))}
								<path d={chartModel.areaPath} fill="currentColor" opacity={0.08} />
								<path
									d={chartModel.linePath}
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									opacity={0.8}
								/>
								{chartModel.xTicks.map((tick) => (
									<g key={`x-${tick.at.toISOString()}`}>
										<line
											x1={tick.x}
											x2={tick.x}
											y1={chartModel.paddingTop}
											y2={chartModel.chartHeight - chartModel.paddingBottom}
											stroke="currentColor"
											strokeOpacity={0.08}
										/>
									</g>
								))}
								{playbackEnabled && playbackCursorMs !== null ? (
									<>
										<rect
											x={Math.max(
												chartModel.paddingX,
												chartModel.xScale(
													new Date(playbackCursorMs - playbackWindowHours * 3_600_000),
												),
											)}
											y={chartModel.plotTop}
											width={Math.max(
												0,
												Math.min(
													chartModel.chartWidth - chartModel.paddingX,
													chartModel.xScale(new Date(playbackCursorMs)),
												) -
													Math.max(
														chartModel.paddingX,
														chartModel.xScale(
															new Date(playbackCursorMs - playbackWindowHours * 3_600_000),
														),
													),
											)}
											height={chartModel.plotBottom - chartModel.plotTop}
											fill="currentColor"
											opacity={0.05}
										/>
										<line
											x1={chartModel.xScale(new Date(playbackCursorMs))}
											x2={chartModel.xScale(new Date(playbackCursorMs))}
											y1={chartModel.plotTop}
											y2={chartModel.plotBottom}
											stroke="currentColor"
											strokeDasharray="3 2"
											strokeOpacity={0.55}
										/>
									</>
								) : null}
								<g
									ref={xAxisRef}
									transform={`translate(0, ${chartModel.chartHeight - chartModel.paddingBottom})`}
								/>
								<g ref={annotationRef} />
								<g ref={brushRef} />
							</svg>
						</div>
					) : null}
					{actionDistributionCells.length > 0 ? (
						<div className="rounded-md border border-border bg-background px-2 py-2">
							<div className="mb-1 text-[11px] text-muted-foreground">
								Action distribution (hierarchy treemap)
							</div>
							<svg
								viewBox="0 0 320 68"
								className="h-20 w-full"
								role="img"
								aria-label="Timeline action distribution treemap"
							>
								{actionDistributionCells.map((cell) => {
									const width = Math.max(0, cell.x1 - cell.x0);
									const height = Math.max(0, cell.y1 - cell.y0);
									return (
										<g key={cell.action} transform={`translate(${cell.x0}, ${cell.y0})`}>
											<rect
												width={width}
												height={height}
												rx={4}
												fill={actionGroupColorScale(cell.actionGroup)}
												fillOpacity={0.14}
												stroke={actionGroupColorScale(cell.actionGroup)}
												strokeOpacity={0.28}
											/>
											{width > 56 && height > 18 ? (
												<>
													<text x={6} y={14} fontSize="10" fill="currentColor" opacity={0.8}>
														{cell.action}
													</text>
													<text
														x={6}
														y={height - 4}
														fontSize="10"
														fill="currentColor"
														opacity={0.65}
													>
														{formatCount(cell.count)}
													</text>
												</>
											) : null}
										</g>
									);
								})}
							</svg>
							<svg
								viewBox="0 0 320 22"
								className="mt-1 h-6 w-full"
								role="img"
								aria-label="Treemap legend"
							>
								<g ref={treemapLegendRef} transform="translate(2, 14)" />
							</svg>
						</div>
					) : null}
					<div className="flex gap-2 overflow-x-auto pb-1">
						{visibleTimeline.length === 0 ? (
							<div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
								{timeline.length === 0
									? "No timeline entries yet."
									: "No entries in selected range."}
							</div>
						) : (
							visibleTimeline.map((entry) => (
								<button
									key={entry.id}
									type="button"
									className={`min-w-[260px] rounded-md border bg-background px-3 py-2 text-xs ${
										selectedEntry?.id === entry.id ? "border-primary" : "border-border"
									}`}
									onClick={() => setSelectedTimelineId(entry.id)}
									aria-pressed={selectedEntry?.id === entry.id}
									aria-label={`Timeline entry ${entry.action} at ${formatTime(entry.at)}`}
								>
									<div className="flex items-center justify-between gap-2">
										<span className="font-medium">{entry.action}</span>
										<span className="text-[11px] text-muted-foreground">
											{formatTime(entry.at)}
										</span>
									</div>
									<p className="mt-1 text-muted-foreground">{entry.diffSummary}</p>
									<p className="mt-1 text-[11px] text-muted-foreground">actor: {entry.actor}</p>
								</button>
							))
						)}
					</div>
				</div>

				<aside className="rounded-md border border-border bg-background px-3 py-2 text-xs">
					{selectedEntry ? (
						<>
							<p className="font-medium">{selectedEntry.action}</p>
							<p className="mt-1 text-muted-foreground">{selectedEntry.diffSummary}</p>
							<p className="mt-2 text-[11px] text-muted-foreground">
								eventId: {selectedEntry.eventId}
							</p>
							<p className="text-[11px] text-muted-foreground">actor: {selectedEntry.actor}</p>
							<p className="text-[11px] text-muted-foreground">
								at: {formatTime(selectedEntry.at)}
							</p>
							{decayPreviewEnabled && selectedEntryDecayScore !== null ? (
								<p className="text-[11px] text-muted-foreground">
									decay preview: {(selectedEntryDecayScore * 100).toFixed(1)}%
								</p>
							) : null}
						</>
					) : (
						<p className="text-muted-foreground">Select a timeline item.</p>
					)}
				</aside>
			</div>
		</section>
	);
}
