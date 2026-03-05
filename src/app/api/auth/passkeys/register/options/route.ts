import type { NextRequest } from "next/server";
import { handlePasskeyRegistrationOptions } from "@/lib/server/passkeys";

export async function POST(request: NextRequest) {
	return handlePasskeyRegistrationOptions(request);
}
