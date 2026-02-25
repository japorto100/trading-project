import { type NextRequest, NextResponse } from "next/server";
import { getGeopoliticalSourceHealth } from "@/lib/geopolitical/source-health";
import {
	getGeoCentralBankOverlayConfig,
	updateGeoCentralBankOverlayConfig,
} from "@/lib/server/geopolitical-phase12-overlay-config-store";

function getActor(request: NextRequest): string {
	return (
		request.headers.get("x-geo-actor")?.trim() ||
		request.headers.get("x-auth-user")?.trim() ||
		"phase12-ui"
	);
}

export async function GET() {
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
	return NextResponse.json({
		success: true,
		config,
		sourceSummary: {
			centralBanks: centralBankSources.length,
			sanctions: sanctionsSources.length,
		},
	});
}

export async function PATCH(request: NextRequest) {
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
		return NextResponse.json({ success: true, config });
	} catch (error: unknown) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "overlay config update failed",
			},
			{ status: 400 },
		);
	}
}
