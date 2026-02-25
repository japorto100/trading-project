type AppRole = "viewer" | "analyst" | "trader" | "admin";

function normalizeAppRole(value: unknown): AppRole {
	if (typeof value !== "string") return "viewer";
	const role = value.trim().toLowerCase();
	if (role === "analyst" || role === "trader" || role === "admin") {
		return role;
	}
	return "viewer";
}

function assertAuthBypassAllowedInRuntime() {
	if (process.env.NODE_ENV !== "production") return;
	if ((process.env.ALLOW_PROD_AUTH_STACK_BYPASS ?? "").trim().toLowerCase() === "true") return;
	throw new Error(
		"AUTH_STACK_BYPASS/NEXT_PUBLIC_AUTH_STACK_BYPASS must remain disabled in production (set ALLOW_PROD_AUTH_STACK_BYPASS=true only for explicit emergency override).",
	);
}

export function isAuthStackBypassEnabled(): boolean {
	const publicBypass = process.env.NEXT_PUBLIC_AUTH_STACK_BYPASS;
	if (typeof publicBypass === "string" && publicBypass.trim().toLowerCase() === "true") {
		assertAuthBypassAllowedInRuntime();
		return true;
	}
	const serverBypass = process.env.AUTH_STACK_BYPASS;
	if (typeof serverBypass === "string" && serverBypass.trim().toLowerCase() === "true") {
		assertAuthBypassAllowedInRuntime();
		return true;
	}
	return false;
}

export function isAuthEnabled(): boolean {
	if (isAuthStackBypassEnabled()) {
		return false;
	}
	return process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";
}

export function isPasskeyProviderEnabled(): boolean {
	const raw = process.env.AUTH_PASSKEY_PROVIDER_ENABLED?.trim().toLowerCase();
	if (raw === "false") return false;
	if (raw === "true") return true;
	return true;
}

export function getAuthBypassRole(): AppRole {
	return normalizeAppRole(
		process.env.NEXT_PUBLIC_AUTH_BYPASS_ROLE ?? process.env.AUTH_BYPASS_ROLE ?? "admin",
	);
}
