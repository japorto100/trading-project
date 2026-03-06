import { randomUUID } from "node:crypto";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getGeopoliticalSourceHealth } from "@/lib/geopolitical/source-health";
import {
	getGeoCentralBankOverlayConfig,
	updateGeoCentralBankOverlayConfig,
} from "@/lib/server/geopolitical-phase12-overlay-config-store";

async function getCentralBankOverlay() {
	"use cache";
	cacheTag("geo-central-bank-overlay");
	cacheLife("minutes");
	const config = await getGeoCentralBankOverlayConfig();
	const entries = getGeopoliticalSourceHealth();
	const lower = (value: string) => value.toLowerCase();
	const centralBankSources = entries.filter((entry) => {
		const haystack = `${entry.id} ${entry.label}`;
		return (
			lower(haystack).includes("fed") ||
			lower(haystack).includes("ecb") ||
			lower(haystack).includes("central")
		);
	});
	const sanctionsSources = entries.filter((entry) => {
		const haystack = `${entry.id} ${entry.label}`;
		return (
			lower(haystack).includes("ofac") ||
			lower(haystack).includes("un") ||
			lower(haystack).includes("sanction") ||
			lower(haystack).includes("uk")
		);
	});
	return {
		config,
		sourceSummary: {
			centralBanks: centralBankSources.length,
			sanctions: sanctionsSources.length,
		},
	};
}

function getActor(request: NextRequest): string {
	return (
		request.headers.get("x-geo-actor")?.trim() ||
		request.headers.get("x-auth-user")?.trim() ||
		"phase12-ui"
	);
}

export async function GET() {
	const requestId = randomUUID();
	const { config, sourceSummary } = await getCentralBankOverlay();
	return NextResponse.json({
		success: true,
		config,
		sourceSummary,
		requestId,
		degraded: false,
		degraded_reasons: [],
		contract_version: "phase12-overlay-v1",
	});
}

export async function PATCH(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	try {
		const payload = (await request.json()) as {
			rateDecisionsEnabled?: boolean;
			cbdcStatusEnabled?: boolean;
			dedollarizationEnabled?: boolean;
			financialOpennessEnabled?: boolean;
		};
		const config = await updateGeoCentralBankOverlayConfig({
			...payload,
			actor: getActor(request),
		});
		revalidateTag("geo-central-bank-overlay", "minutes");
		return NextResponse.json({
			success: true,
			config,
			requestId,
			degraded: false,
			degraded_reasons: [],
			contract_version: "phase12-overlay-v1",
		});
	} catch (error: unknown) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "overlay config update failed",
				requestId,
				degraded: true,
				degraded_reasons: ["OVERLAY_UPDATE_FAILED"],
				contract_version: "phase12-overlay-v1",
			},
			{ status: 400 },
		);
	}
}
