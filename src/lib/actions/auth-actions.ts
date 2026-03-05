"use server";

/**
 * SOTA 2026 Password Security Actions
 * Next.js 16 / React 19 Implementation
 */

import { revalidatePath } from "next/cache";
import { authenticator } from "otplib";
import { auth } from "@/lib/auth";
import { hashPassword, validateNewPassword, verifyPassword } from "@/lib/server/auth-password";
import { getPrismaClient } from "@/lib/server/prisma";

export interface MFAData {
	secret?: string;
	otpauth?: string;
	recoveryCodes?: string[];
}

export type ChangePasswordResult =
	| { success: true; data?: MFAData }
	| { success: false; error: string; code?: string };

/**
 * Notify Go Gateway about a user-level revocation event (1.f2)
 */
async function notifyGoUserRevocation(userId: string) {
	try {
		const gatewayUrl = process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
		await fetch(`${gatewayUrl}/api/v1/auth/revocations/user`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Request-ID": `user-rev-${userId}-${Date.now()}`,
			},
			body: JSON.stringify({
				userId,
				revokedBefore: Math.floor(Date.now() / 1000),
			}),
		});
	} catch (error) {
		console.error("FAILED_GO_USER_REVOCATION_SIGNAL", { userId, error: String(error) });
	}
}

/**
 * Elite MFA - Step 1: Initialize TOTP (1.v12)
 */
export async function setupTOTP(): Promise<ChangePasswordResult> {
	const session = await auth();
	if (!session?.user?.id) return { success: false, error: "Unauthorized" };

	const secret = authenticator.generateSecret();
	const otpauth = authenticator.keyuri(
		session.user.email || "user@tradeview",
		"TradeView Fusion",
		secret,
	);

	return {
		success: true,
		data: { secret, otpauth },
	};
}

/**
 * Elite MFA - Step 2: Verify and Enable (1.v12)
 */
export async function enableTOTP(formData: FormData): Promise<ChangePasswordResult> {
	const session = await auth();
	if (!session?.user?.id) return { success: false, error: "Unauthorized" };

	const secret = formData.get("secret") as string;
	const code = formData.get("code") as string;

	if (!secret || !code) return { success: false, error: "Verification code required." };

	const isValid = authenticator.verify({ token: code, secret });
	if (!isValid) return { success: false, error: "Invalid verification code." };

	const prisma = getPrismaClient();
	if (!prisma) return { success: false, error: "DB unavailable" };

	const userId = session.user.id;

	try {
		await prisma.totpDevice.create({
			data: {
				userId,
				label: "Primary Authenticator",
				secretEnc: secret, // SOTA 2026: In prod, encrypt this with a KMS/MasterKey
				isPrimary: true,
			},
		});

		// Generate Recovery Codes (1.v12)
		const codes = Array.from({ length: 8 }, () => crypto.randomUUID().split("-")[0].toUpperCase());
		await prisma.recoveryCode.createMany({
			data: codes.map((c) => ({
				userId,
				codeHash: c, // Hash these in real prod
			})),
		});

		console.info("SECURITY_EVENT_MFA_ENABLED", { userId, severity: "CRITICAL" });

		revalidatePath("/auth/security");
		return { success: true, data: { recoveryCodes: codes } };
	} catch (_error) {
		return { success: false, error: "Failed to persist MFA state." };
	}
}

/**
 * Elite Password Change (1.v8)
 * Requirements: Active Session, Current Password Match, 2026 Entropy Validation
 */
export async function changePassword(
	_state: ChangePasswordResult,
	formData: FormData,
): Promise<ChangePasswordResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			error: "Unauthorized: Authentication required.",
			code: "AUTH_REQUIRED",
		};
	}

	const currentPassword = formData.get("currentPassword") as string;
	const newPassword = formData.get("newPassword") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	if (!currentPassword || !newPassword || !confirmPassword) {
		return { success: false, error: "All fields are required." };
	}

	if (newPassword !== confirmPassword) {
		return { success: false, error: "New passwords do not match." };
	}

	const validation = validateNewPassword(newPassword);
	if (!validation.ok) {
		return { success: false, error: validation.error };
	}

	const prisma = getPrismaClient();
	if (!prisma) {
		return { success: false, error: "Database interface unavailable." };
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { passwordHash: true },
		});

		if (!user || !user.passwordHash) {
			return { success: false, error: "Primary authentication method is not password-based." };
		}

		const isCurrentValid = verifyPassword(currentPassword, user.passwordHash);
		if (!isCurrentValid) {
			return { success: false, error: "Invalid current password.", code: "INVALID_CREDENTIALS" };
		}

		// Security 2026: Prevent reuse of current password
		if (currentPassword === newPassword) {
			return { success: false, error: "New password must be different from the current one." };
		}

		const newHash = hashPassword(newPassword);
		await prisma.user.update({
			where: { id: session.user.id },
			data: { passwordHash: newHash },
		});

		// SOTA 2026: Elite Cross-Stack Revocation Signal (1.f2)
		await notifyGoUserRevocation(session.user.id);

		// OTel Audit Log (Phase 1.v13)
		console.info("SECURITY_EVENT_PASSWORD_CHANGE", {
			userId: session.user.id,
			severity: "CRITICAL",
			status: "SUCCESS",
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/auth/security");
		return { success: true };
	} catch (error) {
		console.error("FAILED_PASSWORD_CHANGE", {
			userId: session.user.id,
			error: error instanceof Error ? error.message : String(error),
		});
		return { success: false, error: "Internal server error during update." };
	}
}

/**
 * Elite Password Recovery - Step 1: Request Reset (1.v9)
 */
export async function requestPasswordReset(
	_state: ChangePasswordResult,
	formData: FormData,
): Promise<ChangePasswordResult> {
	const email = formData.get("email") as string;
	if (!email) return { success: false, error: "Email is required." };

	const prisma = getPrismaClient();
	if (!prisma) return { success: false, error: "Database interface unavailable." };

	try {
		const user = await prisma.user.findUnique({
			where: { email: email.toLowerCase() },
			select: { id: true },
		});

		if (!user) {
			console.warn("RECOVERY_REQUEST_NON_EXISTENT_USER", { email });
			return { success: true };
		}

		const token = crypto.randomUUID();
		const expires = new Date(Date.now() + 3600 * 1000);

		await prisma.verificationToken.create({
			data: {
				identifier: email.toLowerCase(),
				token,
				expires,
			},
		});

		const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

		console.info("SECURITY_RECOVERY_TOKEN_GENERATED", {
			severity: "CRITICAL",
			userId: user.id,
			resetUrl,
			message: "Password reset link generated.",
		});

		return { success: true };
	} catch (error) {
		console.error("FAILED_RECOVERY_REQUEST", { email, error: String(error) });
		return { success: false, error: "Failed to process recovery request." };
	}
}

/**
 * Elite Password Recovery - Step 2: Finalize Reset (1.v9)
 */
export async function resetPassword(
	_state: ChangePasswordResult,
	formData: FormData,
): Promise<ChangePasswordResult> {
	const email = formData.get("email") as string;
	const token = formData.get("token") as string;
	const newPassword = formData.get("newPassword") as string;

	if (!email || !token || !newPassword) return { success: false, error: "Invalid reset request." };

	const validation = validateNewPassword(newPassword);
	if (!validation.ok) return { success: false, error: validation.error };

	const prisma = getPrismaClient();
	if (!prisma) return { success: false, error: "Database unavailable." };

	try {
		const verifiedToken = await prisma.verificationToken.findFirst({
			where: {
				identifier: email.toLowerCase(),
				token,
				expires: { gt: new Date() },
			},
		});

		if (!verifiedToken) {
			return { success: false, error: "Expired or invalid token." };
		}

		const newHash = hashPassword(newPassword);
		await prisma.user.update({
			where: { email: email.toLowerCase() },
			data: { passwordHash: newHash },
		});

		await notifyGoUserRevocation(email); // In reset, email is often identifier

		await prisma.verificationToken.delete({
			where: { identifier_token: { identifier: email.toLowerCase(), token } },
		});

		console.info("SECURITY_EVENT_PASSWORD_RESET_SUCCESS", {
			email,
			severity: "CRITICAL",
			timestamp: new Date().toISOString(),
		});

		return { success: true };
	} catch (error) {
		console.error("FAILED_PASSWORD_RESET", { email, error: String(error) });
		return { success: false, error: "Internal error during reset." };
	}
}

/**
 * Elite Password Recovery - Option 1: Recovery Code (1.v19)
 * Allows resetting password using one of the 8 pre-generated recovery codes.
 */
export async function recoverWithCode(
	_state: ChangePasswordResult,
	formData: FormData,
): Promise<ChangePasswordResult> {
	const email = formData.get("email") as string;
	const recoveryCode = formData.get("recoveryCode") as string;
	const newPassword = formData.get("newPassword") as string;

	if (!email || !recoveryCode || !newPassword) {
		return { success: false, error: "Missing required recovery data." };
	}

	const validation = validateNewPassword(newPassword);
	if (!validation.ok) return { success: false, error: validation.error };

	const prisma = getPrismaClient();
	if (!prisma) return { success: false, error: "DB unavailable" };

	try {
		const user = await prisma.user.findUnique({
			where: { email: email.toLowerCase() },
			include: { recoveryCodes: true },
		});

		if (!user) return { success: false, error: "Invalid recovery attempt." };

		// Find and use the recovery code
		const codeRecord = user.recoveryCodes.find((c) => c.codeHash === recoveryCode.toUpperCase());
		if (!codeRecord) {
			return { success: false, error: "Invalid or already used recovery code." };
		}

		const newHash = hashPassword(newPassword);
		await prisma.user.update({
			where: { id: user.id },
			data: { passwordHash: newHash },
		});

		// Burn the code after usage (One-time use)
		await prisma.recoveryCode.delete({
			where: { id: codeRecord.id },
		});

		// Notify Go
		await notifyGoUserRevocation(user.id);

		console.info("SECURITY_EVENT_RECOVERY_CODE_USED", {
			userId: user.id,
			severity: "CRITICAL",
			timestamp: new Date().toISOString(),
		});

		return { success: true };
	} catch (error) {
		console.error("FAILED_CODE_RECOVERY", { email, error: String(error) });
		return { success: false, error: "Internal recovery fault." };
	}
}
