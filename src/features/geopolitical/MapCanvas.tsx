"use client";

import { drag } from "d3-drag";
import { easeCubicOut } from "d3-ease";
import { geoPath } from "d3-geo";
import { select } from "d3-selection";
import { timer } from "d3-timer";
import { zoom, zoomIdentity } from "d3-zoom";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGeoMapBodyVisualConfig } from "@/features/geopolitical/bodies";
import { buildGeoMapStatsSummary } from "@/features/geopolitical/d3/geoMapStats";
import {
	createCountryStyleResolver,
	getSoftSignalVisualStyle,
} from "@/features/geopolitical/d3/scales";
import type { GeoFlatViewBounds } from "@/features/geopolitical/flat-view/flat-view-handoff";
import { useMacroOverlayData } from "@/features/geopolitical/hooks/useMacroOverlayData";
import { buildGeoMarkerPopupModel } from "@/features/geopolitical/markers/marker-view-model";
import { MapCanvasDrawingOverlays } from "@/features/geopolitical/rendering/MapCanvasDrawingOverlays";
import { MapCanvasMarkerLayer } from "@/features/geopolitical/rendering/MapCanvasMarkerLayer";
import {
	MapCanvasControlsOverlay,
	MapCanvasEventPopupOverlay,
	MapCanvasMarkerLegendOverlay,
	MapCanvasStatsOverlay,
} from "@/features/geopolitical/rendering/MapCanvasOverlays";
import { useGeoMapCanvasBasemapStage } from "@/features/geopolitical/rendering/useGeoMapCanvasBasemapStage";
import { useGeoMapCanvasBodyPointLayersStage } from "@/features/geopolitical/rendering/useGeoMapCanvasBodyPointLayersStage";
import { useGeoMapCanvasCountryStage } from "@/features/geopolitical/rendering/useGeoMapCanvasCountryStage";
import { useGeoMapCanvasInteractions } from "@/features/geopolitical/rendering/useGeoMapCanvasInteractions";
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
	selectedEventIds?: string[];
	selectedDrawingId: string | null;
	onSelectEvent: (eventId: string) => void;
	onSelectEvents?: (eventIds: string[], mode?: "replace" | "append" | "toggle" | "clear") => void;
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
	selectedEventIds = [],
	selectedDrawingId,
	onSelectEvent,
	onSelectEvents,
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
			const dragBehavior = drag<SVGSVGElement, unknown>()
				.filter((event) => !event.shiftKey)
				.on("drag", (event) => {
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

	const {
		previewPoint,
		selectionBox,
		handleBackgroundClick,
		handleSelectionBoxEnd,
		handleSelectionBoxMove,
		handleSelectionBoxStart,
		handleSvgMouseLeave,
		handleSvgMouseMove,
	} = useGeoMapCanvasInteractions({
		svgRef,
		mapWidth: MAP_WIDTH,
		mapHeight: MAP_HEIGHT,
		projection: mapModel.projection,
		markers: mapModel.markers,
		drawingMode,
		pendingLineStart,
		isDrawingInteractionActive,
		findNearestMarkerIdAtScreenPoint: markerVoronoi.findNearestMarkerIdAtScreenPoint,
		onMapClick,
		onSelectEvent,
		onSelectEvents,
		setIsAutoRotating,
		setPopupEventId,
		setHoverEventId,
	});

	const activePopupMarker = useMemo(() => {
		if (!popupEventId) return null;
		const marker = mapModel.markers.find((entry) => entry.id === popupEventId && entry.visible);
		return marker ? buildGeoMarkerPopupModel(marker) : null;
	}, [popupEventId, mapModel.markers]);
	const severityLevels = [1, 2, 3, 4, 5] as const;
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
			<MapCanvasMarkerLegendOverlay severityLevels={severityLevels} />
			<MapCanvasControlsOverlay
				mapBody={mapBody}
				earthChoroplethMode={earthChoroplethMode}
				onChangeEarthChoroplethMode={onChangeEarthChoroplethMode}
				onZoomIn={handleZoomIn}
				onZoomOut={handleZoomOut}
				onReset={handleReset}
			/>
			<MapCanvasStatsOverlay
				visibleMarkersLabel={geoMapStats.visibleMarkersLabel}
				clusterLabel={geoMapStats.clusterLabel}
				avgSeverityLabel={geoMapStats.avgSeverityLabel}
				maxCountryIntensityLabel={geoMapStats.maxCountryIntensityLabel}
				latestHourBucketLabel={geoMapStats.latestHourBucketLabel}
			/>
			{activePopupMarker ? (
				<MapCanvasEventPopupOverlay
					marker={activePopupMarker}
					mapWidth={MAP_WIDTH}
					mapHeight={MAP_HEIGHT}
					onClose={() => setPopupEventId(null)}
					onFocusSidebar={onSelectEvent}
				/>
			) : null}

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
				onMouseDown={(event) => {
					setIsAutoRotating(false);
					handleSelectionBoxStart(event);
				}}
				onMouseMove={handleSvgMouseMove}
				onMouseMoveCapture={handleSelectionBoxMove}
				onMouseUp={handleSelectionBoxEnd}
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
							if (!anchor) return null;
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

				<MapCanvasDrawingOverlays
					selectionBox={selectionBox}
					drawingMode={drawingMode}
					pendingLineStart={pendingLineStart}
					pendingPolygonPoints={pendingPolygonPoints}
					previewPoint={previewPoint}
					drawingColor={drawingColor}
					projection={mapModel.projection}
				/>

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

				<MapCanvasMarkerLayer
					scale={scale}
					clusteringActive={markerClusters.clusteringActive}
					clusters={markerClusters.clusters}
					unclusteredMarkerIds={markerClusters.unclusteredMarkerIds}
					markers={mapModel.markers}
					selectedEventId={selectedEventId}
					selectedEventIds={selectedEventIds}
					hoverEventId={hoverEventId}
					isDrawingInteractionActive={isDrawingInteractionActive}
					onSelectEvent={onSelectEvent}
					onSelectEvents={onSelectEvents}
					onClusterFocus={handleClusterFocus}
					onClusterOpenInFlat={handleClusterOpenInFlat}
					onMarkerPopupChange={setPopupEventId}
				/>
			</svg>
		</div>
	);
});
