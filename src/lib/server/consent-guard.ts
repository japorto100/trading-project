import { NextResponse } from "next/server";
import { hasLLMConsentForCurrentUser } from "@/lib/server/consent";

export async function requireLLMConsentOrResponse(): Promise<NextResponse | null> {
	const result = await hasLLMConsentForCurrentUser();
	if (!result.ok) {
		return NextResponse.json({ success: false, error: result.error }, { status: result.status });
	}
	if (!result.allowed) {
		return NextResponse.json(
			{
				success: false,
				error: "llm consent required",
				details: "Enable LLM processing consent in /auth/privacy.",
			},
			{ status: 403 },
		);
	}
	return null;
}
