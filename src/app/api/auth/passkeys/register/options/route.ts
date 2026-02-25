import type { NextRequest } from "next/server";
import { handlePasskeyRegistrationOptions } from "@/lib/server/passkeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	return handlePasskeyRegistrationOptions(request);
}
