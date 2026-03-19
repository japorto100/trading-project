import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AlertCondition } from "@/features/alerts/types";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";

const createAlertSchema = z.object({
	profileKey: z.string().min(1),
	symbol: z.string().min(1),
	condition: z.enum([
		"above",
		"below",
		"crosses_up",
		"crosses_down",
		"rsi_overbought",
		"rsi_oversold",
	]),
	targetValue: z.coerce.number().finite(),
	message: z.string().max(200).optional(),
	enabled: z.boolean().optional(),
});

function withRequestId(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function errorResponse(requestId: string, error: unknown): NextResponse {
	const message = error instanceof Error ? error.message : "alerts request failed";
	const persistenceError =
		message.includes("fallback is disabled") ||
		message.toLowerCase().includes("db client unavailable");
	return withRequestId(
		NextResponse.json(
			{
				success: false,
				error: message,
				reason: persistenceError ? "PERSISTENCE_UNAVAILABLE" : "INTERNAL_ERROR",
				requestId,
				degraded: true,
				degraded_reasons: [persistenceError ? "PERSISTENCE_UNAVAILABLE" : "INTERNAL_ERROR"],
			},
			{ status: persistenceError ? 503 : 500 },
		),
		requestId,
	);
}

function getGoGatewayUrl(): string {
	return process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const profileKey = request.nextUrl.searchParams.get("profileKey");
	if (!profileKey) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "profileKey is required",
					reason: "MISSING_PROFILE_KEY",
					requestId,
					degraded: false,
					degraded_reasons: [],
				},
				{ status: 400 },
			),
			requestId,
		);
	}
	try {
		const symbolParam = request.nextUrl.searchParams.get("symbol");
		const params = new URLSearchParams({ profileKey });
		if (symbolParam) params.set("symbol", symbolParam);
		const response = await fetch(`${getGoGatewayUrl()}/api/v1/fusion/alerts?${params.toString()}`, {
			method: "GET",
			headers: { "X-Request-ID": requestId },
			cache: "no-store",
		});
		const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
		return withRequestId(
			NextResponse.json({ ...payload, requestId }, { status: response.status }),
			requestId,
		);
	} catch (error: unknown) {
		return errorResponse(requestId, error);
	}
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid JSON body",
					reason: "INVALID_JSON_BODY",
					requestId,
					degraded: false,
					degraded_reasons: [],
				},
				{ status: 400 },
			),
			requestId,
		);
	}

	const parsed = createAlertSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid alert payload",
					reason: "INVALID_ALERT_PAYLOAD",
					details: parsed.error.flatten(),
					requestId,
					degraded: false,
					degraded_reasons: [],
				},
				{ status: 400 },
			),
			requestId,
		);
	}

	try {
		const response = await fetch(`${getGoGatewayUrl()}/api/v1/fusion/alerts`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Request-ID": requestId,
			},
			body: JSON.stringify({
				profileKey: parsed.data.profileKey,
				symbol: canonicalizeFusionSymbol(parsed.data.symbol),
				condition: parsed.data.condition as AlertCondition,
				targetValue: parsed.data.targetValue,
				message: parsed.data.message?.trim() || undefined,
				enabled: parsed.data.enabled,
			}),
			cache: "no-store",
		});
		const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
		return withRequestId(
			NextResponse.json({ ...payload, requestId }, { status: response.status }),
			requestId,
		);
	} catch (error: unknown) {
		return errorResponse(requestId, error);
	}
}
