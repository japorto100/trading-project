import type { BodyPointLayer } from "@/features/geopolitical/layers/bodyPointLayerTypes";
import { getEarthPointLayers } from "@/features/geopolitical/layers/earthPointLayers";
import { getMoonPointLayers } from "@/features/geopolitical/layers/moonPointLayers";
import type { GeoMapBody } from "@/features/geopolitical/store";

export type {
	BodyPointLayer,
	BodyPointLayerPoint,
} from "@/features/geopolitical/layers/bodyPointLayerTypes";

export function getBodyPointLayers(body: GeoMapBody): BodyPointLayer[] {
	if (body === "moon") {
		return getMoonPointLayers();
	}
	return getEarthPointLayers();
}
