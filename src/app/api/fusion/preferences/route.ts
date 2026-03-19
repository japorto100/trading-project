import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getErrorMessage } from "@/lib/utils";

interface PreferencesPayload {
	profileKey: string;
	favorites?: string[];
	layout?: "single" | "2h" | "2v" | "4";
	sidebarOpen?: boolean;
	showDrawingTool?: boolean;
	darkMode?: boolean;
}

type PreferencesRouteReason =
	| "MISSING_PROFILE_KEY"
	| "INVALID_JSON_BODY"
	| "INVALID_PREFERENCES_PAYLOAD"
	| "PERSISTENCE_UNAVAILABLE"
	| "PREFERENCES_PROXY_FAILED";

const preferencesSchema = z.object({
	profileKey: z.string().min(1),
	favorites: z.array(z.string().min(1)).optional(),
	layout: z.enum(["single", "2h", "2v", "4"]).optional(),
	sidebarOpen: z.boolean().optional(),
	showDrawingTool: z.boolean().optional(),
	darkMode: z.boolean().optional(),
});

function errorResponse(
	error: string,
	reason: PreferencesRouteReason,
	status: number,
	details?: unknown,
) {
	return NextResponse.json(
		{
			error,
			reason,
			...(details ? { details } : {}),
		},
		{ status },
	);
}

function gatewayBaseUrl() {
	return process.env.GO_GATEWAY_BASE_URL?.trim() || null;
}

export async function GET(request: NextRequest) {
	const profileKey = request.nextUrl.searchParams.get("profileKey");
	if (!profileKey) {
		return errorResponse("profileKey is required", "MISSING_PROFILE_KEY", 400);
	}

	const gatewayUrl = gatewayBaseUrl();
	if (!gatewayUrl) {
		return errorResponse(
			"Persistence backend not configured (GO_GATEWAY_BASE_URL missing)",
			"PERSISTENCE_UNAVAILABLE",
			503,
		);
	}

	try {
		const response = await fetch(
			`${gatewayUrl}/api/v1/fusion/preferences?profileKey=${encodeURIComponent(profileKey)}`,
			{
				cache: "no-store",
				headers: {
					"x-request-id": request.headers.get("x-request-id") ?? crypto.randomUUID(),
				},
			},
		);
		const payload = await response.json();
		return NextResponse.json(payload, { status: response.status });
	} catch (error: unknown) {
		return errorResponse("Failed to proxy preferences", "PREFERENCES_PROXY_FAILED", 502, {
			details: getErrorMessage(error),
			hint: "Ensure the Go gateway is running and backend app DB is available.",
		});
	}
}

export async function PUT(request: NextRequest) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return errorResponse("invalid JSON body", "INVALID_JSON_BODY", 400);
	}

	const parsed = preferencesSchema.safeParse(payload);
	if (!parsed.success) {
		return errorResponse(
			"invalid preferences payload",
			"INVALID_PREFERENCES_PAYLOAD",
			400,
			parsed.error.flatten(),
		);
	}

	const body = parsed.data as PreferencesPayload;
	if (!body.profileKey) {
		return errorResponse("profileKey is required", "MISSING_PROFILE_KEY", 400);
	}

	const gatewayUrl = gatewayBaseUrl();
	if (!gatewayUrl) {
		return errorResponse(
			"Persistence backend not configured (GO_GATEWAY_BASE_URL missing)",
			"PERSISTENCE_UNAVAILABLE",
			503,
		);
	}

	try {
		const response = await fetch(`${gatewayUrl}/api/v1/fusion/preferences`, {
			method: "PUT",
			cache: "no-store",
			headers: {
				"content-type": "application/json",
				"x-request-id": request.headers.get("x-request-id") ?? crypto.randomUUID(),
			},
			body: JSON.stringify(body),
		});
		const responsePayload = await response.json();
		return NextResponse.json(responsePayload, { status: response.status });
	} catch (error: unknown) {
		return errorResponse("Failed to proxy preferences", "PREFERENCES_PROXY_FAILED", 502, {
			details: getErrorMessage(error),
			hint: "Ensure the Go gateway is running and backend app DB is available.",
		});
	}
}
