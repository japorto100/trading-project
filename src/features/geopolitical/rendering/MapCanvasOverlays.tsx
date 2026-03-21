import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMarkerSeverityColor } from "@/features/geopolitical/d3/scales";
import { getMarkerSymbolPath, MARKER_SYMBOL_LEGEND } from "@/features/geopolitical/markerSymbols";
import type { GeoMarkerPopupModel } from "@/features/geopolitical/markers/marker-view-model";
import type { GeoEarthChoroplethMode, GeoMapBody } from "@/features/geopolitical/store";

interface MapCanvasMarkerLegendOverlayProps {
	severityLevels: readonly [1, 2, 3, 4, 5];
}

export function MapCanvasMarkerLegendOverlay({
	severityLevels,
}: MapCanvasMarkerLegendOverlayProps) {
	return (
		<div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[21rem] rounded-lg border border-border/50 bg-card/80 p-2 text-[10px] text-foreground shadow-lg backdrop-blur">
			<div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
				Marker Legend
			</div>
			<div className="mb-2 flex flex-wrap gap-1">
				{severityLevels.map((severity) => (
					<span
						key={`map-severity-${severity}`}
						className="inline-flex items-center gap-1 rounded border border-border/80 px-1.5 py-0.5"
					>
						<span
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: getMarkerSeverityColor(severity) }}
						/>
						S{severity}
					</span>
				))}
			</div>
			<div className="grid grid-cols-2 gap-1.5">
				{MARKER_SYMBOL_LEGEND.slice(0, 8).map((entry) => (
					<div
						key={`map-legend-${entry.symbol}`}
						className="inline-flex items-center gap-1 rounded border border-border/60 bg-background/60 px-1 py-0.5"
						title={entry.label}
					>
						<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
							<path
								d={getMarkerSymbolPath(entry.symbol, 80)}
								transform="translate(12, 12)"
								fill="#e2e8f0"
								stroke="#0f172a"
								strokeWidth={0.8}
							/>
						</svg>
						<span className="truncate text-[9px] text-muted-foreground">{entry.label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

interface MapCanvasControlsOverlayProps {
	mapBody: GeoMapBody;
	earthChoroplethMode: GeoEarthChoroplethMode;
	onChangeEarthChoroplethMode?: (mode: GeoEarthChoroplethMode) => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
}

function getChoroplethCopy(mode: GeoEarthChoroplethMode): string {
	if (mode === "severity") {
		return "Country fill = event severity intensity (bright = higher).";
	}
	if (mode === "regime") {
		return "Country fill = regime state (calm/watch/escalating/critical).";
	}
	return "Country fill = macro overlay (policy-rate proxy, bright = higher).";
}

export function MapCanvasControlsOverlay({
	mapBody,
	earthChoroplethMode,
	onChangeEarthChoroplethMode,
	onZoomIn,
	onZoomOut,
	onReset,
}: MapCanvasControlsOverlayProps) {
	return (
		<div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
			<Button
				size="icon"
				variant="secondary"
				className="h-8 w-8 rounded-full border border-border/50 bg-card/80 shadow-lg backdrop-blur"
				onClick={onZoomIn}
				title="Zoom In"
			>
				<Plus className="h-4 w-4" />
			</Button>
			<Button
				size="icon"
				variant="secondary"
				className="h-8 w-8 rounded-full border border-border/50 bg-card/80 shadow-lg backdrop-blur"
				onClick={onZoomOut}
				title="Zoom Out"
			>
				<Minus className="h-4 w-4" />
			</Button>
			<Button
				size="icon"
				variant="secondary"
				className="h-8 w-8 rounded-full border border-border/50 bg-card/80 shadow-lg backdrop-blur"
				onClick={onReset}
				title="Reset View"
			>
				<RotateCcw className="h-4 w-4" />
			</Button>
			{mapBody === "earth" ? (
				<div className="mt-1 rounded-lg border border-border/50 bg-card/80 p-1 shadow-lg backdrop-blur">
					<div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
						Layer
					</div>
					<div className="flex flex-col gap-1">
						{(["severity", "regime", "macro"] as const).map((mode) => (
							<button
								key={mode}
								type="button"
								onClick={() => onChangeEarthChoroplethMode?.(mode)}
								className={
									earthChoroplethMode === mode
										? "rounded bg-success/20 px-2 py-1 text-left text-[10px] font-medium text-success"
										: "rounded bg-foreground/5 px-2 py-1 text-left text-[10px] font-medium text-muted-foreground hover:bg-foreground/10"
								}
								aria-pressed={earthChoroplethMode === mode}
								title={
									mode === "severity"
										? "Country choropleth by event severity intensity"
										: mode === "regime"
											? "Country choropleth by derived regime-state classification"
											: "Country choropleth by policy rate (macro overlay)"
								}
							>
								{mode === "severity" ? "Severity" : mode === "regime" ? "Regime" : "Macro"}
							</button>
						))}
					</div>
					<div className="mt-1 rounded border border-border/60 bg-background/60 px-2 py-1 text-[9px] text-muted-foreground">
						{getChoroplethCopy(earthChoroplethMode)}
					</div>
				</div>
			) : null}
		</div>
	);
}

interface MapCanvasStatsOverlayProps {
	visibleMarkersLabel: string;
	clusterLabel: string;
	avgSeverityLabel: string;
	maxCountryIntensityLabel: string;
	latestHourBucketLabel: string;
}

export function MapCanvasStatsOverlay({
	visibleMarkersLabel,
	clusterLabel,
	avgSeverityLabel,
	maxCountryIntensityLabel,
	latestHourBucketLabel,
}: MapCanvasStatsOverlayProps) {
	return (
		<div className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-lg border border-border/50 bg-card/75 p-2 text-[10px] text-foreground shadow-lg backdrop-blur">
			<div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
				Geo Stats
			</div>
			<div className="grid grid-cols-2 gap-x-3 gap-y-1">
				<span className="text-muted-foreground">Visible markers</span>
				<span className="text-right tabular-nums">{visibleMarkersLabel}</span>
				<span className="text-muted-foreground">Clusters</span>
				<span className="text-right tabular-nums">{clusterLabel}</span>
				<span className="text-muted-foreground">Avg severity</span>
				<span className="text-right tabular-nums">{avgSeverityLabel}</span>
				<span className="text-muted-foreground">Max intensity</span>
				<span className="text-right tabular-nums">{maxCountryIntensityLabel}</span>
				<span className="text-muted-foreground">Latest hour</span>
				<span className="text-right tabular-nums">{latestHourBucketLabel}</span>
			</div>
		</div>
	);
}

interface MapCanvasEventPopupOverlayProps {
	marker: GeoMarkerPopupModel;
	mapWidth: number;
	mapHeight: number;
	onClose: () => void;
	onFocusSidebar: (eventId: string) => void;
}

export function MapCanvasEventPopupOverlay({
	marker,
	mapWidth,
	mapHeight,
	onClose,
	onFocusSidebar,
}: MapCanvasEventPopupOverlayProps) {
	return (
		<div
			className="pointer-events-none absolute z-20"
			style={{
				left: `${(marker.x / mapWidth) * 100}%`,
				top: `${(marker.y / mapHeight) * 100}%`,
				transform: "translate(-50%, -110%)",
			}}
		>
			<div className="pointer-events-auto w-72 animate-in zoom-in fade-in rounded-lg border border-success/50 bg-card/95 p-4 shadow-chromatic backdrop-blur-md duration-200">
				<div className="mb-2 flex items-start justify-between">
					<h3 className="line-clamp-2 pr-4 text-sm font-bold text-foreground">{marker.title}</h3>
					<button
						type="button"
						className="text-muted-foreground transition-colors hover:text-foreground"
						onClick={(event) => {
							event.stopPropagation();
							onClose();
						}}
					>
						<Plus className="h-4 w-4 rotate-45" />
					</button>
				</div>

				<div className="mb-3 flex items-center gap-2">
					<div className="h-2 w-2 rounded-full" style={{ backgroundColor: marker.severityColor }} />
					<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						Severity {marker.severity} • {marker.categoryLabel}
					</span>
				</div>

				<div className="mb-3 max-h-40 space-y-3 overflow-y-auto pr-1 text-xs leading-relaxed text-muted-foreground scrollbar-hide">
					<p>{marker.summary}</p>

					{marker.sources.length > 0 ? (
						<div className="border-t border-border pt-2">
							<p className="mb-1 text-[9px] font-bold uppercase text-muted-foreground">Sources:</p>
							<ul className="space-y-1">
								{marker.sources.map((source) => (
									<li key={source.id}>
										<a
											href={source.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-1 truncate text-success hover:underline"
										>
											<Plus className="h-2 w-2" />
											{source.title || source.provider}
										</a>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>

				<div className="flex items-center justify-between border-t border-border pt-2">
					<span className="font-mono text-[10px] text-muted-foreground/60">
						{marker.updatedDateLabel}
					</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 p-0 text-[10px] text-success hover:text-success/80"
						onClick={() => onFocusSidebar(marker.id)}
					>
						Focus in Sidebar
					</Button>
				</div>
			</div>
			<div className="-mt-[1px] mx-auto h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-card/95" />
		</div>
	);
}
