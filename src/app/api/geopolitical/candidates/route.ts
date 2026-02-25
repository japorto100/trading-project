import { type NextRequest, NextResponse } from "next/server";
import { listGeoCandidates } from "@/lib/server/geopolitical-candidates-store";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export const runtime = "nodejs";

function useGoOwnedCandidatesReadAlias(): boolean {
	if ((process.env.GEOPOLITICAL_INGEST_SHADOW_COMPARE ?? "").trim() === "1") {
		return false;
	}
	const hardMode = (process.env.GEOPOLITICAL_INGEST_HARD_MODE ?? "next-proxy").trim();
	const softMode = (process.env.GEOPOLITICAL_INGEST_SOFT_MODE ?? "next-proxy").trim();
	return hardMode === "go-owned-gateway-v1" && softMode === "go-owned-gateway-v1";
}

export async function GET(request: NextRequest) {
	if (useGoOwnedCandidatesReadAlias()) {
		return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/candidates", {
			method: "GET",
			copyQuery: true,
		});
	}
	const state = request.nextUrl.searchParams.get("state") as
		| "open"
		| "accepted"
		| "rejected"
		| "snoozed"
		| "expired"
		| null;
	const regionHint = request.nextUrl.searchParams.get("regionHint") ?? undefined;
	const minConfidenceRaw = request.nextUrl.searchParams.get("minConfidence");
	const minConfidence = minConfidenceRaw ? Number(minConfidenceRaw) : undefined;
	const q = request.nextUrl.searchParams.get("q") ?? undefined;

	const candidates = await listGeoCandidates({
		state: state ?? undefined,
		regionHint,
		minConfidence: Number.isFinite(minConfidence) ? minConfidence : undefined,
		q,
	});

	return NextResponse.json({ success: true, candidates });
}

export async function POST(request: NextRequest) {
	const mode = request.nextUrl.searchParams.get("mode");
	if (mode === "hard") {
		return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/ingest/hard", {
			method: "POST",
			copyQuery: false,
		});
	}
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/candidates", {
		method: "POST",
		copyQuery: false,
	});
}
