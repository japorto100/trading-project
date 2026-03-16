// Server-only: write ControlAuditLog entries via Prisma (AC20).
// Used by Control Surface BFF routes for bounded-write and approval-write actions.
// Mirrors the writeFileAudit pattern — never throws.

import type { ControlAction, ControlActionClass } from "@/features/control/lib/action-classes";
import { getPrismaClient } from "@/lib/server/prisma";

interface WriteControlAuditOptions {
	action: ControlAction;
	actionClass: ControlActionClass;
	requestId: string;
	target: string; // sessionId or resource identifier
	actorUserId?: string;
	actorRole?: string;
	status?: "ok" | "failed";
	errorCode?: string;
	expiresAt?: Date;
}

export async function writeControlAudit(opts: WriteControlAuditOptions): Promise<void> {
	const db = getPrismaClient();
	if (!db) return;

	try {
		await db.controlAuditLog.create({
			data: {
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
		console.error("[control-audit] Failed to write audit log", {
			action: opts.action,
			target: opts.target,
			requestId: opts.requestId,
		});
	}
}
