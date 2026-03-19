import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { isMacroSymbol } from "@/lib/macro-symbols";
import { getGatewayBaseURL } from "@/lib/server/gateway";

function inferMacroExchange(symbol: string): string {
	const upper = symbol.toUpperCase();
	if (upper.startsWith("IMF_IFS_")) return "imf";
	if (upper.startsWith("BANXICO_") || upper === "SF43718") return "banxico";
	if (upper.startsWith("BOK_")) return "bok";
	if (upper.startsWith("BCRA_")) return "bcra";
	if (upper.startsWith("TCMB_")) return "tcmb";
	if (upper.startsWith("RBI_")) return "rbi";
	if (upper === "POLICY_RATE" || upper.startsWith("FED") || upper === "FEDFUNDS") return "fed";
	if (upper.includes("BOJ")) return "boj";
	if (upper.includes("SNB")) return "snb";
	if (upper.includes("BCB")) return "bcb";
	if (upper.includes("ECB")) return "ecb";
	if (upper.startsWith("FRED")) return "fred";
	return "imf";
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const symbol = request.nextUrl.searchParams.get("symbol")?.trim();
	if (!symbol || !isMacroSymbol(symbol)) {
		return NextResponse.json(
			{ success: false, error: "Invalid or non-macro symbol" },
			{ status: 400 },
		);
	}
	const exchange = inferMacroExchange(symbol);
	const gatewayBase = getGatewayBaseURL();
	const url = `${gatewayBase}/api/v1/quote?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}&assetType=macro`;
	try {
		const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10000) });
		const payload = (await res.json()) as {
			success: boolean;
			data?: { symbol: string; exchange: string; last: number; timestamp: number; source: string };
			error?: string;
		};
		if (!res.ok || !payload.success) {
			return NextResponse.json(
				{ success: false, error: payload.error ?? `Gateway error (${res.status})` },
				{ status: 502 },
			);
		}
		return NextResponse.json({
			success: true,
			data: payload.data,
			requestId,
		});
	} catch (err) {
		return NextResponse.json(
			{
				success: false,
				error: err instanceof Error ? err.message : "Macro quote fetch failed",
			},
			{ status: 502 },
		);
	}
}
