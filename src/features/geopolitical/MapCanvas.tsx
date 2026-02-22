"use client";

import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform } from "d3-zoom";
import { Maximize, Minus, Plus, RotateCcw } from "lucide-react";
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries110 from "world-atlas/countries-110m.json";
import { Button } from "@/components/ui/button";
import type { GeoDrawing, GeoEvent, GeoCandidate } from "@/lib/geopolitical/types";

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 620;
const INITIAL_SCALE = 300;

interface MapCanvasProps {
	events: GeoEvent[];
	candidates: GeoCandidate[];
	drawings: GeoDrawing[];
	showRegionLayer: boolean;
	showHeatmap?: boolean;
	showSoftSignals?: boolean;
	selectedEventId: string | null;
	selectedDrawingId: string | null;
	onSelectEvent: (eventId: string) => void;
	onSelectDrawing: (drawingId: string) => void;
	onMapClick: (coords: { lat: number; lng: number }) => void;
	onCountryClick?: (countryId: string) => void;
}

interface MarkerPoint {
	id: string;
	symbol: string;
	shortLabel: string;
	x: number;
	y: number;
	severity: number;
	title: string;
	visible: boolean;
}

type CountriesTopology = Topology<{
	countries: GeometryCollection;
}>;

function markerColorBySeverity(severity: number): string {
	if (severity >= 5) return "#dc2626";
	if (severity === 4) return "#f97316";
	if (severity === 3) return "#f59e0b";
	if (severity === 2) return "#22c55e";
	return "#38bdf8";
}

export function MapCanvas({
	events,
	candidates,
	drawings,
	showRegionLayer,
	showHeatmap = true,
	showSoftSignals = true,
	selectedEventId,
	selectedDrawingId,
	onSelectEvent,
	onSelectDrawing,
	onMapClick,
	onCountryClick,
}: MapCanvasProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
	const [scale, setScale] = useState(INITIAL_SCALE);
	const [k, setK] = useState(1);
	const [popupEventId, setPopupEventId] = useState<string | null>(null);
	const [isAutoRotating, setIsAutoRotating] = useState(true);

	const mapModel = useMemo(() => {
		const worldTopo = countries110 as unknown as CountriesTopology;
		const worldFeatures = feature(worldTopo, worldTopo.objects.countries) as FeatureCollection<
			Geometry,
			GeoJsonProperties
		>;

		const projection = geoOrthographic()
			.scale(scale)
			.translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
			.rotate(rotation)
			.clipAngle(90);

		const pathGenerator = geoPath(projection);

		// Calculate country intensity for heatmap
		const intensityMap: Record<string, number> = {};
		for (const event of events) {
			for (const code of event.countryCodes) {
				intensityMap[code] = (intensityMap[code] || 0) + Number(event.severity);
			}
		}

		const countries = worldFeatures.features
			.map((entry, index) => {
				const name = (entry.properties as Record<string, unknown> | undefined)?.name as string;
				const intensity = intensityMap[name] || 0;
				return {
					id: name ?? `country-${index}`,
					d: pathGenerator(entry),
					intensity,
				};
			})
			.filter(
				(entry): entry is { id: string; d: string; intensity: number } =>
					typeof entry.d === "string",
			);

		const graticulePath = pathGenerator(geoGraticule10()) ?? "";
		const spherePath = pathGenerator({ type: "Sphere" }) ?? "";

		const markers = events.reduce<Array<MarkerPoint & { raw: GeoEvent }>>((accumulator, event) => {
			const firstCoordinate = event.coordinates?.[0];
			if (!firstCoordinate) return accumulator;
			
			const projected = projection([firstCoordinate.lng, firstCoordinate.lat]);
			if (!projected) return accumulator;

			const visible = pathGenerator({ type: "Point", coordinates: [firstCoordinate.lng, firstCoordinate.lat] }) !== null;

			accumulator.push({
				id: event.id,
				symbol: event.symbol,
				shortLabel: event.symbol.slice(0, 2).toUpperCase(),
				x: projected[0],
				y: projected[1],
				severity: Number(event.severity),
				title: event.title,
				visible,
				raw: event,
			});
			return accumulator;
		}, []);

		const softSignals = candidates.reduce<
			Array<{ id: string; x: number; y: number; confidence: number; visible: boolean }>
		>((acc, cand) => {
			if (!cand.coordinates?.[0]) return acc;
			const projected = projection([cand.coordinates[0].lng, cand.coordinates[0].lat]);
			if (!projected) return acc;
			
			const visible = pathGenerator({ type: "Point", coordinates: [cand.coordinates[0].lng, cand.coordinates[0].lat] }) !== null;

			acc.push({
				id: cand.id,
				x: projected[0],
				y: projected[1],
				confidence: cand.confidence,
				visible,
			});
			return acc;
		}, []);

		const drawingPaths = drawings.map((drawing) => {
			const projected = drawing.points
				.map((point) => projection([point.lng, point.lat]))
				.filter((point): point is [number, number] => Array.isArray(point) && point.length === 2);
			
			let geoPathString = "";
			if (drawing.type === "line") {
				geoPathString = pathGenerator({ type: "LineString", coordinates: drawing.points.map(p => [p.lng, p.lat]) }) ?? "";
			} else if (drawing.type === "polygon") {
				geoPathString = pathGenerator({ type: "Polygon", coordinates: [drawing.points.map(p => [p.lng, p.lat])] }) ?? "";
			}

			return {
				...drawing,
				projected,
				geoPathString,
			};
		});

		return {
			projection,
			countries,
			graticulePath,
			spherePath,
			markers,
			softSignals,
			drawingPaths,
		};
	}, [drawings, events, candidates, rotation, scale]);

	// Auto-rotation effect
	useEffect(() => {
		if (!isAutoRotating) return;
		
		const timer = setInterval(() => {
			setRotation(([r1, r2, r3]) => [r1 + 0.1, r2, r3]);
		}, 50);
		
		return () => clearInterval(timer);
	}, [isAutoRotating]);

	useEffect(() => {
		if (!svgRef.current) return;

		const svg = select(svgRef.current);

		const dragBehavior = drag<SVGSVGElement, unknown>()
			.on("start", () => setIsAutoRotating(false))
			.on("drag", (event) => {
				const dx = event.dx;
				const dy = event.dy;
				setRotation(([r1, r2, r3]) => [
					r1 + dx * (150 / scale), 
					r2 - dy * (150 / scale), 
					r3
				]);
			});

		const zoomBehavior = zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 10])
			.on("start", () => setIsAutoRotating(false))
			.on("zoom", (event) => {
				setScale(INITIAL_SCALE * event.transform.k);
				setK(event.transform.k);
			});

		svg.call(dragBehavior as any);
		svg.call(zoomBehavior);
	}, [scale]);

	const handleZoomIn = () => {
		setIsAutoRotating(false);
		setScale(prev => Math.min(prev * 1.5, INITIAL_SCALE * 10));
	};
	const handleZoomOut = () => {
		setIsAutoRotating(false);
		setScale(prev => Math.max(prev * 0.66, INITIAL_SCALE * 0.5));
	};
	const handleReset = () => {
		setRotation([0, 0, 0]);
		setScale(INITIAL_SCALE);
		setK(1);
		setIsAutoRotating(true);
		if (svgRef.current) {
			select(svgRef.current).call(zoom<SVGSVGElement, unknown>().transform as any, zoomIdentity);
		}
	};

	const handleBackgroundClick = (event: MouseEvent<SVGSVGElement>) => {
		if (!svgRef.current) return;
		setPopupEventId(null);
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

		onMapClick({
			lat: Number(lat.toFixed(6)),
			lng: Number(lng.toFixed(6)),
		});
	};

	const activePopupMarker = useMemo(() => {
		if (!popupEventId) return null;
		return mapModel.markers.find(m => m.id === popupEventId && m.visible);
	}, [popupEventId, mapModel.markers]);

	return (
		<div className="h-full w-full rounded-lg border border-border bg-slate-950/50 p-2 overflow-hidden relative group text-slate-100">
			{/* Globe Controls Overlay */}
			<div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={handleZoomIn} title="Zoom In">
					<Plus className="h-4 w-4" />
				</Button>
				<Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={handleZoomOut} title="Zoom Out">
					<Minus className="h-4 w-4" />
				</Button>
				<Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={handleReset} title="Reset View">
					<RotateCcw className="h-4 w-4" />
				</Button>
			</div>

			{/* Info Popup Overlay */}
			{activePopupMarker && (
				<div 
					className="absolute z-20 pointer-events-none"
					style={{ 
						left: `${(activePopupMarker.x / MAP_WIDTH) * 100}%`, 
						top: `${(activePopupMarker.y / MAP_HEIGHT) * 100}%`,
						transform: 'translate(-50%, -110%)'
					}}
				>
					<div className="bg-slate-900/95 border border-emerald-500/50 rounded-lg shadow-2xl p-4 w-72 pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in duration-200">
						<div className="flex items-start justify-between mb-2">
							<h3 className="font-bold text-sm text-slate-100 line-clamp-2 pr-4">{activePopupMarker.title}</h3>
							<button 
								type="button"
								className="text-slate-400 hover:text-white transition-colors"
								onClick={(e) => { e.stopPropagation(); setPopupEventId(null); }}
							>
								<Plus className="h-4 w-4 rotate-45" />
							</button>
						</div>
						
						<div className="flex items-center gap-2 mb-3">
							<div 
								className="h-2 w-2 rounded-full" 
								style={{ backgroundColor: markerColorBySeverity(activePopupMarker.severity) }} 
							/>
							<span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
								Severity {activePopupMarker.severity} • {activePopupMarker.raw.category.replace(/_/g, ' ')}
							</span>
						</div>

						<div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar text-xs text-slate-300 leading-relaxed space-y-3 mb-3">
							<p>{activePopupMarker.raw.summary || "No detailed summary available for this event."}</p>
							
							{activePopupMarker.raw.sources.length > 0 && (
								<div className="pt-2 border-t border-slate-800">
									<p className="font-bold text-slate-400 mb-1 uppercase text-[9px]">Sources:</p>
									<ul className="space-y-1">
										{activePopupMarker.raw.sources.map(src => (
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
								onClick={() => { onSelectEvent(activePopupMarker.id); }}
							>
								Focus in Sidebar
							</Button>
						</div>
					</div>
					<div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900/95 mx-auto -mt-[1px]" />
				</div>
			)}

			<svg
				ref={svgRef}
				viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
				className="h-full w-full rounded-md cursor-grab active:cursor-grabbing outline-none"
				role="img"
				aria-label="Geopolitical map canvas"
				onClick={handleBackgroundClick}
			>
				<defs>
					<radialGradient id="globe-gradient" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="#0f172a" />
						<stop offset="100%" stopColor="#020617" />
					</radialGradient>
					<filter id="glow">
						<feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
						<feMerge>
							<feMergeNode in="coloredBlur"/>
							<feMergeNode in="SourceGraphic"/>
						</feMerge>
					</filter>
					<radialGradient id="halo-gradient">
						<stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
						<stop offset="100%" stopColor="#10b981" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* Background Sphere with Gradient */}
				<path d={mapModel.spherePath} fill="url(#globe-gradient)" />
				
				{/* Atmospheric Glow */}
				<path d={mapModel.spherePath} fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.2" filter="url(#glow)" />

				{showRegionLayer && (
					<path
						d={mapModel.graticulePath}
						fill="none"
						stroke="#334155"
						strokeWidth={0.65}
						opacity={0.3}
					/>
				)}

				{showRegionLayer &&
					mapModel.countries.map((country: { id: string; d: string; intensity: number }) => {
						let fillColor = "#1e293b"; // base land color
						let strokeColor = "#334155";
						let opacity = 0.8;

						if (showHeatmap && country.intensity > 0) {
							opacity = 1;
							if (country.intensity > 20) fillColor = "#991b1b";
							else if (country.intensity > 10) fillColor = "#b91c1c";
							else if (country.intensity > 5) fillColor = "#7f1d1d";
							else fillColor = "#450a0a";
						}

						return (
							<path
								key={country.id}
								d={country.d}
								fill={fillColor}
								stroke={strokeColor}
								strokeWidth={0.55}
								opacity={opacity}
								className="transition-all duration-500 hover:fill-slate-700 hover:stroke-slate-400"
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
				<path 
					d={mapModel.spherePath} 
					fill="none" 
					stroke="white" 
					strokeWidth="0.5" 
					opacity="0.05" 
					style={{ pointerEvents: 'none' }}
				/>

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
						const visible = mapModel.projection.invert ? (
							geoPath(mapModel.projection)({ type: "Point", coordinates: drawing.points[0] ? [drawing.points[0].lng, drawing.points[0].lat] : [0,0] }) !== null
						) : true;

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

				{showSoftSignals &&
					mapModel.softSignals.map((signal) => {
						if (!signal.visible) return null;
						return (
							<g key={signal.id} transform={`translate(${signal.x}, ${signal.y})`}>
								<circle r={8} fill="#38bdf8" opacity={0.3}>
									<animate attributeName="r" from="4" to="14" dur="2.5s" repeatCount="indefinite" />
									<animate
										attributeName="opacity"
										from="0.6"
										to="0"
										dur="2.5s"
										repeatCount="indefinite"
									/>
								</circle>
								<circle r={3} fill="#0ea5e9" stroke="#f8fafc" strokeWidth={0.5} />
							</g>
						);
					})}

				{mapModel.markers.map((marker) => {
					if (!marker.visible) return null;
					const selected = marker.id === selectedEventId;
					const markerColor = markerColorBySeverity(marker.severity);
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
							{selected && (
								<g>
									<circle r={25} fill="url(#halo-gradient)" />
									<circle r={20} fill="none" stroke="#10b981" strokeWidth={2} opacity={0.8}>
										<animate attributeName="r" from="18" to="22" dur="1.5s" repeatCount="indefinite" />
										<animate attributeName="opacity" from="0.8" to="0.4" dur="1.5s" repeatCount="indefinite" />
									</circle>
								</g>
							)}
							<circle r={14} fill={markerColor} stroke="#020617" strokeWidth={2} className="drop-shadow-lg" />
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
			</svg>
		</div>
	);
}
