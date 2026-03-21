import { randomUUID } from "node:crypto";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import type { GeoAlertPolicyConfig } from "@/lib/geopolitical/operations-types";
import {
	getGeoAlertPolicyConfig,
	updateGeoAlertPolicyConfig,
} from "@/lib/server/geopolitical-alert-policy-store";

async function getAlertPolicy() {
	"use cache";
	cacheTag("geo-alert-policy");
	cacheLife("minutes");
	return getGeoAlertPolicyConfig();
}

function getActor(request: NextRequest): string {
	return (
		request.headers.get("x-geo-actor")?.trim() ||
		request.headers.get("x-auth-user")?.trim() ||
		"geo-operations-ui"
	);
}

export async function GET() {
	const requestId = randomUUID();
	const policy = await getAlertPolicy();
	return NextResponse.json({
		success: true,
		policy,
		requestId,
		degraded: false,
		degraded_reasons: [],
		contract_version: "phase12-alerts-policy-v1",
	});
}

export async function PATCH(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	try {
		const payload = (await request.json()) as Partial<GeoAlertPolicyConfig>;
		const next = await updateGeoAlertPolicyConfig({
			minSeverity: payload.minSeverity,
			minConfidence: payload.minConfidence,
			cooldownMinutes: payload.cooldownMinutes,
			muteProfileEnabled: payload.muteProfileEnabled,
			usePlaybackWindowPreview: payload.usePlaybackWindowPreview,
			actor: getActor(request),
		});
		revalidateTag("geo-alert-policy", "minutes");
		return NextResponse.json({
			success: true,
			policy: next,
			requestId,
			degraded: false,
			degraded_reasons: [],
			contract_version: "phase12-alerts-policy-v1",
		});
	} catch (error: unknown) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "policy update failed",
				requestId,
				degraded: true,
				degraded_reasons: ["POLICY_UPDATE_FAILED"],
				contract_version: "phase12-alerts-policy-v1",
			},
			{ status: 400 },
		);
	}
}
