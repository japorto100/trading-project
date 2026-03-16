// Server-only: write FileAuditLog entries via Prisma.
// Used by BFF routes for bounded-write and approval-write actions.

import type { FileAuditPayload } from "@/features/files/lib/action-classes";
import { getPrismaClient } from "@/lib/server/prisma";

interface WriteAuditOptions extends FileAuditPayload {
	documentId?: string;
	status?: "ok" | "failed";
	errorCode?: string;
	expiresAt?: Date;
}

export async function writeFileAudit(opts: WriteAuditOptions): Promise<void> {
	const db = getPrismaClient();
	if (!db) return;

	try {
		await db.fileAuditLog.create({
			data: {
				documentId: opts.documentId ?? null,
				action: opts.action,
				actionClass: opts.actionClass,
				actorUserId: opts.actorUserId ?? null,
				actorRole: opts.actorRole ?? null,
				requestId: opts.requestId,
				target: opts.target,
				status: opts.status ?? "ok",
				errorCode: opts.errorCode ?? null,
				expiresAt: opts.expiresAt ?? null,
			},
		});
	} catch {
		// Audit failure must never crash the primary request — log only.
		console.error("[file-audit] Failed to write audit log", {
			action: opts.action,
			target: opts.target,
			requestId: opts.requestId,
		});
	}
}
