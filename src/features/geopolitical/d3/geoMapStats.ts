import { max, mean } from "d3-array";
import { format } from "d3-format";
import { timeHour } from "d3-time";
import type { GeoMapMarkerCluster } from "@/features/geopolitical/rendering/useGeoMapMarkerClusters";
import type {
	GeoMapMarkerPoint,
	GeoMapProjectionModel,
} from "@/features/geopolitical/rendering/useGeoMapProjectionModel";
import type { GeoEvent } from "@/lib/geopolitical/types";

export interface GeoMapStatsSummary {
	visibleMarkersLabel: string;
	clusterLabel: string;
	avgSeverityLabel: string;
	maxCountryIntensityLabel: string;
	latestHourBucketLabel: string;
}

const formatCount = format(",d");
const formatOneDecimal = format(".1f");

function getLatestHourBucketCount(events: GeoEvent[]): number {
	const parsedDates = events
		.map((event) => new Date(event.validFrom ?? event.createdAt))
		.filter((date) => Number.isFinite(date.getTime()));
	if (parsedDates.length === 0) return 0;

	const latest = max(parsedDates);
	if (!latest) return 0;
	const bucketStart = timeHour.floor(latest);
	const bucketEnd = timeHour.offset(bucketStart, 1);
	return parsedDates.filter((date) => date >= bucketStart && date < bucketEnd).length;
}

export function buildGeoMapStatsSummary(params: {
	events: GeoEvent[];
	markers: GeoMapMarkerPoint[];
	clusters: GeoMapMarkerCluster[];
	countries: GeoMapProjectionModel["countries"];
}): GeoMapStatsSummary {
	const { events, markers, clusters, countries } = params;
	const visibleMarkers = markers.filter((marker) => marker.visible);
	const avgSeverity = mean(visibleMarkers, (marker) => marker.severity) ?? 0;
	const maxIntensity = max(countries, (country) => country.intensity) ?? 0;
	const latestHourBucketCount = getLatestHourBucketCount(events);

	return {
		visibleMarkersLabel: formatCount(visibleMarkers.length),
		clusterLabel: clusters.length > 0 ? formatCount(clusters.length) : "off",
		avgSeverityLabel: visibleMarkers.length > 0 ? formatOneDecimal(avgSeverity) : "n/a",
		maxCountryIntensityLabel: formatCount(maxIntensity),
		latestHourBucketLabel: formatCount(latestHourBucketCount),
	};
}
