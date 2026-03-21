"use client";

import {
	Cartesian3,
	type Viewer as CesiumViewerType,
	Color,
	EllipsoidTerrainProvider,
	OpenStreetMapImageryProvider,
} from "cesium";
import { useMemo, useRef } from "react";
import {
	CameraFlyTo,
	Entity,
	ImageryLayer,
	LabelGraphics,
	PointGraphics,
	PolylineGraphics,
	Viewer,
} from "resium";

const cesiumGlobal = globalThis as typeof globalThis & { CESIUM_BASE_URL?: string };
cesiumGlobal.CESIUM_BASE_URL = "/cesium";

const scenePoints = [
	{
		id: "suez",
		label: "Suez pressure",
		position: Cartesian3.fromDegrees(32.55, 30.02, 0),
		color: Color.fromCssColorString("#22d3ee"),
	},
	{
		id: "taiwan",
		label: "Taiwan corridor",
		position: Cartesian3.fromDegrees(121.56, 25.03, 0),
		color: Color.fromCssColorString("#f97316"),
	},
	{
		id: "gulf",
		label: "Gulf energy lane",
		position: Cartesian3.fromDegrees(51.39, 25.28, 0),
		color: Color.fromCssColorString("#a855f7"),
	},
];

export function GeoMapCesiumSceneClient() {
	const viewerRef = useRef<CesiumViewerType | null>(null);

	const imageryProvider = useMemo(
		() => new OpenStreetMapImageryProvider({ url: "https://tile.openstreetmap.org/" }),
		[],
	);
	const terrainProvider = useMemo(() => new EllipsoidTerrainProvider(), []);
	const corridorPositions = useMemo(
		() => [
			Cartesian3.fromDegrees(32.55, 30.02, 80000),
			Cartesian3.fromDegrees(51.39, 25.28, 120000),
			Cartesian3.fromDegrees(121.56, 25.03, 80000),
		],
		[],
	);

	return (
		<div className="relative h-[34rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30">
			<div className="pointer-events-none absolute left-4 top-4 z-20 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-slate-100 backdrop-blur">
				<p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
					Cesium sidecar preview
				</p>
				<p>Scene-focused experiment for terrain/camera/orbital-style workflows.</p>
			</div>

			<Viewer
				ref={(viewer) => {
					viewerRef.current = viewer?.cesiumElement ?? null;
				}}
				full
				timeline={false}
				animation={false}
				baseLayerPicker={false}
				geocoder={false}
				homeButton={false}
				infoBox={false}
				navigationHelpButton={false}
				selectionIndicator={false}
				sceneModePicker
				fullscreenButton={false}
				terrainProvider={terrainProvider}
			>
				<ImageryLayer imageryProvider={imageryProvider} />
				<CameraFlyTo destination={Cartesian3.fromDegrees(51.39, 28.0, 22000000)} duration={0} />

				{scenePoints.map((point) => (
					<Entity key={point.id} name={point.label} position={point.position}>
						<PointGraphics
							pixelSize={12}
							color={point.color}
							outlineColor={Color.BLACK}
							outlineWidth={2}
						/>
						<LabelGraphics
							text={point.label}
							fillColor={Color.WHITE}
							outlineColor={Color.BLACK}
							outlineWidth={3}
							showBackground
							backgroundColor={Color.fromCssColorString("#020617").withAlpha(0.7)}
							scale={0.55}
						/>
					</Entity>
				))}

				<Entity name="Analyst corridor">
					<PolylineGraphics
						positions={corridorPositions}
						width={3}
						material={Color.fromCssColorString("#22d3ee").withAlpha(0.75)}
						clampToGround={false}
					/>
				</Entity>
			</Viewer>
		</div>
	);
}
