import type { NextRequest } from "next/server";
import { handlePasskeyAuthenticationOptions } from "@/lib/server/passkeys";

export async function POST(request: NextRequest) {
	return handlePasskeyAuthenticationOptions(request);
}
