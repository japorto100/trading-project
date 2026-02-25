import { useEffect } from "react";
import type { GeoMapBodyVisualConfig } from "@/features/geopolitical/bodies";
import {
	GEO_MAP_HEIGHT,
	GEO_MAP_WIDTH,
	type GeoMapProjectionModel,
} from "@/features/geopolitical/rendering/useGeoMapProjectionModel";

interface UseGeoMapCanvasBasemapStageParams {
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	enabled: boolean;
	bodyVisualConfig: GeoMapBodyVisualConfig;
	mapModel: Pick<GeoMapProjectionModel, "spherePath" | "graticulePath">;
	showRegionLayer: boolean;
}

export function useGeoMapCanvasBasemapStage({
	canvasRef,
	enabled,
	bodyVisualConfig,
	mapModel,
	showRegionLayer,
}: UseGeoMapCanvasBasemapStageParams) {
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

		if (!enabled || !mapModel.spherePath) {
			return;
		}

		const spherePath = new Path2D(mapModel.spherePath);

		const sphereGradient = context.createRadialGradient(
			GEO_MAP_WIDTH * 0.5,
			GEO_MAP_HEIGHT * 0.5,
			8,
			GEO_MAP_WIDTH * 0.5,
			GEO_MAP_HEIGHT * 0.5,
			Math.min(GEO_MAP_WIDTH, GEO_MAP_HEIGHT) * 0.42,
		);
		if (bodyVisualConfig.sphereGradientId === "moon-gradient") {
			sphereGradient.addColorStop(0, "#3f3f46");
			sphereGradient.addColorStop(0.58, "#27272a");
			sphereGradient.addColorStop(1, "#09090b");
		} else {
			sphereGradient.addColorStop(0, "#0f172a");
			sphereGradient.addColorStop(1, "#020617");
		}
		context.fillStyle = sphereGradient;
		context.fill(spherePath);

		context.save();
		context.strokeStyle = bodyVisualConfig.atmosphereStroke;
		context.globalAlpha = bodyVisualConfig.atmosphereOpacity;
		context.lineWidth = bodyVisualConfig.atmosphereStrokeWidth;
		context.shadowColor = bodyVisualConfig.atmosphereStroke;
		context.shadowBlur = bodyVisualConfig.id === "moon" ? 4 : 8;
		context.stroke(spherePath);
		context.restore();

		if (showRegionLayer && mapModel.graticulePath) {
			context.save();
			context.strokeStyle = bodyVisualConfig.graticuleStroke;
			context.globalAlpha = bodyVisualConfig.graticuleOpacity;
			context.lineWidth = 0.65;
			context.stroke(new Path2D(mapModel.graticulePath));
			context.restore();
		}

		if (bodyVisualConfig.cloudOverlayEnabled) {
			context.save();
			context.strokeStyle = bodyVisualConfig.cloudOverlayStroke;
			context.globalAlpha = bodyVisualConfig.cloudOverlayOpacity;
			context.lineWidth = 0.5;
			context.stroke(spherePath);
			context.restore();
		}
	}, [
		bodyVisualConfig,
		canvasRef,
		enabled,
		mapModel.graticulePath,
		mapModel.spherePath,
		showRegionLayer,
	]);
}
