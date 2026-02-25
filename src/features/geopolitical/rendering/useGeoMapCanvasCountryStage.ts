import { type RefObject, useEffect } from "react";
import {
	GEO_MAP_HEIGHT,
	GEO_MAP_WIDTH,
	type GeoMapProjectionModel,
} from "@/features/geopolitical/rendering/useGeoMapProjectionModel";

interface CountryCanvasStyle {
	fill: string;
	stroke: string;
	opacity: number;
}

interface UseGeoMapCanvasCountryStageParams {
	canvasRef: RefObject<HTMLCanvasElement | null>;
	enabled: boolean;
	countries: GeoMapProjectionModel["countries"];
	showHeatmap: boolean;
	choroplethMode: "severity" | "regime";
	resolveCountryStyle: (
		country: GeoMapProjectionModel["countries"][number],
		showHeatmap: boolean,
		mode: "severity" | "regime",
	) => CountryCanvasStyle;
}

export function useGeoMapCanvasCountryStage({
	canvasRef,
	enabled,
	countries,
	showHeatmap,
	choroplethMode,
	resolveCountryStyle,
}: UseGeoMapCanvasCountryStageParams) {
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const dpr = typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
		canvas.width = Math.round(GEO_MAP_WIDTH * dpr);
		canvas.height = Math.round(GEO_MAP_HEIGHT * dpr);

		const context = canvas.getContext("2d");
		if (!context) return;

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.scale(dpr, dpr);
		context.clearRect(0, 0, GEO_MAP_WIDTH, GEO_MAP_HEIGHT);

		if (!enabled) {
			return;
		}

		for (const country of countries) {
			if (!country.d) continue;
			const style = resolveCountryStyle(country, showHeatmap, choroplethMode);
			const path = new Path2D(country.d);

			context.save();
			context.globalAlpha = style.opacity;
			context.fillStyle = style.fill;
			context.strokeStyle = style.stroke;
			context.lineWidth = 0.55;
			context.fill(path);
			context.stroke(path);
			context.restore();
		}
	}, [canvasRef, choroplethMode, countries, enabled, resolveCountryStyle, showHeatmap]);
}
