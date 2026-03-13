"use client";

export interface GeoViewportFocusInput {
	lat: number;
	lng: number;
	currentScale: number;
	initialScale: number;
	maxScaleMultiplier?: number;
	minSelectionScaleMultiplier?: number;
}

export interface GeoViewportFocusTarget {
	rotation: [number, number, number];
	scale: number;
}

export function buildGeoViewportFocusTarget({
	lat,
	lng,
	currentScale,
	initialScale,
	maxScaleMultiplier = 10,
	minSelectionScaleMultiplier = 1.25,
}: GeoViewportFocusInput): GeoViewportFocusTarget | null {
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
		return null;
	}

	const clampedLat = Math.max(-85, Math.min(85, lat));
	const safeInitialScale = Number.isFinite(initialScale) && initialScale > 0 ? initialScale : 1;
	const safeCurrentScale =
		Number.isFinite(currentScale) && currentScale > 0 ? currentScale : safeInitialScale;
	const targetScaleFloor = safeInitialScale * minSelectionScaleMultiplier;
	const targetScaleCeiling = safeInitialScale * maxScaleMultiplier;

	return {
		rotation: [-lng, -clampedLat, 0],
		scale: Math.max(targetScaleFloor, Math.min(targetScaleCeiling, safeCurrentScale * 1.15)),
	};
}
