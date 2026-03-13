"use client";

import { drag } from "d3-drag";
import { easeCubicOut } from "d3-ease";
import { geoPath } from "d3-geo";
import { select } from "d3-selection";
import { timer } from "d3-timer";
import { zoom, zoomIdentity } from "d3-zoom";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { type MouseEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getGeoMapBodyVisualConfig } from "@/features/geopolitical/bodies";
import { buildGeoMapStatsSummary } from "@/features/geopolitical/d3/geoMapStats";
import {
	createCountryStyleResolver,
	getMarkerSeverityColor,
	getSoftSignalVisualStyle,
} from "@/features/geopolitical/d3/scales";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view-handoff";
import { useMacroOverlayData } from "@/features/geopolitical/hooks/useMacroOverlayData";
import { getMarkerSymbolPath, MARKER_SYMBOL_LEGEND } from "@/features/geopolitical/markerSymbols";
import { useGeoMapCanvasBasemapStage } from "@/features/geopolitical/rendering/useGeoMapCanvasBasemapStage";
import { useGeoMapCanvasBodyPointLayersStage } from "@/features/geopolitical/rendering/useGeoMapCanvasBodyPointLayersStage";
import { useGeoMapCanvasCountryStage } from "@/features/geopolitical/rendering/useGeoMapCanvasCountryStage";
import { useGeoMapMarkerClusters } from "@/features/geopolitical/rendering/useGeoMapMarkerClusters";
import { useGeoMapMarkerVoronoi } from "@/features/geopolitical/rendering/useGeoMapMarkerVoronoi";
import {
	GEO_MAP_INITIAL_SCALE as INITIAL_SCALE,
	GEO_MAP_HEIGHT as MAP_HEIGHT,
	GEO_MAP_WIDTH as MAP_WIDTH,
	useGeoMapProjectionModel,
} from "@/features/geopolitical/rendering/useGeoMapProjectionModel";
import type { GeoEarthChoroplethMode, GeoMapBody } from "@/features/geopolitical/store";
import { buildGeoViewportFocusTarget } from "@/features/geopolitical/viewport-focus";
import type { GeoCandidate, GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

interface MapCanvasProps {
	mapBody?: GeoMapBody;
	viewportResetNonce?: number;
	events: GeoEvent[];
	candidates: GeoCandidate[];
	drawings: GeoDrawing[];
	showRegionLayer: boolean;
	showHeatmap?: boolean;
	showSoftSignals?: boolean;
	bodyPointLayerVisibility?: Partial<Record<string, boolean>>;
	earthChoroplethMode?: GeoEarthChoroplethMode;
	onChangeEarthChoroplethMode?: (mode: GeoEarthChoroplethMode) => void;
	selectedEventId: string | null;
	selectedDrawingId: string | null;
	onSelectEvent: (eventId: string) => void;
	onSelectDrawing: (drawingId: string) => void;
	onMapClick: (coords: { lat: number; lng: number }) => void;
	onCountryClick?: (countryId: string) => void;
	onOpenFlatViewForCluster?: (bounds: GeoFlatViewBounds) => void;
	drawingMode?: string | null;
	pendingLineStart?: { lat: number; lng: number } | null;
	pendingPolygonPoints?: Array<{ lat: number; lng: number }>;
	drawingColor?: string;
}

export const MapCanvas = memo(function MapCanvas({
	mapBody = "earth",
	viewportResetNonce = 0,
	events,
	candidates,
	drawings,
	showRegionLayer,
	showHeatmap = true,
	showSoftSignals = true,
	bodyPointLayerVisibility,
	earthChoroplethMode = "severity",
	onChangeEarthChoroplethMode,
	selectedEventId,
	selectedDrawingId,
	onSelectEvent,
	onSelectDrawing,
	onMapClick,
	onCountryClick,
	onOpenFlatViewForCluster,
	drawingMode = null,
	pendingLineStart = null,
	pendingPolygonPoints = [],
	drawingColor = "#22d3ee",
}: MapCanvasProps) {
	const basemapCanvasRef = useRef<HTMLCanvasElement>(null);
	const countryCanvasRef = useRef<HTMLCanvasElement>(null);
	const bodyPointLayersCanvasRef = useRef<HTMLCanvasElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const viewportAnimationTimerRef = useRef<{ stop: () => void } | null>(null);
	const projectionRef = useRef<ReturnType<typeof useGeoMapProjectionModel>["projection"] | null>(
		null,
	);
	const lastSelectionFocusIdRef = useRef<string | null>(null);
	const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
	const [scale, setScale] = useState(INITIAL_SCALE);
	const [, setK] = useState(1);
	const [popupEventId, setPopupEventId] = useState<string | null>(null);
	const [hoverEventId, setHoverEventId] = useState<string | null>(null);
	const [isAutoRotating, setIsAutoRotating] = useState(true);
	const [previewPoint, setPreviewPoint] = useState<{ lat: number; lng: number } | null>(null);
	const bodyVisualConfig = useMemo(() => getGeoMapBodyVisualConfig(mapBody), [mapBody]);
	const maxCountryIntensity = useMemo(() => {
		const intensityMap = new Map<string, number>();
		for (const event of events) {
			for (const code of event.countryCodes) {
				intensityMap.set(code, (intensityMap.get(code) ?? 0) + Number(event.severity));
			}
		}
		return Math.max(0, ...intensityMap.values());
	}, [events]);
	const { data: macroOverlayData } = useMacroOverlayData(earthChoroplethMode === "macro");
	const maxMacroValue = useMemo(() => {
		if (!macroOverlayData) return 25;
		const values = Object.values(macroOverlayData).map((e) => e.value);
		return Math.max(25, ...values);
	}, [macroOverlayData]);
	const resolveCountryStyle = useMemo(
		() => createCountryStyleResolver(maxCountryIntensity, maxMacroValue),
		[maxCountryIntensity, maxMacroValue],
	);

	const mapModel = useGeoMapProjectionModel({
		mapBody,
		events,
		candidates,
		drawings,
		bodyPointLayerVisibility,
		macroOverlayData: macroOverlayData ?? undefined,
		rotation,
		scale,
	});
	const markerClusters = useGeoMapMarkerClusters({
		markers: mapModel.markers,
		scale,
		projection: mapModel.projection,
	});
	const geoMapStats = useMemo(
		() =>
			buildGeoMapStatsSummary({
				events,
				markers: mapModel.markers,
				clusters: markerClusters.clusters,
				countries: mapModel.countries,
			}),
		[events, mapModel.countries, mapModel.markers, markerClusters.clusters],
	);
	const markerVoronoi = useGeoMapMarkerVoronoi({
		markers: mapModel.markers,
		projection: mapModel.projection,
	});
	const isDrawingInteractionActive =
		drawingMode === "line" || drawingMode === "polygon" || drawingMode === "text";
	const drawingModeRef = useRef<string | null>(drawingMode);
	drawingModeRef.current = drawingMode;

	projectionRef.current = mapModel.projection;

	// Auto-rotation effect
	useEffect(() => {
		if (!isAutoRotating) return;

		let lastElapsed = 0;
		const rotationTimer = timer((elapsed) => {
			const deltaMs = elapsed - lastElapsed;
			lastElapsed = elapsed;
			const ramp = easeCubicOut(Math.min(1, elapsed / 900));
			setRotation(([r1, r2, r3]) => [r1 + deltaMs * 0.002 * ramp, r2, r3]);
		});

		return () => rotationTimer.stop();
	}, [isAutoRotating]);

	useEffect(() => {
		return () => {
			viewportAnimationTimerRef.current?.stop();
			viewportAnimationTimerRef.current = null;
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: drawingMode is the re-attach trigger; internals read drawingModeRef to avoid stale closures
	useEffect(() => {
		if (!svgRef.current) return;

		const svg = select(svgRef.current);
		svg.on(".drag", null).on(".zoom", null);

		// Keep globe drag active in marker mode; only disable free drag for
		// precision drawing workflows that rely on click-to-place anchors.
		const shouldDisableInertiaDrag =
			drawingModeRef.current === "line" ||
			drawingModeRef.current === "polygon" ||
			drawingModeRef.current === "text";

		if (!shouldDisableInertiaDrag) {
			const dragBehavior = drag<SVGSVGElement, unknown>().on("drag", (event) => {
				setIsAutoRotating(false);
				setRotation((previous) => {
					const nextLng = previous[0] + event.dx * 0.35;
					const nextLat = Math.max(-85, Math.min(85, previous[1] - event.dy * 0.35));
					return [nextLng, nextLat, previous[2] ?? 0];
				});
			});
			svg.call(dragBehavior);
		}

		const zoomBehavior = zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 10])
			.filter((event) => event.type === "wheel")
			.on("start", (event) => {
				// Keep auto-rotation alive for programmatic zoom bindings/identity transforms.
				if (event.sourceEvent) {
					setIsAutoRotating(false);
				}
			})
			.on("zoom", (event) => {
				if (event.sourceEvent) {
					setIsAutoRotating(false);
				}
				setScale(INITIAL_SCALE * event.transform.k);
				setK(event.transform.k);
			});

		svg.call(zoomBehavior);

		return () => {
			svg.on(".drag", null).on(".zoom", null);
		};
	}, [drawingMode]);

	const handleZoomIn = () => {
		setIsAutoRotating(false);
		setScale((prev) => Math.min(prev * 1.5, INITIAL_SCALE * 10));
	};
	const handleZoomOut = () => {
		setIsAutoRotating(false);
		setScale((prev) => Math.max(prev * 0.66, INITIAL_SCALE * 0.5));
	};
	const handleReset = useCallback(() => {
		viewportAnimationTimerRef.current?.stop();
		viewportAnimationTimerRef.current = null;
		setRotation([0, 0, 0]);
		setScale(INITIAL_SCALE);
		setK(1);
		setIsAutoRotating(true);
		if (svgRef.current) {
			const zoomBehavior = zoom<SVGSVGElement, unknown>();
			select(svgRef.current).call(zoomBehavior.transform, zoomIdentity);
		}
	}, []);

	useEffect(() => {
		if (viewportResetNonce === 0) return;
		handleReset();
	}, [handleReset, viewportResetNonce]);

	const animateViewportTo = useCallback(
		(targetRotation: [number, number, number], targetScale: number, durationMs = 360) => {
			viewportAnimationTimerRef.current?.stop();

			setIsAutoRotating(false);
			const startRotation = [...rotation] as [number, number, number];
			const startScale = scale;

			viewportAnimationTimerRef.current = timer((elapsed) => {
				const progress = Math.min(1, elapsed / durationMs);
				const eased = easeCubicOut(progress);

				setRotation([
					startRotation[0] + (targetRotation[0] - startRotation[0]) * eased,
					startRotation[1] + (targetRotation[1] - startRotation[1]) * eased,
					startRotation[2] + (targetRotation[2] - startRotation[2]) * eased,
				]);
				setScale(startScale + (targetScale - startScale) * eased);
				setK((startScale + (targetScale - startScale) * eased) / INITIAL_SCALE);

				if (progress >= 1) {
					viewportAnimationTimerRef.current?.stop();
					viewportAnimationTimerRef.current = null;
				}
			});
		},
		[rotation, scale],
	);

	const handleClusterFocus = (cluster: { lat: number; lng: number }) => {
		const { lng, lat } = cluster;
		if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

		const nextRotation: [number, number, number] = [-lng, -lat, rotation[2] ?? 0];
		const nextScale = Math.min(scale * 1.35, INITIAL_SCALE * 10);
		animateViewportTo(nextRotation, nextScale);
	};

	const handleClusterOpenInFlat = useCallback(
		(bounds: GeoFlatViewBounds | null) => {
			if (!bounds || !onOpenFlatViewForCluster) return;
			onOpenFlatViewForCluster(bounds);
		},
		[onOpenFlatViewForCluster],
	);

	useEffect(() => {
		if (mapBody !== "earth") {
			lastSelectionFocusIdRef.current = null;
			return;
		}
		if (!selectedEventId) {
			lastSelectionFocusIdRef.current = null;
			return;
		}
		if (lastSelectionFocusIdRef.current === selectedEventId) {
			return;
		}

		const selectedMarker = mapModel.markers.find(
			(marker) => marker.id === selectedEventId && marker.visible,
		);
		if (!selectedMarker) {
			return;
		}

		const focusTarget = buildGeoViewportFocusTarget({
			lat: selectedMarker.lat,
			lng: selectedMarker.lng,
			currentScale: scale,
			initialScale: INITIAL_SCALE,
		});
		if (!focusTarget) {
			return;
		}

		lastSelectionFocusIdRef.current = selectedEventId;
		animateViewportTo(focusTarget.rotation, focusTarget.scale, 320);
	}, [animateViewportTo, mapBody, mapModel.markers, scale, selectedEventId]);

	const handleBackgroundClick = useCallback(
		(event: MouseEvent<SVGSVGElement>) => {
			if (!svgRef.current) return;
			setIsAutoRotating(false);

			const rect = event.currentTarget.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;

			const x = mouseX * (MAP_WIDTH / rect.width);
			const y = mouseY * (MAP_HEIGHT / rect.height);

			const invert = mapModel.projection.invert;
			if (!invert) return;

			const inverted = invert([x, y]);
			if (!inverted) return;

			const [lng, lat] = inverted;
			if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

			if (isDrawingInteractionActive) {
				setPopupEventId(null);
				onMapClick({
					lat: Number(lat.toFixed(6)),
					lng: Number(lng.toFixed(6)),
				});
				return;
			}

			const nearestMarkerId = markerVoronoi.findNearestMarkerIdAtScreenPoint(x, y, 14);
			if (nearestMarkerId) {
				setPopupEventId(nearestMarkerId);
				onSelectEvent(nearestMarkerId);
				return;
			}

			setPopupEventId(null);

			onMapClick({
				lat: Number(lat.toFixed(6)),
				lng: Number(lng.toFixed(6)),
			});
		},
		[isDrawingInteractionActive, mapModel.projection, markerVoronoi, onMapClick, onSelectEvent],
	);

	const handleSvgMouseMove = (event: MouseEvent<SVGSVGElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		const x = mouseX * (MAP_WIDTH / rect.width);
		const y = mouseY * (MAP_HEIGHT / rect.height);
		if (isDrawingInteractionActive) {
			setHoverEventId((previous) => (previous === null ? previous : null));
		} else {
			const nearestMarkerId = markerVoronoi.findNearestMarkerIdAtScreenPoint(x, y, 10);
			setHoverEventId((previous) => (previous === nearestMarkerId ? previous : nearestMarkerId));
		}

		// Track mouse position as geo coords for drawing preview.
		if (
			(drawingMode === "line" || drawingMode === "polygon") &&
			(drawingMode !== "line" || pendingLineStart) &&
			mapModel.projection.invert
		) {
			const inverted = mapModel.projection.invert([x, y]);
			if (inverted) {
				const [lng, lat] = inverted;
				if (Number.isFinite(lat) && Number.isFinite(lng)) {
					setPreviewPoint({ lat, lng });
				}
			}
		} else if (previewPoint !== null) {
			setPreviewPoint(null);
		}
	};

	const handleSvgMouseLeave = () => {
		setHoverEventId(null);
		setPreviewPoint(null);
	};

	const activePopupMarker = useMemo(() => {
		if (!popupEventId) return null;
		return mapModel.markers.find((m) => m.id === popupEventId && m.visible);
	}, [popupEventId, mapModel.markers]);
	const severityLevels = [1, 2, 3, 4, 5] as const;
	const markerSymbolPathByEventId = useMemo(() => {
		const pathById = new Map<string, string>();
		for (const marker of mapModel.markers) {
			pathById.set(marker.id, getMarkerSymbolPath(marker.symbol, 95));
		}
		return pathById;
	}, [mapModel.markers]);
	const showCountryPolygons = showRegionLayer && bodyVisualConfig.countryLayerEnabled;
	const enableCanvasBasemapStage = true;
	const enableCanvasCountryStage = true;
	const enableCanvasBodyPointLayersStage = true;
	const useCanvasCountryHitLayer = enableCanvasCountryStage && showCountryPolygons;

	useGeoMapCanvasBasemapStage({
		canvasRef: basemapCanvasRef,
		enabled: enableCanvasBasemapStage,
		bodyVisualConfig,
		mapModel,
		showRegionLayer,
	});
	useGeoMapCanvasCountryStage({
		canvasRef: countryCanvasRef,
		enabled: enableCanvasCountryStage && showCountryPolygons,
		countries: mapModel.countries,
		showHeatmap,
		choroplethMode: earthChoroplethMode,
		resolveCountryStyle,
	});
	useGeoMapCanvasBodyPointLayersStage({
		canvasRef: bodyPointLayersCanvasRef,
		enabled: enableCanvasBodyPointLayersStage,
		bodyPointLayers: mapModel.bodyPointLayers,
	});

	return (
		<div
			className="relative h-full w-full overflow-hidden bg-background text-foreground group"
			data-testid="geopolitical-map-container"
		>
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

			{/* Globe Controls Overlay */}
			<div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					size="icon"
					variant="secondary"
					className="h-8 w-8 rounded-full shadow-lg bg-card/80 backdrop-blur border border-border/50"
					onClick={handleZoomIn}
					title="Zoom In"
				>
					<Plus className="h-4 w-4" />
				</Button>
				<Button
					size="icon"
					variant="secondary"
					className="h-8 w-8 rounded-full shadow-lg bg-card/80 backdrop-blur border border-border/50"
					onClick={handleZoomOut}
					title="Zoom Out"
				>
					<Minus className="h-4 w-4" />
				</Button>
				<Button
					size="icon"
					variant="secondary"
					className="h-8 w-8 rounded-full shadow-lg bg-card/80 backdrop-blur border border-border/50"
					onClick={handleReset}
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
							<button
								type="button"
								onClick={() => onChangeEarthChoroplethMode?.("severity")}
								className={
									earthChoroplethMode === "severity"
										? "rounded bg-success/20 px-2 py-1 text-left text-[10px] font-medium text-success"
										: "rounded bg-foreground/5 px-2 py-1 text-left text-[10px] font-medium text-muted-foreground hover:bg-foreground/10"
								}
								aria-pressed={earthChoroplethMode === "severity"}
								title="Country choropleth by event severity intensity"
							>
								Severity
							</button>
							<button
								type="button"
								onClick={() => onChangeEarthChoroplethMode?.("regime")}
								className={
									earthChoroplethMode === "regime"
										? "rounded bg-success/20 px-2 py-1 text-left text-[10px] font-medium text-success"
										: "rounded bg-foreground/5 px-2 py-1 text-left text-[10px] font-medium text-muted-foreground hover:bg-foreground/10"
								}
								aria-pressed={earthChoroplethMode === "regime"}
								title="Country choropleth by derived regime-state classification"
							>
								Regime
							</button>
							<button
								type="button"
								onClick={() => onChangeEarthChoroplethMode?.("macro")}
								className={
									earthChoroplethMode === "macro"
										? "rounded bg-success/20 px-2 py-1 text-left text-[10px] font-medium text-success"
										: "rounded bg-foreground/5 px-2 py-1 text-left text-[10px] font-medium text-muted-foreground hover:bg-foreground/10"
								}
								aria-pressed={earthChoroplethMode === "macro"}
								title="Country choropleth by policy rate (macro overlay)"
							>
								Macro
							</button>
						</div>
						<div className="mt-1 rounded border border-border/60 bg-background/60 px-2 py-1 text-[9px] text-muted-foreground">
							{earthChoroplethMode === "severity"
								? "Country fill = event severity intensity (bright = higher)."
								: earthChoroplethMode === "regime"
									? "Country fill = regime state (calm/watch/escalating/critical)."
									: "Country fill = macro overlay (policy-rate proxy, bright = higher)."}
						</div>
					</div>
				) : null}
			</div>

			<div className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-lg border border-border/50 bg-card/75 p-2 text-[10px] text-foreground shadow-lg backdrop-blur">
				<div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
					Geo Stats
				</div>
				<div className="grid grid-cols-2 gap-x-3 gap-y-1">
					<span className="text-muted-foreground">Visible markers</span>
					<span className="text-right tabular-nums">{geoMapStats.visibleMarkersLabel}</span>
					<span className="text-muted-foreground">Clusters</span>
					<span className="text-right tabular-nums">{geoMapStats.clusterLabel}</span>
					<span className="text-muted-foreground">Avg severity</span>
					<span className="text-right tabular-nums">{geoMapStats.avgSeverityLabel}</span>
					<span className="text-muted-foreground">Max intensity</span>
					<span className="text-right tabular-nums">{geoMapStats.maxCountryIntensityLabel}</span>
					<span className="text-muted-foreground">Latest hour</span>
					<span className="text-right tabular-nums">{geoMapStats.latestHourBucketLabel}</span>
				</div>
			</div>

			{/* Info Popup Overlay */}
			{activePopupMarker && (
				<div
					className="absolute z-20 pointer-events-none"
					style={{
						left: `${(activePopupMarker.x / MAP_WIDTH) * 100}%`,
						top: `${(activePopupMarker.y / MAP_HEIGHT) * 100}%`,
						transform: "translate(-50%, -110%)",
					}}
				>
					<div className="bg-card/95 border border-success/50 rounded-lg shadow-chromatic p-4 w-72 pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in duration-200">
						<div className="flex items-start justify-between mb-2">
							<h3 className="font-bold text-sm text-foreground line-clamp-2 pr-4">
								{activePopupMarker.title}
							</h3>
							<button
								type="button"
								className="text-muted-foreground hover:text-foreground transition-colors"
								onClick={(e) => {
									e.stopPropagation();
									setPopupEventId(null);
								}}
							>
								<Plus className="h-4 w-4 rotate-45" />
							</button>
						</div>

						<div className="flex items-center gap-2 mb-3">
							<div
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: getMarkerSeverityColor(activePopupMarker.severity) }}
							/>
							<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
								Severity {activePopupMarker.severity} •{" "}
								{activePopupMarker.raw.category.replace(/_/g, " ")}
							</span>
						</div>

						<div className="max-h-40 overflow-y-auto pr-1 scrollbar-hide text-xs text-muted-foreground leading-relaxed space-y-3 mb-3">
							<p>
								{activePopupMarker.raw.summary || "No detailed summary available for this event."}
							</p>

							{activePopupMarker.raw.sources.length > 0 && (
								<div className="pt-2 border-t border-border">
									<p className="font-bold text-muted-foreground mb-1 uppercase text-[9px]">
										Sources:
									</p>
									<ul className="space-y-1">
										{activePopupMarker.raw.sources.map((src) => (
											<li key={src.id}>
												<a
													href={src.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-success hover:underline flex items-center gap-1 truncate"
												>
													<Plus className="h-2 w-2" />
													{src.title || src.provider}
												</a>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						<div className="flex justify-between items-center pt-2 border-t border-border">
							<span className="text-[10px] text-muted-foreground/60 font-mono">
								{new Date(activePopupMarker.raw.updatedAt).toLocaleDateString()}
							</span>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 text-[10px] text-success hover:text-success/80 p-0"
								onClick={() => {
									onSelectEvent(activePopupMarker.id);
								}}
							>
								Focus in Sidebar
							</Button>
						</div>
					</div>
					<div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-card/95 mx-auto -mt-[1px]" />
				</div>
			)}

			<canvas
				ref={basemapCanvasRef}
				width={MAP_WIDTH}
				height={MAP_HEIGHT}
				className="pointer-events-none absolute inset-0 h-full w-full"
				aria-hidden="true"
				data-renderer="canvas"
				data-render-stage="basemap"
			/>
			<canvas
				ref={countryCanvasRef}
				width={MAP_WIDTH}
				height={MAP_HEIGHT}
				className="pointer-events-none absolute inset-0 h-full w-full"
				aria-hidden="true"
				data-renderer="canvas"
				data-render-stage="countries"
			/>
			<canvas
				ref={bodyPointLayersCanvasRef}
				width={MAP_WIDTH}
				height={MAP_HEIGHT}
				className="pointer-events-none absolute inset-0 h-full w-full"
				aria-hidden="true"
				data-renderer="canvas"
				data-render-stage="body-point-layers"
			/>

			<svg
				ref={svgRef}
				viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
				className="relative z-[1] h-full w-full cursor-grab active:cursor-grabbing outline-none"
				role="img"
				aria-label="Geopolitical map canvas"
				onClick={handleBackgroundClick}
				onMouseDown={() => setIsAutoRotating(false)}
				onMouseMove={handleSvgMouseMove}
				onMouseLeave={handleSvgMouseLeave}
			>
				<defs>
					<radialGradient id="globe-gradient" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="#0f172a" />
						<stop offset="100%" stopColor="#020617" />
					</radialGradient>
					<radialGradient id="moon-gradient" cx="46%" cy="38%" r="56%">
						<stop offset="0%" stopColor="#3f3f46" />
						<stop offset="58%" stopColor="#27272a" />
						<stop offset="100%" stopColor="#09090b" />
					</radialGradient>
					<filter id="glow">
						<feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<radialGradient id="halo-gradient">
						<stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
						<stop offset="100%" stopColor="#10b981" stopOpacity="0" />
					</radialGradient>
				</defs>

				<g data-render-stage="basemap">
					{!enableCanvasBasemapStage && (
						<>
							{/* Background Sphere with Gradient */}
							<path d={mapModel.spherePath} fill={`url(#${bodyVisualConfig.sphereGradientId})`} />

							{/* Atmospheric Glow */}
							<path
								d={mapModel.spherePath}
								fill="none"
								stroke={bodyVisualConfig.atmosphereStroke}
								strokeWidth={bodyVisualConfig.atmosphereStrokeWidth}
								opacity={bodyVisualConfig.atmosphereOpacity}
								filter="url(#glow)"
							/>

							{showRegionLayer && (
								<path
									d={mapModel.graticulePath}
									fill="none"
									stroke={bodyVisualConfig.graticuleStroke}
									strokeWidth={0.65}
									opacity={bodyVisualConfig.graticuleOpacity}
								/>
							)}
						</>
					)}

					{showCountryPolygons &&
						mapModel.countries.map((country) => {
							const countryStyle = resolveCountryStyle(country, showHeatmap, earthChoroplethMode);
							const renderAsHitLayer = useCanvasCountryHitLayer;
							const countryTooltip =
								earthChoroplethMode === "macro"
									? `${country.id.toUpperCase()} • macro=${country.macroValue ?? 0}`
									: earthChoroplethMode === "regime"
										? `${country.id.toUpperCase()} • regime=${country.regimeState} • events=${country.eventCount}`
										: `${country.id.toUpperCase()} • severity intensity=${country.intensity.toFixed(1)} • events=${country.eventCount}`;

							return (
								<path
									key={country.id}
									d={country.d}
									fill={renderAsHitLayer ? "transparent" : countryStyle.fill}
									stroke={renderAsHitLayer ? "transparent" : countryStyle.stroke}
									strokeWidth={renderAsHitLayer ? 1 : 0.55}
									opacity={renderAsHitLayer ? 1 : countryStyle.opacity}
									pointerEvents="all"
									data-render-role={renderAsHitLayer ? "country-hit-target" : "country-visual"}
									className={
										renderAsHitLayer
											? undefined
											: "transition-all duration-500 hover:fill-slate-700 hover:stroke-slate-400"
									}
									role="button"
									tabIndex={onCountryClick ? 0 : -1}
									aria-label={`Country ${country.id}`}
									onClick={(event) => {
										if (!onCountryClick) return;
										event.stopPropagation();
										onCountryClick(country.id);
									}}
								>
									<title>{countryTooltip}</title>
								</path>
							);
						})}

					{/* Cloud Layer (Subtle Overlay) */}
					{!enableCanvasBasemapStage && bodyVisualConfig.cloudOverlayEnabled && (
						<path
							d={mapModel.spherePath}
							fill="none"
							stroke={bodyVisualConfig.cloudOverlayStroke}
							strokeWidth="0.5"
							opacity={bodyVisualConfig.cloudOverlayOpacity}
							style={{ pointerEvents: "none" }}
						/>
					)}
				</g>

				<g data-render-stage="drawings">
					{mapModel.drawingPaths.map((drawing) => {
						const selected = selectedDrawingId === drawing.id;
						const color = drawing.color || "#22d3ee";

						if (drawing.type === "line" && drawing.geoPathString) {
							return (
								<path
									key={drawing.id}
									d={drawing.geoPathString}
									fill="none"
									stroke={color}
									strokeWidth={selected ? 3 : 2}
									role="button"
									tabIndex={0}
									aria-label={`Line drawing ${drawing.label ?? drawing.id}`}
									onClick={(event) => {
										event.stopPropagation();
										onSelectDrawing(drawing.id);
									}}
								/>
							);
						}

						if (drawing.type === "polygon" && drawing.geoPathString) {
							return (
								<path
									key={drawing.id}
									d={drawing.geoPathString}
									fill={color}
									fillOpacity={selected ? 0.35 : 0.2}
									stroke={color}
									strokeWidth={selected ? 2 : 1.2}
									role="button"
									tabIndex={0}
									aria-label={`Polygon drawing ${drawing.label ?? drawing.id}`}
									onClick={(event) => {
										event.stopPropagation();
										onSelectDrawing(drawing.id);
									}}
								/>
							);
						}

						if (drawing.type === "text" && drawing.projected.length >= 1) {
							const anchor = drawing.projected[0];
							const visible = mapModel.projection.invert
								? geoPath(mapModel.projection)({
										type: "Point",
										coordinates: drawing.points[0]
											? [drawing.points[0].lng, drawing.points[0].lat]
											: [0, 0],
									}) !== null
								: true;

							if (!visible) return null;

							return (
								<text
									key={drawing.id}
									x={anchor[0]}
									y={anchor[1]}
									fill={color}
									fontSize={selected ? 14 : 12}
									fontWeight={700}
									role="button"
									tabIndex={0}
									aria-label={`Text drawing ${drawing.label ?? drawing.id}`}
									onClick={(event) => {
										event.stopPropagation();
										onSelectDrawing(drawing.id);
									}}
								>
									{drawing.label || "Text"}
								</text>
							);
						}

						return null;
					})}
				</g>

				{/* Line drawing preview: dashed line from pendingLineStart to current mouse position */}
				{drawingMode === "line" &&
					pendingLineStart &&
					previewPoint &&
					(() => {
						const startProjected = mapModel.projection([
							pendingLineStart.lng,
							pendingLineStart.lat,
						]);
						const endProjected = mapModel.projection([previewPoint.lng, previewPoint.lat]);
						if (!startProjected || !endProjected) return null;
						return (
							<line
								x1={startProjected[0]}
								y1={startProjected[1]}
								x2={endProjected[0]}
								y2={endProjected[1]}
								stroke={drawingColor}
								strokeWidth={1.5}
								strokeDasharray="5,4"
								opacity={0.75}
								pointerEvents="none"
							/>
						);
					})()}
				{/* Polygon drawing preview: collected points + live cursor segment */}
				{drawingMode === "polygon" &&
					pendingPolygonPoints.length > 0 &&
					(() => {
						const previewPoints = [...pendingPolygonPoints];
						if (previewPoint) {
							previewPoints.push(previewPoint);
						}
						const projected = previewPoints
							.map((point) => mapModel.projection([point.lng, point.lat]))
							.filter((point): point is [number, number] => Array.isArray(point));
						if (projected.length === 0) return null;
						const polylinePoints = projected.map(([x, y]) => `${x},${y}`).join(" ");
						return (
							<g pointerEvents="none">
								<polyline
									points={polylinePoints}
									fill={pendingPolygonPoints.length >= 3 ? drawingColor : "none"}
									fillOpacity={pendingPolygonPoints.length >= 3 ? 0.14 : 0}
									stroke={drawingColor}
									strokeWidth={1.6}
									strokeDasharray="5,4"
									opacity={0.85}
								/>
								{projected.map(([x, y], index) => (
									<circle
										key={`pending-polygon-point-${previewPoints[index]?.lat ?? y}-${previewPoints[index]?.lng ?? x}`}
										cx={x}
										cy={y}
										r={3}
										fill={drawingColor}
										stroke="#020617"
										strokeWidth={0.8}
									/>
								))}
							</g>
						);
					})()}

				<g data-render-stage="soft-signals">
					{showSoftSignals &&
						mapModel.softSignals.map((signal) => {
							if (!signal.visible) return null;
							const softSignalStyle = getSoftSignalVisualStyle(signal.confidence);
							return (
								<g key={signal.id} transform={`translate(${signal.x}, ${signal.y})`}>
									<circle r={8} fill="#38bdf8" opacity={softSignalStyle.pulseOpacity}>
										<animate
											attributeName="r"
											from="4"
											to="14"
											dur="2.5s"
											repeatCount="indefinite"
										/>
										<animate
											attributeName="opacity"
											from="0.6"
											to="0"
											dur="2.5s"
											repeatCount="indefinite"
										/>
									</circle>
									<circle
										r={3}
										fill="#0ea5e9"
										stroke="#f8fafc"
										strokeWidth={0.5}
										opacity={softSignalStyle.coreOpacity}
									/>
								</g>
							);
						})}
				</g>

				<g data-render-stage="body-point-layers">
					{mapModel.bodyPointLayers.map((layer) =>
						(layer.rendererHint ?? "svg") !== "svg"
							? null
							: layer.points.map((point) => {
									if (!point.visible) return null;
									return (
										<g
											key={`${layer.id}:${point.id}`}
											transform={`translate(${point.x}, ${point.y})`}
											role="img"
											aria-label={point.ariaLabel}
										>
											<circle r={point.haloRadius} fill={point.fill} opacity={point.haloOpacity} />
											<circle
												r={point.coreRadius}
												fill={point.fill}
												stroke={point.stroke}
												strokeWidth={point.strokeWidth}
											/>
											<title>{point.title}</title>
										</g>
									);
								}),
					)}
				</g>

				<g data-render-stage="markers">
					{markerClusters.clusteringActive &&
						markerClusters.clusters.map((cluster) => (
							<g
								key={cluster.id}
								transform={`translate(${cluster.x}, ${cluster.y})`}
								role="button"
								tabIndex={0}
								aria-label={`Cluster with ${cluster.count} events`}
								className="cursor-pointer"
								onDoubleClick={(event) => {
									event.stopPropagation();
									handleClusterOpenInFlat(cluster.bounds);
								}}
								onClick={(event) => {
									event.stopPropagation();
									handleClusterFocus(cluster);
								}}
								onKeyDown={(event) => {
									if (event.key !== "Enter" && event.key !== " ") return;
									event.preventDefault();
									event.stopPropagation();
									if (event.shiftKey) {
										handleClusterOpenInFlat(cluster.bounds);
										return;
									}
									handleClusterFocus(cluster);
								}}
							>
								<circle r={16} fill="#0f172a" stroke="#38bdf8" strokeWidth={1.5} opacity={0.92} />
								<circle r={11} fill="#1e293b" stroke="#7dd3fc" strokeWidth={1} opacity={0.95} />
								<text
									y={4}
									textAnchor="middle"
									fill="#e2e8f0"
									fontSize={10}
									fontWeight={800}
									style={{ pointerEvents: "none", userSelect: "none" }}
								>
									{cluster.count > 99 ? "99+" : String(cluster.count)}
								</text>
								<title>{`Cluster: ${cluster.count} events. Click to focus, double-click or Shift+Enter to inspect in flat view.`}</title>
							</g>
						))}
					{mapModel.markers.map((marker) => {
						if (!marker.visible) return null;
						if (
							markerClusters.clusteringActive &&
							!markerClusters.unclusteredMarkerIds.has(marker.id) &&
							marker.id !== selectedEventId
						) {
							return null;
						}
						const selected = marker.id === selectedEventId;
						const hovered = marker.id === hoverEventId;
						const markerColor = getMarkerSeverityColor(marker.severity);
						return (
							<g
								key={marker.id}
								transform={`translate(${marker.x}, ${marker.y})`}
								role="button"
								tabIndex={0}
								aria-label={`Marker ${marker.title} severity ${marker.severity}`}
								onClick={(event) => {
									event.stopPropagation();
									setPopupEventId(marker.id);
									onSelectEvent(marker.id);
								}}
								pointerEvents={isDrawingInteractionActive ? "none" : "all"}
								className="cursor-pointer outline-none focus-visible:outline-none"
							>
								{(selected || hovered) && (
									<g>
										<circle
											r={selected ? 25 : 20}
											fill="url(#halo-gradient)"
											opacity={selected ? 1 : 0.6}
										/>
										<circle
											r={selected ? 20 : 17}
											fill="none"
											stroke={selected ? "#10b981" : "#7dd3fc"}
											strokeWidth={selected ? 2 : 1.25}
											opacity={selected ? 0.8 : 0.65}
										>
											<animate
												attributeName="r"
												from={selected ? "18" : "15"}
												to={selected ? "22" : "19"}
												dur="1.5s"
												repeatCount="indefinite"
											/>
											<animate
												attributeName="opacity"
												from="0.8"
												to="0.4"
												dur="1.5s"
												repeatCount="indefinite"
											/>
										</circle>
									</g>
								)}
								<circle
									r={14}
									fill={markerColor}
									stroke="#020617"
									strokeWidth={2}
									className="drop-shadow-lg"
								/>
								<path
									d={
										markerSymbolPathByEventId.get(marker.id) ??
										getMarkerSymbolPath(marker.symbol, 95)
									}
									transform="translate(0, 1)"
									fill="#f8fafc"
									stroke="#0f172a"
									strokeWidth={0.8}
									style={{ pointerEvents: "none" }}
								/>
								<title>{marker.title}</title>
							</g>
						);
					})}
				</g>
			</svg>
		</div>
	);
});
