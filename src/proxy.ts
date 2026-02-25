import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
	getAuthBypassRole,
	isAuthEnabled,
	isAuthStackBypassEnabled,
} from "@/lib/auth/runtime-flags";

type AppRole = "viewer" | "analyst" | "trader" | "admin";
type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const ROLE_LEVEL: Record<AppRole, number> = {
	viewer: 1,
	analyst: 2,
	trader: 3,
	admin: 4,
};

const PUBLIC_API_PREFIXES = ["/api/auth", "/api/market/stream", "/api/geopolitical/stream"];
const REQUEST_ID_HEADER = "x-request-id";

const PROTECTED_ROLE_RULES: Array<{
	prefix: string;
	minRole: AppRole;
	methods?: HTTPMethod[];
}> = [
	// Next.js API routes (user-facing)
	{ prefix: "/api/fusion/orders", minRole: "trader", methods: ["POST", "PUT", "PATCH", "DELETE"] },
	{
		prefix: "/api/geopolitical/candidates/ingest",
		minRole: "analyst",
		methods: ["POST"],
	},
	{
		prefix: "/api/geopolitical/candidates",
		minRole: "analyst",
		methods: ["POST", "PATCH", "DELETE"],
	},
	{
		prefix: "/api/geopolitical/contradictions",
		minRole: "analyst",
		methods: ["POST", "PATCH", "DELETE"],
	},
	{
		prefix: "/api/geopolitical/seed",
		minRole: "analyst",
		methods: ["POST"],
	},
	// Internal Go gateway path rules retained for completeness/future direct proxying
	{ prefix: "/api/v1/portfolio/order", minRole: "trader" },
	{ prefix: "/api/v1/portfolio/balances", minRole: "trader" },
	{ prefix: "/api/v1/geopolitical/candidates", minRole: "analyst" },
];

function getAllowedOrigins(): string[] {
	const configured = process.env.CORS_ALLOWED_ORIGINS?.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);
	return configured && configured.length > 0 ? configured : ["http://localhost:3000"];
}

function getOrCreateRequestId(request: NextRequest): string {
	const existing = request.headers.get(REQUEST_ID_HEADER)?.trim();
	if (existing) return existing;
	return crypto.randomUUID();
}

function applyBaseSecurityHeaders(response: NextResponse): NextResponse {
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
	response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
	response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
	return response;
}

function applyApiSecurityHeaders(response: NextResponse): NextResponse {
	response.headers.set(
		"Content-Security-Policy",
		"default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
	);
	return applyBaseSecurityHeaders(response);
}

function isPageSecurityHeadersEnabled(): boolean {
	const configured = process.env.PAGE_SECURITY_HEADERS_ENABLED?.trim().toLowerCase();
	if (configured === "true") return true;
	if (configured === "false") return false;
	return process.env.NODE_ENV === "production";
}

function getPageCspMode(): "off" | "report-only" | "enforce" {
	const raw = process.env.PAGE_CSP_MODE?.trim().toLowerCase();
	if (raw === "off" || raw === "enforce") return raw;
	if (raw === "report-only") return raw;
	return process.env.NODE_ENV === "production" ? "report-only" : "off";
}

function getDefaultPageCspPolicy(): string {
	// Transitional UI-CSP baseline that remains compatible with Next.js while tightening obvious sinks.
	const isDev = process.env.NODE_ENV !== "production";
	const scriptSrc = isDev
		? "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;"
		: "script-src 'self' 'unsafe-inline' blob:;";
	const connectSrc = isDev
		? "connect-src 'self' https: http: ws: wss:;"
		: "connect-src 'self' https: wss:;";
	return [
		"default-src 'self';",
		scriptSrc,
		"style-src 'self' 'unsafe-inline';",
		"img-src 'self' data: blob: https:;",
		"font-src 'self' data:;",
		connectSrc,
		"object-src 'none';",
		"frame-src 'none';",
		"manifest-src 'self';",
		"media-src 'self' data: blob: https:;",
		"worker-src 'self' blob:;",
		"frame-ancestors 'none';",
		"base-uri 'self';",
		"form-action 'self';",
		...(isDev ? [] : ["upgrade-insecure-requests;"]),
	].join(" ");
}

function getPageCspPolicy(): string {
	const configured = process.env.PAGE_CSP_POLICY?.trim();
	return configured && configured.length > 0 ? configured : getDefaultPageCspPolicy();
}

function applyCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
	const origin = request.headers.get("origin");
	const allowed = getAllowedOrigins();
	if (origin && allowed.includes(origin)) {
		response.headers.set("Access-Control-Allow-Origin", origin);
	}
	response.headers.set("Vary", "Origin");
	response.headers.set("Access-Control-Allow-Credentials", "true");
	response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
	response.headers.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, X-Geo-Actor, X-Request-ID, X-User-Role, X-Auth-User, X-Auth-JTI",
	);
	return response;
}

function applyApiResponseHeaders(
	response: NextResponse,
	request: NextRequest,
	requestId: string,
): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return applyApiSecurityHeaders(applyCorsHeaders(response, request));
}

function applyPageResponseHeaders(
	response: NextResponse,
	_request: NextRequest,
	requestId: string,
): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	applyBaseSecurityHeaders(response);
	if (!isPageSecurityHeadersEnabled()) {
		return response;
	}
	const cspMode = getPageCspMode();
	if (cspMode === "off") {
		return response;
	}
	const cspPolicy = getPageCspPolicy();
	if (cspMode === "report-only") {
		response.headers.set("Content-Security-Policy-Report-Only", cspPolicy);
		return response;
	}
	response.headers.set("Content-Security-Policy", cspPolicy);
	return response;
}

function isPublicApiPath(pathname: string): boolean {
	return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function methodMatches(method: string, methods?: HTTPMethod[]): boolean {
	if (!methods || methods.length === 0) return true;
	return methods.includes(method as HTTPMethod);
}

function requiredRoleForApiPath(method: string, pathname: string): AppRole {
	for (const rule of PROTECTED_ROLE_RULES) {
		if (pathname.startsWith(rule.prefix) && methodMatches(method, rule.methods)) {
			return rule.minRole;
		}
	}
	return "viewer";
}

function normalizeRole(value: unknown): AppRole {
	if (typeof value !== "string") return "viewer";
	const role = value.trim().toLowerCase();
	if (role === "analyst" || role === "trader" || role === "admin") return role;
	return "viewer";
}

function normalizeHeaderString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed === "" ? null : trimmed;
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const requestId = getOrCreateRequestId(request);
	if (!pathname.startsWith("/api")) {
		return applyPageResponseHeaders(NextResponse.next(), request, requestId);
	}

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set(REQUEST_ID_HEADER, requestId);

	if (request.method === "OPTIONS") {
		return applyApiResponseHeaders(new NextResponse(null, { status: 204 }), request, requestId);
	}

	if (isPublicApiPath(pathname)) {
		return applyApiResponseHeaders(
			NextResponse.next({
				request: {
					headers: requestHeaders,
				},
			}),
			request,
			requestId,
		);
	}

	let forwardedRole: AppRole | null = null;
	if (isAuthStackBypassEnabled()) {
		forwardedRole = getAuthBypassRole();
		requestHeaders.set("X-Auth-Bypass", "1");
		requestHeaders.set("X-Auth-User", "auth-bypass-test-user");
		requestHeaders.set("X-Auth-Verified", "next-proxy-bypass");
	} else if (isAuthEnabled()) {
		const token = await getToken({
			req: request,
			secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
		});
		if (!token) {
			return applyApiResponseHeaders(
				NextResponse.json({ error: "unauthorized" }, { status: 401 }),
				request,
				requestId,
			);
		}

		const actualRole = normalizeRole(token.role);
		const requiredRole = requiredRoleForApiPath(request.method, pathname);
		if (ROLE_LEVEL[actualRole] < ROLE_LEVEL[requiredRole]) {
			return applyApiResponseHeaders(
				NextResponse.json({ error: "forbidden" }, { status: 403 }),
				request,
				requestId,
			);
		}
		forwardedRole = actualRole;
		const subject = normalizeHeaderString(token.sub);
		if (subject) {
			requestHeaders.set("X-Auth-User", subject);
		}
		const tokenJTI = normalizeHeaderString(token.jti);
		if (tokenJTI) {
			requestHeaders.set("X-Auth-JTI", tokenJTI);
		}
		requestHeaders.set("X-Auth-Verified", "next-proxy-session");
	}

	if (forwardedRole) {
		requestHeaders.set("X-User-Role", forwardedRole);
	}
	return applyApiResponseHeaders(
		NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		}),
		request,
		requestId,
	);
}

export const config = {
	matcher: [
		"/api/:path*",
		"/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|xml|woff|woff2)$).*)",
	],
};
