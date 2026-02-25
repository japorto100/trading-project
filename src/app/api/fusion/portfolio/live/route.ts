import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/utils";

const GO_GATEWAY_BASE = process.env.GO_GATEWAY_BASE_URL ?? "http://127.0.0.1:9060";

/**
 * GET /api/fusion/portfolio/live
 *
 * Phase 5a: Proxies to Go /api/v1/gct/portfolio/summary which in turn calls the
 * GoCryptoTrader portfolio manager.  When GCT is not running the Go handler
 * returns {gctAvailable: false} — this route passes that through transparently
 * so the frontend can show a graceful "not connected" state.
 */
export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();

	try {
		const url = `${GO_GATEWAY_BASE}/api/v1/gct/portfolio/summary`;
		const headers: HeadersInit = {
			Accept: "application/json",
			"X-Request-ID": requestId,
		};

		const userRole = request.headers.get("x-user-role");
		if (userRole) headers["X-User-Role"] = userRole;

		const response = await fetch(url, {
			cache: "no-store",
			headers,
			signal: AbortSignal.timeout(9000),
		});

		if (!response.ok) {
			const text = await response.text().catch(() => "");
			return NextResponse.json(
				{ error: `GCT bridge error (${response.status})`, detail: text },
				{ status: response.status, headers: { "X-Request-ID": requestId } },
			);
		}

		const payload = (await response.json()) as unknown;
		return NextResponse.json(payload, {
			headers: { "X-Request-ID": requestId },
		});
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: getErrorMessage(err) },
			{ status: 502, headers: { "X-Request-ID": requestId } },
		);
	}
}
