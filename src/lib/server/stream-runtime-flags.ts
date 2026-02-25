function parseBoolEnv(value: string | undefined): boolean | null {
	if (typeof value !== "string") return null;
	const normalized = value.trim().toLowerCase();
	if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
		return true;
	}
	if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
		return false;
	}
	return null;
}

function assertProdLegacyStreamFallbackAllowed(scope: "candle" | "quotes") {
	if (process.env.NODE_ENV !== "production") return;
	const override = parseBoolEnv(process.env.ALLOW_PROD_MARKET_STREAM_LEGACY_FALLBACK);
	if (override === true) return;
	throw new Error(
		`Legacy market stream fallback (${scope}) must remain disabled by default in production. Set ALLOW_PROD_MARKET_STREAM_LEGACY_FALLBACK=true only for an explicit emergency override.`,
	);
}

function resolveLegacyStreamFallbackFlag(envKey: string, scope: "candle" | "quotes"): boolean {
	const explicit = parseBoolEnv(process.env[envKey]);
	if (explicit === null) {
		// Transitional default stays enabled until full Go-SSE coverage + live verify are complete.
		return true;
	}
	if (explicit) {
		assertProdLegacyStreamFallbackAllowed(scope);
	}
	return explicit;
}

export function isLegacyCandleStreamFallbackEnabled(): boolean {
	return resolveLegacyStreamFallbackFlag("MARKET_STREAM_LEGACY_FALLBACK_ENABLED", "candle");
}

export function isLegacyQuotesStreamFallbackEnabled(): boolean {
	return resolveLegacyStreamFallbackFlag("MARKET_STREAM_QUOTES_LEGACY_FALLBACK_ENABLED", "quotes");
}
