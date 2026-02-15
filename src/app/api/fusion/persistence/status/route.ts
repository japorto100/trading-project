import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/server/prisma";
import { getErrorMessage } from "@/lib/utils";

export async function GET() {
	const prisma = getPrismaClient();

	if (!prisma) {
		return NextResponse.json({
			success: false,
			dbConfigured: false,
			message: "DATABASE_URL not configured. Running in local-only mode.",
		});
	}

	try {
		await (prisma as unknown as { $queryRaw: (sql: TemplateStringsArray) => Promise<unknown> })
			.$queryRaw`SELECT 1`;
		return NextResponse.json({
			success: true,
			dbConfigured: true,
			message: "Persistence backend is reachable.",
		});
	} catch (error: unknown) {
		return NextResponse.json(
			{
				success: false,
				dbConfigured: true,
				message: "Database configured but not ready.",
				error: getErrorMessage(error),
				hint: "Run pnpm db:generate and pnpm db:push after configuring DATABASE_URL.",
			},
			{ status: 500 },
		);
	}
}
