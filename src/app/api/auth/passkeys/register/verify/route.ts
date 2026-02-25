import type { NextRequest } from "next/server";
import { handlePasskeyRegistrationVerify } from "@/lib/server/passkeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	return handlePasskeyRegistrationVerify(request);
}
