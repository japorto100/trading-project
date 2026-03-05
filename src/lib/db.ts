import { getPrismaClient } from "@/lib/server/prisma";

/**
 * Transitional compatibility export.
 * Use getPrismaClient() for nullable-safe access in all new code.
 */
export const db = getPrismaClient();
