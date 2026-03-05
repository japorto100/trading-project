/**
 * Next.js instrumentation — runs once when the server starts.
 * Prod-Guard (1.16): Fail-closed if AUTH_STACK_BYPASS is enabled in production
 * without explicit ALLOW_PROD_AUTH_STACK_BYPASS override.
 * Phase 0e: OTel tracing via @vercel/otel (opt-in, OTEL_ENABLED=true).
 */
export async function register() {
	// --- Phase 0e: OpenTelemetry (opt-in) ---
	if (process.env.OTEL_ENABLED === "true") {
		const { registerOTel } = await import("@vercel/otel");
		registerOTel({ serviceName: "tradeview-next" });
	}

	// --- Prod-Guard: Auth stack bypass check ---
	if (process.env.NODE_ENV !== "production") return;

	const publicBypass = process.env.NEXT_PUBLIC_AUTH_STACK_BYPASS;
	const serverBypass = process.env.AUTH_STACK_BYPASS;
	const bypassEnabled =
		(typeof publicBypass === "string" && publicBypass.trim().toLowerCase() === "true") ||
		(typeof serverBypass === "string" && serverBypass.trim().toLowerCase() === "true");

	if (!bypassEnabled) return;

	const allowProd = (process.env.ALLOW_PROD_AUTH_STACK_BYPASS ?? "").trim().toLowerCase();
	if (allowProd === "true") return;

	throw new Error(
		"AUTH_STACK_BYPASS/NEXT_PUBLIC_AUTH_STACK_BYPASS must remain disabled in production (set ALLOW_PROD_AUTH_STACK_BYPASS=true only for explicit emergency override).",
	);
}
