"use client";

import dynamic from "next/dynamic";

export const GeoMapCesiumScene = dynamic(
	() => import("./GeoMapCesiumSceneClient").then((module) => module.GeoMapCesiumSceneClient),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-[34rem] items-center justify-center rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,0.96),rgba(7,11,20,0.98))] text-sm text-slate-300">
				Loading Cesium scene experiment...
			</div>
		),
	},
);
