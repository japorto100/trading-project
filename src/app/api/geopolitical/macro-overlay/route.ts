import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getGatewayBaseURL } from "@/lib/server/gateway";

/** Exchange -> GeoMap country name (world-atlas countries-110m properties.name) */
const EXCHANGE_TO_COUNTRY: Record<string, string> = {
	FED: "United States of America",
	BOJ: "Japan",
	SNB: "Switzerland",
	BCB: "Brazil",
	BANXICO: "Mexico",
	BOK: "South Korea",
	BCRA: "Argentina",
	TCMB: "Turkey",
	RBI: "India",
	ECB: "Germany", // ECB policy rate - use Germany as eurozone representative
};

const POLICY_RATE_EXCHANGES = [
	"FED",
	"BOJ",
	"SNB",
	"BCB",
	"BANXICO",
	"BOK",
	"BCRA",
	"TCMB",
	"RBI",
	"ECB",
] as const;

interface GatewayQuoteResponse {
	success: boolean;
	error?: string;
	data?: {
		symbol: string;
		exchange: string;
		assetType: string;
		last: number;
		timestamp: number;
		source: string;
	};
}

async function fetchPolicyRate(
	gatewayBase: string,
	exchange: string,
): Promise<{ value: number; label?: string } | null> {
	const symbol = exchange === "BANXICO" ? "SF43718" : "POLICY_RATE";
	const url = `${gatewayBase}/api/v1/quote?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}&assetType=macro`;
	try {
		const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
		if (!res.ok) return null;
		const payload = (await res.json()) as GatewayQuoteResponse;
		if (!payload.success || !payload.data) return null;
		const value = Number(payload.data.last);
		if (!Number.isFinite(value)) return null;
		return {
			value,
			label: `${exchange} Policy Rate`,
		};
	} catch {
		return null;
	}
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const indicator = request.nextUrl.searchParams.get("indicator") || "policy_rate";

	if (indicator !== "policy_rate") {
		return NextResponse.json(
			{
				success: false,
				error: "Only indicator=policy_rate is supported",
				requestId,
				degraded: true,
				degraded_reasons: ["UNSUPPORTED_INDICATOR"],
				contract_version: "macro-overlay-v1",
			},
			{ status: 400 },
		);
	}

	const gatewayBase = getGatewayBaseURL();
	const results: Record<string, { value: number; label?: string }> = {};

	const promises = POLICY_RATE_EXCHANGES.map(async (exchange) => {
		const country = EXCHANGE_TO_COUNTRY[exchange];
		if (!country) return;
		const data = await fetchPolicyRate(gatewayBase, exchange);
		if (data) {
			results[country] = data;
		}
	});

	await Promise.all(promises);

	return NextResponse.json({
		success: true,
		indicator: "policy_rate",
		data: results,
		requestId,
		degraded: Object.keys(results).length === 0,
		degraded_reasons: Object.keys(results).length === 0 ? ["NO_MACRO_DATA"] : [],
		contract_version: "macro-overlay-v1",
	});
}
