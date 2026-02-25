declare module "d3-inertia" {
	export function geoInertiaDrag(...args: unknown[]): unknown;
}

declare module "d3-geo-voronoi" {
	export interface GeoDelaunayLike {
		find(lon: number, lat: number, node?: number): number;
	}

	export function geoDelaunay(data: Array<[number, number]>): GeoDelaunayLike;
	export function geoVoronoi(...args: unknown[]): unknown;
}
