import { type RefObject, useEffect } from "react";
import {
	GEO_MAP_HEIGHT,
	GEO_MAP_WIDTH,
	type GeoMapProjectionModel,
} from "@/features/geopolitical/rendering/useGeoMapProjectionModel";

interface UseGeoMapCanvasBodyPointLayersStageParams {
	canvasRef: RefObject<HTMLCanvasElement | null>;
	enabled: boolean;
	bodyPointLayers: GeoMapProjectionModel["bodyPointLayers"];
}

export function useGeoMapCanvasBodyPointLayersStage({
	canvasRef,
	enabled,
	bodyPointLayers,
}: UseGeoMapCanvasBodyPointLayersStageParams) {
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

		if (!enabled) return;

		for (const layer of bodyPointLayers) {
			if ((layer.rendererHint ?? "svg") !== "canvas") continue;
			if (layer.renderStage && layer.renderStage !== "body-point-layers") continue;

			for (const point of layer.points) {
				if (!point.visible) continue;

				context.save();

				context.globalAlpha = point.haloOpacity;
				context.fillStyle = point.fill;
				context.beginPath();
				context.arc(point.x, point.y, point.haloRadius, 0, Math.PI * 2);
				context.fill();

				context.globalAlpha = 1;
				context.fillStyle = point.fill;
				context.strokeStyle = point.stroke;
				context.lineWidth = point.strokeWidth;
				context.beginPath();
				context.arc(point.x, point.y, point.coreRadius, 0, Math.PI * 2);
				context.fill();
				context.stroke();

				context.restore();
			}
		}
	}, [bodyPointLayers, canvasRef, enabled]);
}
