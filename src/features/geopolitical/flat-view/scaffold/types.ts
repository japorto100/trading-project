import type { getGeoFlatRelationLayerPolicy } from "@/features/geopolitical/flat-view/flat-view-relation-layer-policy";
import type { buildGeoFlatViewRendererContract } from "@/features/geopolitical/flat-view/flat-view-renderer-contract";
import type {
	GeoFlatLayerOptionId,
	GeoMapLayerFamily,
	getGeoMapFlatLayerOptionsByFamily,
} from "@/features/geopolitical/layer-taxonomy";
import type { GeoSelectionDetail } from "@/features/geopolitical/selection-detail";

export type FlatViewRendererContract = ReturnType<typeof buildGeoFlatViewRendererContract>;

export type FlatViewLayerOptionGroup = {
	family: GeoMapLayerFamily;
	familyLabel: string;
	options: ReturnType<typeof getGeoMapFlatLayerOptionsByFamily>;
};

export type FlatViewRelationLayerPolicyEntry = ReturnType<
	typeof getGeoFlatRelationLayerPolicy
>[number];

export type FlatViewSelectionDetail = GeoSelectionDetail;

export type FlatViewLayerOptionIdSet = ReadonlySet<GeoFlatLayerOptionId>;
