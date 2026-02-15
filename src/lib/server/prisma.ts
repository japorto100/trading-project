import { PrismaClient } from "@prisma/client";

declare global {
	// eslint-disable-next-line no-var
	var __fusionPrisma: PrismaClient | undefined;
}

export function getPrismaClient(): PrismaClient | null {
	if (!process.env.DATABASE_URL) {
		return null;
	}

	if (!globalThis.__fusionPrisma) {
		globalThis.__fusionPrisma = new PrismaClient();
	}

	return globalThis.__fusionPrisma;
}
