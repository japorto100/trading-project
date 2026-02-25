import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import type { OHLCVData, TimeframeValue } from "@/lib/providers/types";

const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";

interface GatewayOhlcvPayload {
	success?: boolean;
	provider?: string;
	data?: OHLCVData[];
}

function toInt(input: string | null): number | null {
	if (!input) return null;
	const parsed = Number.parseInt(input, 10);
	return Number.isFinite(parsed) ? parsed : null;
}

function filterByRange(data: OHLCVData[], start: number | null, end: number | null): OHLCVData[] {
	if (!start && !end) return data;
	return data.filter((row) => {
		if (start !== null && row.time < start) return false;
		if (end !== null && row.time > end) return false;
		return true;
	});
}

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

async function fetchOhlcvViaGateway(input: {
	symbol: string;
	timeframe: TimeframeValue;
	limit: number;
	start: number | null;
	end: number | null;
	requestId: string;
	userRole?: string;
}): Promise<{ data: OHLCVData[]; provider: string } | null> {
	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const endpoint = new URL("/api/v1/ohlcv", gatewayBaseURL);
	endpoint.searchParams.set("symbol", input.symbol);
	endpoint.searchParams.set("timeframe", input.timeframe);
	endpoint.searchParams.set("limit", String(input.limit));
	if (input.start !== null) endpoint.searchParams.set("start", String(input.start));
	if (input.end !== null) endpoint.searchParams.set("end", String(input.end));

	const headers: Record<string, string> = {
		Accept: "application/json",
		"X-Request-ID": input.requestId,
	};
	if (input.userRole) {
		headers["X-User-Role"] = input.userRole;
	}

	let attempts = 0;
	const maxAttempts = 2;

	while (attempts < maxAttempts) {
		try {
			const response = await fetch(endpoint.toString(), {
				method: "GET",
				headers,
				cache: "no-store",
				// Adding a reasonable timeout for the gateway request
				signal: AbortSignal.timeout(15000),
			});

			if (response.ok) {
				const payload = (await response.json()) as GatewayOhlcvPayload;
				if (payload.success && Array.isArray(payload.data)) {
					return {
						data: filterByRange(payload.data, input.start, input.end),
						provider: payload.provider || "go-gateway",
					};
				}
			}

			// If not ok, we wait a bit before retrying
			attempts++;
			if (attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
			}
		} catch (error) {
			attempts++;
			if (attempts >= maxAttempts) {
				console.error(`OHLCV Gateway fetch failed after ${maxAttempts} attempts:`, error);
				return null;
			}
			await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
		}
	}

	return null;
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	try {
		const searchParams = request.nextUrl.searchParams;
		const rawSymbol = searchParams.get("symbol");
		const timeframe = (searchParams.get("timeframe") || "1H") as TimeframeValue;
		const rawLimit = toInt(searchParams.get("limit"));
		const limit = Math.max(10, Math.min(rawLimit ?? 300, 100000));
		const start = toInt(searchParams.get("start"));
		const end = toInt(searchParams.get("end"));

		if (!rawSymbol) {
			return withRequestIdHeader(
				NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 }),
				requestId,
			);
		}
		if (start !== null && end !== null && start >= end) {
			return withRequestIdHeader(
				NextResponse.json(
					{ error: "Invalid time range: start must be less than end" },
					{ status: 400 },
				),
				requestId,
			);
		}
		const symbol = canonicalizeFusionSymbol(rawSymbol);

		const gatewayResult = await fetchOhlcvViaGateway({
			symbol,
			timeframe,
			limit,
			start,
			end,
			requestId,
			userRole,
		});
		if (gatewayResult) {
			return withRequestIdHeader(
				NextResponse.json({
					success: true,
					symbol,
					timeframe,
					provider: gatewayResult.provider,
					limit,
					start,
					end,
					count: gatewayResult.data.length,
					data: gatewayResult.data,
				}),
				requestId,
			);
		}

		return withRequestIdHeader(
			NextResponse.json({ error: "Gateway OHLCV request failed" }, { status: 502 }),
			requestId,
		);
	} catch (error: unknown) {
		console.error("OHLCV API Error:", error);
		return withRequestIdHeader(
			NextResponse.json(
				{ error: error instanceof Error ? error.message : "Failed to fetch OHLCV data" },
				{ status: 500 },
			),
			requestId,
		);
	}
}
