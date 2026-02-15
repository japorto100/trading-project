import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { AlertCondition, PriceAlert } from "@/lib/alerts";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { getPrismaClient } from "@/lib/server/prisma";

interface PriceAlertsStoreFile {
	alerts: Array<PriceAlert & { profileKey: string }>;
}

interface CreatePriceAlertInput {
	profileKey: string;
	symbol: string;
	condition: AlertCondition;
	targetValue: number;
	message?: string;
	enabled?: boolean;
}

type DbClient = NonNullable<ReturnType<typeof getPrismaClient>>;

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "price-alerts.json");

let writeChain: Promise<void> = Promise.resolve();

function isNodeErrorWithCode(error: unknown, code: string): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: unknown }).code === code
	);
}

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	const chained = writeChain.then(task, task);
	writeChain = chained.then(
		() => undefined,
		() => undefined,
	);
	return chained;
}

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

async function ensureStoreDir(): Promise<void> {
	await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<PriceAlertsStoreFile> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as PriceAlertsStoreFile;
		if (!parsed || !Array.isArray(parsed.alerts)) return { alerts: [] };
		return { alerts: parsed.alerts };
	} catch (error: unknown) {
		if (isNodeErrorWithCode(error, "ENOENT")) return { alerts: [] };
		throw error;
	}
}

async function writeStore(store: PriceAlertsStoreFile): Promise<void> {
	await ensureStoreDir();
	await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function toPriceAlert(record: {
	id: string;
	symbol: string;
	condition: string;
	targetValue: number;
	enabled: boolean;
	triggered: boolean;
	triggeredAt: Date | null;
	createdAt: Date;
	message: string | null;
}): PriceAlert {
	return {
		id: String(record.id),
		symbol: canonicalizeFusionSymbol(record.symbol),
		condition: record.condition as AlertCondition,
		targetValue: Number(record.targetValue),
		enabled: Boolean(record.enabled),
		triggered: Boolean(record.triggered),
		triggeredAt: record.triggeredAt ? record.triggeredAt.getTime() : undefined,
		createdAt: record.createdAt.getTime(),
		message: record.message ?? undefined,
	};
}

export async function listPriceAlerts(profileKey: string, symbol?: string): Promise<PriceAlert[]> {
	const db = getDbClient();
	if (db) {
		try {
			const profile = await db.userProfile.upsert({
				where: { profileKey },
				update: {},
				create: { profileKey },
			});
			const rows = await db.priceAlertRecord.findMany({
				where: {
					profileId: profile.id,
					...(symbol ? { symbol: canonicalizeFusionSymbol(symbol) } : {}),
				},
				orderBy: { createdAt: "desc" },
			});
			return rows.map(toPriceAlert);
		} catch {
			// fall through to file
		}
	}

	const store = await readStore();
	const canonicalSymbol = symbol ? canonicalizeFusionSymbol(symbol) : undefined;
	return store.alerts
		.filter(
			(entry) =>
				entry.profileKey === profileKey &&
				(!canonicalSymbol || canonicalizeFusionSymbol(entry.symbol) === canonicalSymbol),
		)
		.sort((a, b) => b.createdAt - a.createdAt)
		.map((entry) => ({
			id: entry.id,
			symbol: canonicalizeFusionSymbol(entry.symbol),
			condition: entry.condition,
			targetValue: entry.targetValue,
			enabled: entry.enabled,
			triggered: entry.triggered,
			triggeredAt: entry.triggeredAt,
			createdAt: entry.createdAt,
			message: entry.message,
		}));
}

export async function createPriceAlert(input: CreatePriceAlertInput): Promise<PriceAlert> {
	const db = getDbClient();
	const symbol = canonicalizeFusionSymbol(input.symbol);
	if (db) {
		try {
			const profile = await db.userProfile.upsert({
				where: { profileKey: input.profileKey },
				update: {},
				create: { profileKey: input.profileKey },
			});
			const created = await db.priceAlertRecord.create({
				data: {
					profileId: profile.id,
					symbol,
					condition: input.condition,
					targetValue: input.targetValue,
					enabled: input.enabled ?? true,
					triggered: false,
					message: input.message ?? null,
				},
			});
			return toPriceAlert(created);
		} catch {
			// fall through to file
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const alert: PriceAlert & { profileKey: string } = {
			profileKey: input.profileKey,
			id: `alert_${randomUUID()}`,
			symbol,
			condition: input.condition,
			targetValue: input.targetValue,
			enabled: input.enabled ?? true,
			triggered: false,
			createdAt: Date.now(),
			message: input.message,
		};
		store.alerts.unshift(alert);
		await writeStore(store);
		return {
			id: alert.id,
			symbol: alert.symbol,
			condition: alert.condition,
			targetValue: alert.targetValue,
			enabled: alert.enabled,
			triggered: alert.triggered,
			triggeredAt: alert.triggeredAt,
			createdAt: alert.createdAt,
			message: alert.message,
		};
	});
}

export async function updatePriceAlert(
	profileKey: string,
	alertId: string,
	updates: Partial<Pick<PriceAlert, "enabled" | "triggered" | "triggeredAt" | "message">>,
): Promise<PriceAlert | null> {
	const db = getDbClient();
	if (db) {
		try {
			const existing = await db.priceAlertRecord.findFirst({
				where: {
					id: alertId,
					profile: { profileKey },
				},
			});
			if (!existing) return null;

			const updated = await db.priceAlertRecord.update({
				where: { id: alertId },
				data: {
					enabled: updates.enabled ?? undefined,
					triggered: updates.triggered ?? undefined,
					triggeredAt:
						updates.triggeredAt === undefined
							? undefined
							: updates.triggeredAt
								? new Date(updates.triggeredAt)
								: null,
					message: updates.message ?? undefined,
				},
			});
			return toPriceAlert(updated);
		} catch {
			// fall through to file
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const index = store.alerts.findIndex(
			(entry) => entry.id === alertId && entry.profileKey === profileKey,
		);
		if (index < 0) return null;
		const current = store.alerts[index];
		const next: PriceAlert & { profileKey: string } = {
			...current,
			enabled: updates.enabled ?? current.enabled,
			triggered: updates.triggered ?? current.triggered,
			triggeredAt: updates.triggeredAt ?? current.triggeredAt,
			message: updates.message ?? current.message,
		};
		store.alerts[index] = next;
		await writeStore(store);
		return {
			id: next.id,
			symbol: next.symbol,
			condition: next.condition,
			targetValue: next.targetValue,
			enabled: next.enabled,
			triggered: next.triggered,
			triggeredAt: next.triggeredAt,
			createdAt: next.createdAt,
			message: next.message,
		};
	});
}

export async function deletePriceAlert(profileKey: string, alertId: string): Promise<boolean> {
	const db = getDbClient();
	if (db) {
		try {
			const existing = await db.priceAlertRecord.findFirst({
				where: { id: alertId, profile: { profileKey } },
				select: { id: true },
			});
			if (!existing) return false;
			await db.priceAlertRecord.delete({ where: { id: alertId } });
			return true;
		} catch {
			// fall through to file
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const initial = store.alerts.length;
		store.alerts = store.alerts.filter(
			(entry) => !(entry.id === alertId && entry.profileKey === profileKey),
		);
		if (store.alerts.length === initial) return false;
		await writeStore(store);
		return true;
	});
}
