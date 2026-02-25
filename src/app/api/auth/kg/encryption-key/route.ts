import { NextResponse } from "next/server";
import { getKGFallbackKeyMaterialForCurrentUser } from "@/lib/server/kg-encryption-key";

function noStoreJson<T>(body: T, init?: ResponseInit): NextResponse<T> {
	const response = NextResponse.json(body, init);
	response.headers.set("Cache-Control", "no-store");
	return response;
}

export async function GET() {
	const result = await getKGFallbackKeyMaterialForCurrentUser();
	if (!result.ok) {
		return noStoreJson({ error: result.error }, { status: result.status });
	}

	return noStoreJson({
		user: result.user,
		key: {
			source: result.source,
			prfSupported: result.prfSupported,
			algorithm: "AES-GCM-256",
			keyMaterialB64Url: result.keyMaterialB64Url,
		},
	});
}
