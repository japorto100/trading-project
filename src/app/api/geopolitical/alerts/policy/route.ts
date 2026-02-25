import { type NextRequest, NextResponse } from "next/server";
import type { GeoAlertPolicyConfig } from "@/lib/geopolitical/phase12-types";
import {
	getGeoAlertPolicyConfig,
	updateGeoAlertPolicyConfig,
} from "@/lib/server/geopolitical-phase12-alert-policy-store";

function getActor(request: NextRequest): string {
	return (
		request.headers.get("x-geo-actor")?.trim() ||
		request.headers.get("x-auth-user")?.trim() ||
		"phase12-ui"
	);
}

export async function GET() {
	const policy = await getGeoAlertPolicyConfig();
	return NextResponse.json({ success: true, policy });
}

export async function PATCH(request: NextRequest) {
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
		return NextResponse.json({ success: true, policy: next });
	} catch (error: unknown) {
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : "policy update failed" },
			{ status: 400 },
		);
	}
}
