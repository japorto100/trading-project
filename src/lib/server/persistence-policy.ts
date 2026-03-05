type PersistenceFallbackMode = "degraded" | "fail";

function normalizeMode(raw: string | undefined): PersistenceFallbackMode | null {
	if (!raw) return null;
	const value = raw.trim().toLowerCase();
	if (value === "degraded") return "degraded";
	if (value === "fail") return "fail";
	return null;
}

export function getPersistenceFallbackMode(): PersistenceFallbackMode {
	const explicit = normalizeMode(process.env.PERSISTENCE_FALLBACK_MODE);
	if (explicit) return explicit;

	// Safe default: fail-fast for production-like environments.
	return process.env.NODE_ENV === "production" ? "fail" : "degraded";
}

export function isPersistenceFallbackAllowed(): boolean {
	return getPersistenceFallbackMode() === "degraded";
}

export function assertPersistenceFallbackAllowed(reason: string): void {
	if (isPersistenceFallbackAllowed()) return;
	throw new Error(`${reason}. File fallback is disabled (PERSISTENCE_FALLBACK_MODE=fail).`);
}
