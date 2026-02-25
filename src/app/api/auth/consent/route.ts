import { NextResponse } from "next/server";
import { getOrCreateUserConsentSnapshot, updateUserConsentSnapshot } from "@/lib/server/consent";

function noStoreJson<T>(body: T, init?: ResponseInit): NextResponse<T> {
	const response = NextResponse.json(body, init);
	response.headers.set("Cache-Control", "no-store");
	return response;
}

export async function GET() {
	const result = await getOrCreateUserConsentSnapshot();
	if (!result.ok) {
		return noStoreJson({ error: result.error }, { status: result.status });
	}
	return noStoreJson({
		user: result.user,
		consent: result.consent,
	});
}

export async function PATCH(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return noStoreJson({ error: "invalid json body" }, { status: 400 });
	}

	if (!body || typeof body !== "object") {
		return noStoreJson({ error: "invalid body" }, { status: 400 });
	}
	const candidate = body as Record<string, unknown>;
	const result = await updateUserConsentSnapshot({
		llmProcessing:
			typeof candidate.llmProcessing === "boolean" ? candidate.llmProcessing : undefined,
		analyticsEnabled:
			typeof candidate.analyticsEnabled === "boolean" ? candidate.analyticsEnabled : undefined,
		marketingEnabled:
			typeof candidate.marketingEnabled === "boolean" ? candidate.marketingEnabled : undefined,
	});

	if (!result.ok) {
		return noStoreJson({ error: result.error }, { status: result.status });
	}
	return noStoreJson({
		user: result.user,
		consent: result.consent,
	});
}
