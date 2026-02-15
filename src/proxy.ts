import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAuthEnabled } from "@/lib/auth";

function getAllowedOrigins(): string[] {
	const configured = process.env.CORS_ALLOWED_ORIGINS?.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);
	return configured && configured.length > 0 ? configured : ["http://localhost:3000"];
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
	response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Geo-Actor");
	return response;
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (!pathname.startsWith("/api")) {
		return NextResponse.next();
	}

	if (request.method === "OPTIONS") {
		return applyCorsHeaders(new NextResponse(null, { status: 204 }), request);
	}

	if (pathname.startsWith("/api/auth")) {
		return applyCorsHeaders(NextResponse.next(), request);
	}

	if (isAuthEnabled()) {
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		});
		if (!token) {
			return applyCorsHeaders(
				NextResponse.json({ error: "unauthorized" }, { status: 401 }),
				request,
			);
		}
	}

	return applyCorsHeaders(NextResponse.next(), request);
}

export const config = {
	matcher: ["/api/:path*"],
};
