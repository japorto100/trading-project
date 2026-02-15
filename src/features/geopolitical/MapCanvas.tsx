"use client";

import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import { type MouseEvent, useMemo } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries110 from "world-atlas/countries-110m.json";
import type { GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 620;

interface MapCanvasProps {
	events: GeoEvent[];
	drawings: GeoDrawing[];
	showRegionLayer: boolean;
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
	drawings,
	showRegionLayer,
	selectedEventId,
	selectedDrawingId,
	onSelectEvent,
	onSelectDrawing,
	onMapClick,
	onCountryClick,
}: MapCanvasProps) {
	const mapModel = useMemo(() => {
		const worldTopo = countries110 as unknown as CountriesTopology;
		const worldFeatures = feature(worldTopo, worldTopo.objects.countries) as FeatureCollection<
			Geometry,
			GeoJsonProperties
		>;

		const projection = geoNaturalEarth1().fitExtent(
			[
				[12, 12],
				[MAP_WIDTH - 12, MAP_HEIGHT - 12],
			],
			worldFeatures,
		);
		const pathGenerator = geoPath(projection);

		const countries = worldFeatures.features
			.map((entry, index) => ({
				id: String(
					(entry.properties as Record<string, unknown> | undefined)?.name ?? `country-${index}`,
				),
				d: pathGenerator(entry),
			}))
			.filter((entry): entry is { id: string; d: string } => typeof entry.d === "string");

		const graticulePath = pathGenerator(geoGraticule10()) ?? "";

		const markers = events.reduce<MarkerPoint[]>((accumulator, event) => {
			const firstCoordinate = event.coordinates?.[0];
			if (!firstCoordinate) {
				return accumulator;
			}
			const projected = projection([firstCoordinate.lng, firstCoordinate.lat]);
			if (!projected) {
				return accumulator;
			}
			accumulator.push({
				id: event.id,
				symbol: event.symbol,
				shortLabel: event.symbol.slice(0, 2).toUpperCase(),
				x: projected[0],
				y: projected[1],
				severity: Number(event.severity),
				title: event.title,
			});
			return accumulator;
		}, []);

		const drawingPaths = drawings.map((drawing) => {
			const projected = drawing.points
				.map((point) => projection([point.lng, point.lat]))
				.filter((point): point is [number, number] => Array.isArray(point) && point.length === 2);
			return {
				...drawing,
				projected,
			};
		});

		return {
			projection,
			countries,
			graticulePath,
			markers,
			drawingPaths,
		};
	}, [drawings, events]);

	const handleBackgroundClick = (event: MouseEvent<SVGSVGElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const normalizedX = ((event.clientX - rect.left) / rect.width) * MAP_WIDTH;
		const normalizedY = ((event.clientY - rect.top) / rect.height) * MAP_HEIGHT;
		const invert = mapModel.projection.invert;
		if (!invert) {
			return;
		}
		const inverted = invert([normalizedX, normalizedY]);
		if (!inverted) {
			return;
		}
		const [lng, lat] = inverted;
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
			return;
		}
		if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
			return;
		}
		onMapClick({
			lat: Number(lat.toFixed(6)),
			lng: Number(lng.toFixed(6)),
		});
	};

	return (
		<div className="h-full w-full rounded-lg border border-border bg-slate-950/50 p-2">
			<svg
				viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
				className="h-full w-full rounded-md"
				role="img"
				aria-label="Geopolitical map canvas"
				onClick={handleBackgroundClick}
			>
				<rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="#020617" />
				{showRegionLayer && (
					<path
						d={mapModel.graticulePath}
						fill="none"
						stroke="#334155"
						strokeWidth={0.65}
						opacity={0.45}
					/>
				)}

				{showRegionLayer &&
					mapModel.countries.map((country: { id: string; d: string }) => (
						<path
							key={country.id}
							d={country.d}
							fill="#0f172a"
							stroke="#334155"
							strokeWidth={0.55}
							opacity={0.9}
							role="button"
							tabIndex={onCountryClick ? 0 : -1}
							aria-label={`Country ${country.id}`}
							onClick={(event) => {
								if (!onCountryClick) return;
								event.stopPropagation();
								onCountryClick(country.id);
							}}
							onKeyDown={(event) => {
								if (!onCountryClick) return;
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									onCountryClick(country.id);
								}
							}}
						/>
					))}

				{mapModel.drawingPaths.map((drawing) => {
					const selected = selectedDrawingId === drawing.id;
					const color = drawing.color || "#22d3ee";

					if (drawing.type === "line" && drawing.projected.length >= 2) {
						const points = drawing.projected.map((entry) => `${entry[0]},${entry[1]}`).join(" ");
						return (
							<polyline
								key={drawing.id}
								points={points}
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
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										onSelectDrawing(drawing.id);
									}
								}}
							/>
						);
					}

					if (drawing.type === "polygon" && drawing.projected.length >= 3) {
						const points = drawing.projected.map((entry) => `${entry[0]},${entry[1]}`).join(" ");
						return (
							<polygon
								key={drawing.id}
								points={points}
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
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										onSelectDrawing(drawing.id);
									}
								}}
							/>
						);
					}

					if (drawing.type === "text" && drawing.projected.length >= 1) {
						const anchor = drawing.projected[0];
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
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										onSelectDrawing(drawing.id);
									}
								}}
							>
								{drawing.label || "Text"}
							</text>
						);
					}

					return null;
				})}

				{mapModel.markers.map((marker) => {
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
								onSelectEvent(marker.id);
							}}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									onSelectEvent(marker.id);
								}
							}}
							className="cursor-pointer"
						>
							{selected && (
								<circle r={16} fill="none" stroke="#f8fafc" strokeWidth={1.5} opacity={0.8} />
							)}
							<circle r={11} fill={markerColor} stroke="#020617" strokeWidth={2} />
							<text
								y={3}
								textAnchor="middle"
								fill="#f8fafc"
								fontSize={8}
								fontWeight={700}
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
