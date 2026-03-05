import type { NextRequest } from "next/server";
import { handlePasskeyAuthenticationVerify } from "@/lib/server/passkeys";

export async function POST(request: NextRequest) {
	return handlePasskeyAuthenticationVerify(request);
}
