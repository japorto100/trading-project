import type { NextRequest } from "next/server";
import { handlePasskeyRegistrationVerify } from "@/lib/server/passkeys";

export async function POST(request: NextRequest) {
	return handlePasskeyRegistrationVerify(request);
}
