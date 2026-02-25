type AppRole = "viewer" | "analyst" | "trader" | "admin";

interface PasskeySessionBootstrapRecord {
	userId: string;
	email: string | null;
	role: AppRole;
	expiresAt: number;
}

const DEFAULT_TTL_MS = 60_000;
const MAX_RECORDS = 256;

const records = new Map<string, PasskeySessionBootstrapRecord>();

function nowMs(): number {
	return Date.now();
}

function cleanupExpired(now = nowMs()) {
	for (const [proof, record] of records.entries()) {
		if (record.expiresAt <= now) {
			records.delete(proof);
		}
	}
	if (records.size <= MAX_RECORDS) return;
	for (const key of records.keys()) {
		records.delete(key);
		if (records.size <= MAX_RECORDS) break;
	}
}

function normalizeRole(value: string): AppRole {
	const role = value.trim().toLowerCase();
	if (role === "analyst" || role === "trader" || role === "admin") return role;
	return "viewer";
}

function newProof(): string {
	return crypto.randomUUID().replaceAll("-", "");
}

export function createPasskeySessionBootstrap(input: {
	userId: string;
	email: string | null;
	role: string;
	ttlMs?: number;
}) {
	const ttlMs = Math.max(1000, input.ttlMs ?? DEFAULT_TTL_MS);
	const proof = newProof();
	const expiresAt = nowMs() + ttlMs;
	cleanupExpired();
	records.set(proof, {
		userId: input.userId,
		email: input.email,
		role: normalizeRole(input.role),
		expiresAt,
	});
	return {
		proof,
		expiresAt,
	};
}

export function consumePasskeySessionBootstrap(input: {
	userId: string;
	proof: string;
}): { userId: string; email: string | null; role: AppRole } | null {
	cleanupExpired();
	const proof = input.proof.trim();
	const userId = input.userId.trim();
	if (!proof || !userId) return null;
	const record = records.get(proof);
	if (!record) return null;
	records.delete(proof);
	if (record.userId !== userId) return null;
	if (record.expiresAt <= nowMs()) return null;
	return {
		userId: record.userId,
		email: record.email,
		role: record.role,
	};
}
