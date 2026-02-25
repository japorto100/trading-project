import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { useMemo } from "react";
import { getGeoMapBodyBasemapFeatures } from "@/features/geopolitical/bodies";
import type { CountryRegimeState } from "@/features/geopolitical/d3/scales";
import { getRenderableBodyPointLayers } from "@/features/geopolitical/layers/bodyPointLayerCatalog";
import type { BodyPointLayerPoint } from "@/features/geopolitical/layers/bodyPointLayers";
import type { GeoMapBody } from "@/features/geopolitical/store";
import type { GeoCandidate, GeoDrawing, GeoEvent } from "@/lib/geopolitical/types";

export const GEO_MAP_WIDTH = 1200;
export const GEO_MAP_HEIGHT = 620;
export const GEO_MAP_INITIAL_SCALE = 300;

export interface GeoMapMarkerPoint {
	id: string;
	symbol: string;
	shortLabel: string;
	lat: number;
	lng: number;
	x: number;
	y: number;
	severity: number;
	title: string;
	visible: boolean;
	raw: GeoEvent;
}

export interface GeoMapProjectionModel {
	projection: ReturnType<typeof geoOrthographic>;
	countries: Array<{
		id: string;
		d: string;
		intensity: number;
		eventCount: number;
		maxSeverity: number;
		regimeState: CountryRegimeState;
	}>;
	graticulePath: string;
	spherePath: string;
	markers: GeoMapMarkerPoint[];
	softSignals: Array<{ id: string; x: number; y: number; confidence: number; visible: boolean }>;
	drawingPaths: Array<
		GeoDrawing & {
			projected: [number, number][];
			geoPathString: string;
		}
	>;
	bodyPointLayers: Array<{
		id: string;
		name: string;
		body: GeoMapBody;
		renderStage?: "body-point-layers";
		rendererHint?: "svg" | "canvas";
		points: Array<
			BodyPointLayerPoint & {
				x: number;
				y: number;
				visible: boolean;
			}
		>;
	}>;
}

function getCandidateCoordinate(candidate: GeoCandidate): { lat: number; lng: number } | null {
	const candidateWithCoordinates = candidate as GeoCandidate & {
		coordinates?: Array<{ lat: number; lng: number }>;
	};
	const point = candidateWithCoordinates.coordinates?.[0];
	if (!point) return null;
	if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;
	return point;
}

function deriveCountryRegimeState(params: {
	intensity: number;
	eventCount: number;
	maxSeverity: number;
}): CountryRegimeState {
	const { intensity, eventCount, maxSeverity } = params;
	if (intensity <= 0 || eventCount <= 0) return "calm";
	if (maxSeverity >= 5 || intensity >= 14) return "critical";
	if (maxSeverity >= 4 || intensity >= 8 || eventCount >= 4) return "escalating";
	return "watch";
}

function normalizeCountryKey(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, " ")
		.replace(/\b(the|of|and)\b/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

const COUNTRY_NAME_ALIAS_OVERRIDES: Record<string, string[]> = {
	us: ["united states", "united states of america", "usa"],
	gb: ["united kingdom", "great britain", "united kingdom of great britain and northern ireland"],
	ru: ["russia", "russian federation"],
	ir: ["iran", "iran islamic republic of"],
	kr: ["south korea", "republic of korea", "korea republic of"],
	kp: [
		"north korea",
		"democratic peoples republic of korea",
		"korea democratic peoples republic of",
	],
	la: ["laos", "lao peoples democratic republic"],
	ve: ["venezuela", "venezuela bolivarian republic of"],
	bo: ["bolivia", "bolivia plurinational state of"],
	tz: ["tanzania", "tanzania united republic of"],
	md: ["moldova", "moldova republic of"],
	cz: ["czech republic", "czechia"],
	sy: ["syria", "syrian arab republic"],
	ps: ["palestine", "palestinian territories", "state of palestine"],
	cd: ["dr congo", "democratic republic of the congo", "congo democratic republic of the"],
	cg: ["republic of the congo", "congo", "congo republic of the"],
	ci: ["cote divoire", "cote d ivoire", "ivory coast"],
};

function getDisplayNameAliasesForCountryCode(code: string): string[] {
	const normalizedCode = code.trim().toUpperCase();
	if (!normalizedCode) return [];
	const aliases = new Set<string>();
	if (normalizedCode.length === 2 && typeof Intl !== "undefined" && "DisplayNames" in Intl) {
		try {
			const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
			const displayName = regionNames.of(normalizedCode);
			if (displayName) aliases.add(normalizeCountryKey(displayName));
		} catch {
			// Intl.DisplayNames is optional; fall back to static aliases only.
		}
	}
	for (const alias of COUNTRY_NAME_ALIAS_OVERRIDES[normalizedCode.toLowerCase()] ?? []) {
		aliases.add(normalizeCountryKey(alias));
	}
	return [...aliases].filter(Boolean);
}

function buildCountryFeatureLookup(
	features: GeoMapProjectionModel["countries"],
): Map<string, string> {
	const lookup = new Map<string, string>();
	for (const feature of features) {
		const aliasCandidates = new Set<string>([normalizeCountryKey(feature.id)]);
		for (const part of feature.id.split(/[(),/]/g)) {
			const normalized = normalizeCountryKey(part);
			if (normalized) aliasCandidates.add(normalized);
		}

		for (const alias of aliasCandidates) {
			if (!lookup.has(alias)) {
				lookup.set(alias, feature.id);
			}
		}
	}
	return lookup;
}

interface UseGeoMapProjectionModelParams {
	mapBody: GeoMapBody;
	events: GeoEvent[];
	candidates: GeoCandidate[];
	drawings: GeoDrawing[];
	bodyPointLayerVisibility?: Partial<Record<string, boolean>>;
	rotation: [number, number, number];
	scale: number;
}

export function useGeoMapProjectionModel({
	mapBody,
	events,
	candidates,
	drawings,
	bodyPointLayerVisibility,
	rotation,
	scale,
}: UseGeoMapProjectionModelParams): GeoMapProjectionModel {
	return useMemo(() => {
		const worldFeatures = getGeoMapBodyBasemapFeatures(mapBody);

		const projection = geoOrthographic()
			.scale(scale)
			.translate([GEO_MAP_WIDTH / 2, GEO_MAP_HEIGHT / 2])
			.rotate(rotation)
			.clipAngle(90);

		const pathGenerator = geoPath(projection);

		const countries = worldFeatures.features
			.map((entry, index) => {
				const name = (entry.properties as Record<string, unknown> | undefined)?.name as
					| string
					| undefined;
				return {
					id: name ?? `country-${index}`,
					d: pathGenerator(entry),
					intensity: 0,
					eventCount: 0,
					maxSeverity: 0,
					regimeState: deriveCountryRegimeState({
						intensity: 0,
						eventCount: 0,
						maxSeverity: 0,
					}),
				};
			})
			.filter(
				(entry): entry is GeoMapProjectionModel["countries"][number] => typeof entry.d === "string",
			);

		const countryFeatureLookup = buildCountryFeatureLookup(countries);
		const countryMetricsById = new Map<
			string,
			{ intensity: number; eventCount: number; maxSeverity: number }
		>();

		for (const event of events) {
			const severity = Number(event.severity);
			for (const countryCodeOrName of event.countryCodes) {
				const directKey = countryFeatureLookup.get(normalizeCountryKey(countryCodeOrName));
				const aliasKey =
					directKey ??
					getDisplayNameAliasesForCountryCode(countryCodeOrName)
						.map((alias) => countryFeatureLookup.get(alias))
						.find((value): value is string => Boolean(value));
				if (!aliasKey) continue;

				const previous = countryMetricsById.get(aliasKey) ?? {
					intensity: 0,
					eventCount: 0,
					maxSeverity: 0,
				};
				countryMetricsById.set(aliasKey, {
					intensity: previous.intensity + severity,
					eventCount: previous.eventCount + 1,
					maxSeverity: Math.max(previous.maxSeverity, severity),
				});
			}
		}

		for (const country of countries) {
			const metrics = countryMetricsById.get(country.id);
			if (!metrics) continue;
			country.intensity = metrics.intensity;
			country.eventCount = metrics.eventCount;
			country.maxSeverity = metrics.maxSeverity;
			country.regimeState = deriveCountryRegimeState(metrics);
		}

		const graticulePath = pathGenerator(geoGraticule10()) ?? "";
		const spherePath = pathGenerator({ type: "Sphere" }) ?? "";

		const markers = events.reduce<GeoMapMarkerPoint[]>((accumulator, event) => {
			const firstCoordinate = event.coordinates?.[0];
			if (!firstCoordinate) return accumulator;

			const projected = projection([firstCoordinate.lng, firstCoordinate.lat]);
			if (!projected) return accumulator;

			const visible =
				pathGenerator({
					type: "Point",
					coordinates: [firstCoordinate.lng, firstCoordinate.lat],
				}) !== null;

			accumulator.push({
				id: event.id,
				symbol: event.symbol,
				shortLabel: event.symbol.slice(0, 2).toUpperCase(),
				lat: firstCoordinate.lat,
				lng: firstCoordinate.lng,
				x: projected[0],
				y: projected[1],
				severity: Number(event.severity),
				title: event.title,
				visible,
				raw: event,
			});
			return accumulator;
		}, []);

		const softSignals = candidates.reduce<
			Array<{ id: string; x: number; y: number; confidence: number; visible: boolean }>
		>((acc, cand) => {
			const candidatePoint = getCandidateCoordinate(cand);
			if (!candidatePoint) return acc;
			const projected = projection([candidatePoint.lng, candidatePoint.lat]);
			if (!projected) return acc;

			const visible =
				pathGenerator({
					type: "Point",
					coordinates: [candidatePoint.lng, candidatePoint.lat],
				}) !== null;

			acc.push({
				id: cand.id,
				x: projected[0],
				y: projected[1],
				confidence: cand.confidence,
				visible,
			});
			return acc;
		}, []);

		const drawingPaths = drawings.map((drawing) => {
			const projected = drawing.points
				.map((point) => projection([point.lng, point.lat]))
				.filter((point): point is [number, number] => Array.isArray(point) && point.length === 2);

			let geoPathString = "";
			if (drawing.type === "line") {
				geoPathString =
					pathGenerator({
						type: "LineString",
						coordinates: drawing.points.map((p) => [p.lng, p.lat]),
					}) ?? "";
			} else if (drawing.type === "polygon") {
				geoPathString =
					pathGenerator({
						type: "Polygon",
						coordinates: [drawing.points.map((p) => [p.lng, p.lat])],
					}) ?? "";
			}

			return {
				...drawing,
				projected,
				geoPathString,
			};
		});

		const bodyPointLayers = getRenderableBodyPointLayers(mapBody, bodyPointLayerVisibility).map(
			(layer) => ({
				...layer,
				points: layer.points.map((point) => {
					const projected = projection([point.lng, point.lat]);
					if (!projected) {
						return { ...point, x: 0, y: 0, visible: false };
					}

					const visible =
						pathGenerator({
							type: "Point",
							coordinates: [point.lng, point.lat],
						}) !== null;

					return {
						...point,
						x: projected[0],
						y: projected[1],
						visible,
					};
				}),
			}),
		);

		return {
			projection,
			countries,
			graticulePath,
			spherePath,
			markers,
			softSignals,
			drawingPaths,
			bodyPointLayers,
		};
	}, [bodyPointLayerVisibility, candidates, drawings, events, mapBody, rotation, scale]);
}
