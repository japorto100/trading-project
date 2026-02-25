"use client";

import { easeCubicOut } from "d3-ease";
import { geoPath } from "d3-geo";
import { geoInertiaDrag } from "d3-inertia";
import { select } from "d3-selection";
import { timer } from "d3-timer";
import { zoom, zoomIdentity } from "d3-zoom";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getGeoMapBodyVisualConfig } from "@/features/geopolitical/bodies";
import { buildGeoMapStatsSummary } from "@/features/geopolitical/d3/geoMapStats";
import {
	createCountryStyleResolver,
	getMarkerSeverityColor,
	getSoftSignalVisualStyle,
} from "@/features/geopolitical/d3/scales";
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
import type { GeoCandidate, GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

interface MapCanvasProps {
	mapBody?: GeoMapBody;
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
}

export function MapCanvas({
	mapBody = "earth",
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
}: MapCanvasProps) {
	const basemapCanvasRef = useRef<HTMLCanvasElement>(null);
	const countryCanvasRef = useRef<HTMLCanvasElement>(null);
	const bodyPointLayersCanvasRef = useRef<HTMLCanvasElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const viewportAnimationTimerRef = useRef<{ stop: () => void } | null>(null);
	const projectionRef = useRef<ReturnType<typeof useGeoMapProjectionModel>["projection"] | null>(
		null,
	);
	const inertiaProjectionAdapterRef = useRef<{
		rotate: (rotation?: [number, number, number] | [number, number]) => number[];
		invert: (point: [number, number]) => [number, number] | null;
	} | null>(null);
	const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
	const [scale, setScale] = useState(INITIAL_SCALE);
	const [, setK] = useState(1);
	const [popupEventId, setPopupEventId] = useState<string | null>(null);
	const [hoverEventId, setHoverEventId] = useState<string | null>(null);
	const [isAutoRotating, setIsAutoRotating] = useState(true);
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
	const resolveCountryStyle = useMemo(
		() => createCountryStyleResolver(maxCountryIntensity),
		[maxCountryIntensity],
	);

	const mapModel = useGeoMapProjectionModel({
		mapBody,
		events,
		candidates,
		drawings,
		bodyPointLayerVisibility,
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
	projectionRef.current = mapModel.projection;
	if (!inertiaProjectionAdapterRef.current) {
		inertiaProjectionAdapterRef.current = {
			rotate: (nextRotation) => {
				const projection = projectionRef.current;
				if (!projection) return [0, 0, 0];
				if (nextRotation) {
					projection.rotate?.(nextRotation);
				}
				return projection.rotate?.() ?? [0, 0, 0];
			},
			invert: (point) => {
				const projection = projectionRef.current;
				if (!projection) return null;
				return (projection.invert?.(point) as [number, number] | null) ?? null;
			},
		};
	}

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

	useEffect(() => {
		if (!svgRef.current) return;

		const svg = select(svgRef.current);
		svg.on(".drag", null);
		const inertiaController = geoInertiaDrag(
			svgRef.current,
			() => {
				if (!projectionRef.current) return;
				const nextRotation = projectionRef.current.rotate();
				setRotation([nextRotation[0], nextRotation[1], nextRotation[2] ?? 0]);
			},
			inertiaProjectionAdapterRef.current,
			{
				start: () => setIsAutoRotating(false),
				move: () => setIsAutoRotating(false),
				end: () => setIsAutoRotating(false),
				stop: () => setIsAutoRotating(false),
				finish: () => setIsAutoRotating(false),
				time: 1800,
				hold: 120,
			},
		) as { timer?: { stop: () => void } } | undefined;

		const zoomBehavior = zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 10])
			.on("start", () => setIsAutoRotating(false))
			.on("zoom", (event) => {
				setScale(INITIAL_SCALE * event.transform.k);
				setK(event.transform.k);
			});

		svg.call(zoomBehavior);

		return () => {
			svg.on(".drag", null);
			inertiaController?.timer?.stop();
		};
	}, []);

	const handleZoomIn = () => {
		setIsAutoRotating(false);
		setScale((prev) => Math.min(prev * 1.5, INITIAL_SCALE * 10));
	};
	const handleZoomOut = () => {
		setIsAutoRotating(false);
		setScale((prev) => Math.max(prev * 0.66, INITIAL_SCALE * 0.5));
	};
	const handleReset = () => {
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
	};

	const animateViewportTo = (
		targetRotation: [number, number, number],
		targetScale: number,
		durationMs = 360,
	) => {
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
	};

	const handleClusterFocus = (cluster: { lat: number; lng: number }) => {
		const { lng, lat } = cluster;
		if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

		const nextRotation: [number, number, number] = [-lng, -lat, rotation[2] ?? 0];
		const nextScale = Math.min(scale * 1.35, INITIAL_SCALE * 10);
		animateViewportTo(nextRotation, nextScale);
	};

	const handleBackgroundClick = (event: MouseEvent<SVGSVGElement>) => {
		if (!svgRef.current) return;
		setIsAutoRotating(false);

		const rect = event.currentTarget.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		const x = mouseX * (MAP_WIDTH / rect.width);
		const y = mouseY * (MAP_HEIGHT / rect.height);

		const invert = mapModel.projection.invert;
		if (!invert) return;

		const nearestMarkerId = markerVoronoi.findNearestMarkerIdAtScreenPoint(x, y, 14);
		if (nearestMarkerId) {
			setPopupEventId(nearestMarkerId);
			onSelectEvent(nearestMarkerId);
			return;
		}

		setPopupEventId(null);

		const inverted = invert([x, y]);
		if (!inverted) return;

		const [lng, lat] = inverted;
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

		onMapClick({
			lat: Number(lat.toFixed(6)),
			lng: Number(lng.toFixed(6)),
		});
	};

	const handleSvgMouseMove = (event: MouseEvent<SVGSVGElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		const x = mouseX * (MAP_WIDTH / rect.width);
		const y = mouseY * (MAP_HEIGHT / rect.height);
		const nearestMarkerId = markerVoronoi.findNearestMarkerIdAtScreenPoint(x, y, 10);
		setHoverEventId((previous) => (previous === nearestMarkerId ? previous : nearestMarkerId));
	};

	const handleSvgMouseLeave = () => {
		setHoverEventId(null);
	};

	const activePopupMarker = useMemo(() => {
		if (!popupEventId) return null;
		return mapModel.markers.find((m) => m.id === popupEventId && m.visible);
	}, [popupEventId, mapModel.markers]);
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
			className="h-full w-full rounded-lg border border-border bg-slate-950/50 p-2 overflow-hidden relative group text-slate-100"
			data-testid="geopolitical-map-container"
		>
			{/* Globe Controls Overlay */}
			<div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					size="icon"
					variant="secondary"
					className="h-8 w-8 rounded-full shadow-lg"
					onClick={handleZoomIn}
					title="Zoom In"
				>
					<Plus className="h-4 w-4" />
				</Button>
				<Button
					size="icon"
					variant="secondary"
					className="h-8 w-8 rounded-full shadow-lg"
					onClick={handleZoomOut}
					title="Zoom Out"
				>
					<Minus className="h-4 w-4" />
				</Button>
				<Button
					size="icon"
					variant="secondary"
					className="h-8 w-8 rounded-full shadow-lg"
					onClick={handleReset}
					title="Reset View"
				>
					<RotateCcw className="h-4 w-4" />
				</Button>
				{mapBody === "earth" ? (
					<div className="mt-1 rounded-lg border border-white/15 bg-slate-900/85 p-1 shadow-lg backdrop-blur">
						<div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300/80">
							Layer
						</div>
						<div className="flex flex-col gap-1">
							<button
								type="button"
								onClick={() => onChangeEarthChoroplethMode?.("severity")}
								className={
									earthChoroplethMode === "severity"
										? "rounded bg-emerald-500/20 px-2 py-1 text-left text-[10px] font-medium text-emerald-200"
										: "rounded bg-white/5 px-2 py-1 text-left text-[10px] font-medium text-slate-300 hover:bg-white/10"
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
										? "rounded bg-emerald-500/20 px-2 py-1 text-left text-[10px] font-medium text-emerald-200"
										: "rounded bg-white/5 px-2 py-1 text-left text-[10px] font-medium text-slate-300 hover:bg-white/10"
								}
								aria-pressed={earthChoroplethMode === "regime"}
								title="Country choropleth by derived regime-state classification"
							>
								Regime
							</button>
						</div>
					</div>
				) : null}
			</div>

			<div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-lg border border-white/10 bg-slate-900/70 p-2 text-[10px] text-slate-200/90 shadow-lg backdrop-blur">
				<div className="mb-1 font-semibold uppercase tracking-wide text-slate-300/80">
					Geo Stats
				</div>
				<div className="grid grid-cols-2 gap-x-3 gap-y-1">
					<span className="text-slate-400">Visible markers</span>
					<span className="text-right tabular-nums">{geoMapStats.visibleMarkersLabel}</span>
					<span className="text-slate-400">Clusters</span>
					<span className="text-right tabular-nums">{geoMapStats.clusterLabel}</span>
					<span className="text-slate-400">Avg severity</span>
					<span className="text-right tabular-nums">{geoMapStats.avgSeverityLabel}</span>
					<span className="text-slate-400">Max intensity</span>
					<span className="text-right tabular-nums">{geoMapStats.maxCountryIntensityLabel}</span>
					<span className="text-slate-400">Latest hour</span>
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
					<div className="bg-slate-900/95 border border-emerald-500/50 rounded-lg shadow-2xl p-4 w-72 pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in duration-200">
						<div className="flex items-start justify-between mb-2">
							<h3 className="font-bold text-sm text-slate-100 line-clamp-2 pr-4">
								{activePopupMarker.title}
							</h3>
							<button
								type="button"
								className="text-slate-400 hover:text-white transition-colors"
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
							<span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
								Severity {activePopupMarker.severity} •{" "}
								{activePopupMarker.raw.category.replace(/_/g, " ")}
							</span>
						</div>

						<div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar text-xs text-slate-300 leading-relaxed space-y-3 mb-3">
							<p>
								{activePopupMarker.raw.summary || "No detailed summary available for this event."}
							</p>

							{activePopupMarker.raw.sources.length > 0 && (
								<div className="pt-2 border-t border-slate-800">
									<p className="font-bold text-slate-400 mb-1 uppercase text-[9px]">Sources:</p>
									<ul className="space-y-1">
										{activePopupMarker.raw.sources.map((src) => (
											<li key={src.id}>
												<a
													href={src.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-emerald-400 hover:underline flex items-center gap-1 truncate"
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

						<div className="flex justify-between items-center pt-2 border-t border-slate-800">
							<span className="text-[10px] text-slate-500 font-mono">
								{new Date(activePopupMarker.raw.updatedAt).toLocaleDateString()}
							</span>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 text-[10px] text-emerald-400 hover:text-emerald-300 p-0"
								onClick={() => {
									onSelectEvent(activePopupMarker.id);
								}}
							>
								Focus in Sidebar
							</Button>
						</div>
					</div>
					<div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900/95 mx-auto -mt-[1px]" />
				</div>
			)}

			<canvas
				ref={basemapCanvasRef}
				width={MAP_WIDTH}
				height={MAP_HEIGHT}
				className="pointer-events-none absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-md"
				aria-hidden="true"
				data-renderer="canvas"
				data-render-stage="basemap"
			/>
			<canvas
				ref={countryCanvasRef}
				width={MAP_WIDTH}
				height={MAP_HEIGHT}
				className="pointer-events-none absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-md"
				aria-hidden="true"
				data-renderer="canvas"
				data-render-stage="countries"
			/>
			<canvas
				ref={bodyPointLayersCanvasRef}
				width={MAP_WIDTH}
				height={MAP_HEIGHT}
				className="pointer-events-none absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-md"
				aria-hidden="true"
				data-renderer="canvas"
				data-render-stage="body-point-layers"
			/>

			<svg
				ref={svgRef}
				viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
				className="relative z-[1] h-full w-full rounded-md cursor-grab active:cursor-grabbing outline-none"
				role="img"
				aria-label="Geopolitical map canvas"
				onClick={handleBackgroundClick}
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
								/>
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
								onClick={(event) => {
									event.stopPropagation();
									handleClusterFocus(cluster);
								}}
								onKeyDown={(event) => {
									if (event.key !== "Enter" && event.key !== " ") return;
									event.preventDefault();
									event.stopPropagation();
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
								<title>{`Cluster: ${cluster.count} events`}</title>
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
								className="cursor-pointer"
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
								<text
									y={4}
									textAnchor="middle"
									fill="#f8fafc"
									fontSize={10}
									fontWeight={800}
									style={{ pointerEvents: "none", userSelect: "none" }}
								>
									{marker.shortLabel}
								</text>
								<title>{marker.title}</title>
							</g>
						);
					})}
				</g>
			</svg>
		</div>
	);
}
