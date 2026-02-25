export type GeoInertiaDragFn = (...args: unknown[]) => unknown;
export type GeoVoronoiFactoryFn = (...args: unknown[]) => unknown;

export async function loadGeoInertiaDrag(): Promise<GeoInertiaDragFn | null> {
	try {
		const module = await import("d3-inertia");
		return typeof module.geoInertiaDrag === "function" ? module.geoInertiaDrag : null;
	} catch {
		return null;
	}
}

export async function loadGeoVoronoiFactory(): Promise<GeoVoronoiFactoryFn | null> {
	try {
		const module = await import("d3-geo-voronoi");
		return typeof module.geoVoronoi === "function" ? module.geoVoronoi : null;
	} catch {
		return null;
	}
}
