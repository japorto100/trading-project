import { PrismaClient } from "@prisma/client";

type AppDbMode = "frontend-sqlite" | "backend-sqlite" | "backend-postgres";

declare global {
	// eslint-disable-next-line no-var
	var __fusionPrisma: PrismaClient | undefined;
	// eslint-disable-next-line no-var
	var __fusionPrismaUrl: string | undefined;
}

function normalizeAppDbMode(value: string | undefined): AppDbMode {
	switch ((value ?? "").trim().toLowerCase()) {
		case "backend-sqlite":
			return "backend-sqlite";
		case "backend-postgres":
			return "backend-postgres";
		default:
			return "frontend-sqlite";
	}
}

export function resolvePrismaDatabaseUrl(env: NodeJS.ProcessEnv = process.env): {
	mode: AppDbMode;
	url: string | null;
} {
	const mode = normalizeAppDbMode(env.APP_DB_MODE);
	const frontendSqlite = env.DATABASE_URL?.trim() || null;
	const backendSqlite = env.DATABASE_URL_BACKEND_SQLITE?.trim() || null;
	const backendPostgres = env.DATABASE_URL_POSTGRES?.trim() || env.POSTGRES_APP_DSN?.trim() || null;

	switch (mode) {
		case "backend-sqlite":
			return { mode, url: backendSqlite };
		case "backend-postgres":
			return { mode, url: backendPostgres };
		default:
			return { mode, url: frontendSqlite };
	}
}

export function getPrismaClient(): PrismaClient | null {
	const resolved = resolvePrismaDatabaseUrl();
	if (!resolved.url) {
		return null;
	}
	process.env.DATABASE_URL = resolved.url;

	if (!globalThis.__fusionPrisma || globalThis.__fusionPrismaUrl !== resolved.url) {
		globalThis.__fusionPrisma = new PrismaClient();
		globalThis.__fusionPrismaUrl = resolved.url;
	}

	return globalThis.__fusionPrisma;
}
