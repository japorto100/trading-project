import type { CompositeSignalRouteComponent } from "./types";

export function componentScore(
	components: Record<string, CompositeSignalRouteComponent> | undefined,
	key: string,
): number | null {
	const score = components?.[key]?.score;
	return typeof score === "number" && Number.isFinite(score) ? score : null;
}

export function formatPrice(price: number): string {
	if (price < 0.01) return price.toFixed(6);
	if (price < 1) return price.toFixed(4);
	if (price < 100) return price.toFixed(2);
	return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatVolume(volume: number): string {
	if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
	if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
	if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
	return volume.toString();
}
