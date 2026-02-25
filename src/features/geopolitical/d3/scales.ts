import { interpolateRgb } from "d3-interpolate";
import { scaleLinear, scaleSequential, scaleThreshold } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";

const BASE_LAND_FILL = "#1e293b";
const BASE_LAND_STROKE = "#334155";

const markerSeverityColorScale = scaleThreshold<number, string>()
	.domain([2, 3, 4, 5])
	.range(["#38bdf8", "#22c55e", "#f59e0b", "#f97316", "#dc2626"]);

export interface CountryVisualStyle {
	fill: string;
	stroke: string;
	opacity: number;
}

export type CountryRegimeState = "calm" | "watch" | "escalating" | "critical";

export interface CountryStyleMetrics {
	intensity: number;
	eventCount: number;
	maxSeverity: number;
	regimeState: CountryRegimeState;
}

export interface SoftSignalVisualStyle {
	pulseOpacity: number;
	coreOpacity: number;
}

function normalizeCandidateConfidence(confidence: number): number {
	if (!Number.isFinite(confidence)) return 0;
	if (confidence <= 1) return Math.max(0, confidence);
	return Math.max(0, Math.min(1, confidence / 5));
}

export function createCountryStyleResolver(maxCountryIntensity: number) {
	const safeMax = Math.max(1, maxCountryIntensity);
	const heatColor = scaleSequential(interpolateYlOrRd).domain([0, safeMax]).clamp(true);
	const heatOpacity = scaleLinear<number, number>()
		.domain([0, safeMax])
		.range([0.82, 1])
		.clamp(true);
	const mixIntoDarkBase = interpolateRgb(BASE_LAND_FILL, "#fef3c7");
	const regimeFill: Record<CountryRegimeState, string> = {
		calm: "#1e293b",
		watch: "#0f766e",
		escalating: "#b45309",
		critical: "#7f1d1d",
	};
	const regimeStroke: Record<CountryRegimeState, string> = {
		calm: "#334155",
		watch: "#14b8a6",
		escalating: "#f59e0b",
		critical: "#ef4444",
	};

	return (
		metrics: CountryStyleMetrics,
		enabled: boolean,
		mode: "severity" | "regime",
	): CountryVisualStyle => {
		if (mode === "regime") {
			if (!enabled) {
				return {
					fill: BASE_LAND_FILL,
					stroke: BASE_LAND_STROKE,
					opacity: 0.8,
				};
			}
			const state = metrics.regimeState;
			return {
				fill: regimeFill[state],
				stroke: regimeStroke[state],
				opacity: state === "calm" ? 0.84 : 0.94,
			};
		}

		const intensity = metrics.intensity;
		if (!enabled || intensity <= 0) {
			return {
				fill: BASE_LAND_FILL,
				stroke: BASE_LAND_STROKE,
				opacity: 0.8,
			};
		}

		const heatHex = heatColor(intensity);
		const blend = Math.min(1, intensity / safeMax);
		return {
			fill: interpolateRgb(mixIntoDarkBase(0.15 + blend * 0.85), heatHex)(0.6),
			stroke: BASE_LAND_STROKE,
			opacity: heatOpacity(intensity),
		};
	};
}

export function getMarkerSeverityColor(severity: number): string {
	return markerSeverityColorScale(Number.isFinite(severity) ? severity : 1);
}

export function getSoftSignalVisualStyle(confidence: number): SoftSignalVisualStyle {
	const normalized = normalizeCandidateConfidence(confidence);
	const pulseOpacityScale = scaleLinear<number, number>()
		.domain([0, 1])
		.range([0.18, 0.42])
		.clamp(true);
	const coreOpacityScale = scaleLinear<number, number>()
		.domain([0, 1])
		.range([0.65, 1])
		.clamp(true);

	return {
		pulseOpacity: pulseOpacityScale(normalized),
		coreOpacity: coreOpacityScale(normalized),
	};
}
