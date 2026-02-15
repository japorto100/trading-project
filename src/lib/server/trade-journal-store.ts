import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { getPrismaClient } from "@/lib/server/prisma";

interface JournalStoreFile {
	entries: TradeJournalEntry[];
}

export interface TradeJournalEntry {
	id: string;
	profileKey: string;
	symbol: string;
	orderId?: string;
	note: string;
	tags: string[];
	context?: Record<string, unknown>;
	screenshotUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTradeJournalEntryInput {
	profileKey: string;
	symbol: string;
	orderId?: string;
	note: string;
	tags?: string[];
	context?: Record<string, unknown>;
	screenshotUrl?: string;
}

export interface UpdateTradeJournalEntryInput {
	note?: string;
	tags?: string[];
	context?: Record<string, unknown>;
	screenshotUrl?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "trade-journal.json");

let writeChain: Promise<void> = Promise.resolve();

function isNodeErrorWithCode(error: unknown, code: string): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: unknown }).code === code
	);
}

type DbClient = NonNullable<ReturnType<typeof getPrismaClient>>;

interface DbJournalRecord {
	id: string;
	symbol: string;
	orderId: string | null;
	note: string;
	tags: unknown;
	context: unknown;
	screenshotUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
	profile?: {
		profileKey: string;
	} | null;
}

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

function normalizeTags(tags: unknown): string[] {
	if (!Array.isArray(tags)) return [];
	return tags
		.map((tag) => (typeof tag === "string" ? tag.trim() : ""))
		.filter((tag) => tag.length > 0);
}

function toEntry(record: DbJournalRecord): TradeJournalEntry {
	return {
		id: String(record.id),
		profileKey: String(record.profile?.profileKey ?? ""),
		symbol: canonicalizeFusionSymbol(record.symbol),
		orderId: record.orderId ?? undefined,
		note: String(record.note),
		tags: normalizeTags(record.tags),
		context:
			record.context && typeof record.context === "object"
				? (record.context as Record<string, unknown>)
				: undefined,
		screenshotUrl: record.screenshotUrl ?? undefined,
		createdAt: new Date(record.createdAt).toISOString(),
		updatedAt: new Date(record.updatedAt).toISOString(),
	};
}

async function ensureStoreDir(): Promise<void> {
	await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<JournalStoreFile> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as JournalStoreFile;
		if (!parsed || !Array.isArray(parsed.entries)) {
			return { entries: [] };
		}
		return { entries: parsed.entries };
	} catch (error: unknown) {
		if (isNodeErrorWithCode(error, "ENOENT")) {
			return { entries: [] };
		}
		throw error;
	}
}

async function writeStore(data: JournalStoreFile): Promise<void> {
	await ensureStoreDir();
	await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	const chained = writeChain.then(task, task);
	writeChain = chained.then(
		() => undefined,
		() => undefined,
	);
	return chained;
}

async function ensureDbProfile(db: DbClient, profileKey: string): Promise<{ id: string }> {
	const profile = await db.userProfile.upsert({
		where: { profileKey },
		update: {},
		create: { profileKey },
	});
	return { id: String(profile.id) };
}

async function listTradeJournalEntriesDb(
	db: DbClient,
	profileKey: string,
	symbol: string | undefined,
	limit: number,
): Promise<TradeJournalEntry[]> {
	const profile = await ensureDbProfile(db, profileKey);
	const rows = await db.tradeJournalRecord.findMany({
		where: {
			profileId: profile.id,
			...(symbol ? { symbol: canonicalizeFusionSymbol(symbol) } : {}),
		},
		include: {
			profile: {
				select: { profileKey: true },
			},
		},
		orderBy: { createdAt: "desc" },
		take: limit,
	});
	return rows.map((row) => toEntry(row));
}

async function createTradeJournalEntryDb(
	db: DbClient,
	input: CreateTradeJournalEntryInput,
): Promise<TradeJournalEntry> {
	const profile = await ensureDbProfile(db, input.profileKey);
	const created = await db.tradeJournalRecord.create({
		data: {
			profileId: profile.id,
			symbol: canonicalizeFusionSymbol(input.symbol),
			orderId: input.orderId ?? null,
			note: input.note,
			tags: (input.tags ?? []) as Prisma.InputJsonValue,
			context: input.context ? (input.context as Prisma.InputJsonValue) : undefined,
			screenshotUrl: input.screenshotUrl ?? null,
		},
		include: {
			profile: {
				select: { profileKey: true },
			},
		},
	});
	return toEntry(created);
}

async function updateTradeJournalEntryDb(
	db: DbClient,
	profileKey: string,
	entryId: string,
	input: UpdateTradeJournalEntryInput,
): Promise<TradeJournalEntry | null> {
	const existing = await db.tradeJournalRecord.findFirst({
		where: {
			id: entryId,
			profile: { profileKey },
		},
	});
	if (!existing) return null;

	const updated = await db.tradeJournalRecord.update({
		where: { id: entryId },
		data: {
			...(typeof input.note === "string" ? { note: input.note } : {}),
			...(input.tags ? { tags: input.tags as Prisma.InputJsonValue } : {}),
			...(input.context ? { context: input.context as Prisma.InputJsonValue } : {}),
			...(typeof input.screenshotUrl === "string"
				? { screenshotUrl: input.screenshotUrl || null }
				: {}),
		},
		include: {
			profile: {
				select: { profileKey: true },
			},
		},
	});
	return toEntry(updated);
}

async function deleteTradeJournalEntryDb(
	db: DbClient,
	profileKey: string,
	entryId: string,
): Promise<boolean> {
	const existing = await db.tradeJournalRecord.findFirst({
		where: {
			id: entryId,
			profile: { profileKey },
		},
		select: { id: true },
	});
	if (!existing) return false;
	await db.tradeJournalRecord.delete({ where: { id: entryId } });
	return true;
}

async function listTradeJournalEntriesFile(
	profileKey: string,
	symbol: string | undefined,
	limit: number,
): Promise<TradeJournalEntry[]> {
	const store = await readStore();
	return store.entries
		.filter(
			(entry) =>
				entry.profileKey === profileKey &&
				(!symbol || canonicalizeFusionSymbol(entry.symbol) === canonicalizeFusionSymbol(symbol)),
		)
		.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
		.slice(0, limit);
}

async function createTradeJournalEntryFile(
	input: CreateTradeJournalEntryInput,
): Promise<TradeJournalEntry> {
	return withWriteLock(async () => {
		const store = await readStore();
		const now = new Date().toISOString();
		const entry: TradeJournalEntry = {
			id: `tj_${randomUUID()}`,
			profileKey: input.profileKey,
			symbol: canonicalizeFusionSymbol(input.symbol),
			orderId: input.orderId,
			note: input.note,
			tags: normalizeTags(input.tags ?? []),
			context: input.context,
			screenshotUrl: input.screenshotUrl,
			createdAt: now,
			updatedAt: now,
		};
		store.entries.unshift(entry);
		await writeStore(store);
		return entry;
	});
}

async function updateTradeJournalEntryFile(
	profileKey: string,
	entryId: string,
	input: UpdateTradeJournalEntryInput,
): Promise<TradeJournalEntry | null> {
	return withWriteLock(async () => {
		const store = await readStore();
		const index = store.entries.findIndex(
			(entry) => entry.id === entryId && entry.profileKey === profileKey,
		);
		if (index < 0) return null;

		const current = store.entries[index];
		const updated: TradeJournalEntry = {
			...current,
			...(typeof input.note === "string" ? { note: input.note } : {}),
			...(input.tags ? { tags: normalizeTags(input.tags) } : {}),
			...(input.context ? { context: input.context } : {}),
			...(typeof input.screenshotUrl === "string" ? { screenshotUrl: input.screenshotUrl } : {}),
			updatedAt: new Date().toISOString(),
		};
		store.entries[index] = updated;
		await writeStore(store);
		return updated;
	});
}

async function deleteTradeJournalEntryFile(profileKey: string, entryId: string): Promise<boolean> {
	return withWriteLock(async () => {
		const store = await readStore();
		const before = store.entries.length;
		store.entries = store.entries.filter(
			(entry) => !(entry.profileKey === profileKey && entry.id === entryId),
		);
		if (store.entries.length === before) {
			return false;
		}
		await writeStore(store);
		return true;
	});
}

export async function listTradeJournalEntries(
	profileKey: string,
	symbol?: string,
	limit = 100,
): Promise<TradeJournalEntry[]> {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 500) : 100;
	const db = getDbClient();
	if (db) {
		try {
			return await listTradeJournalEntriesDb(db, profileKey, symbol, safeLimit);
		} catch {
			// fall through to file storage
		}
	}
	return listTradeJournalEntriesFile(profileKey, symbol, safeLimit);
}

export async function createTradeJournalEntry(
	input: CreateTradeJournalEntryInput,
): Promise<TradeJournalEntry> {
	const db = getDbClient();
	if (db) {
		try {
			return await createTradeJournalEntryDb(db, input);
		} catch {
			// fall through to file storage
		}
	}
	return createTradeJournalEntryFile(input);
}

export async function updateTradeJournalEntry(
	profileKey: string,
	entryId: string,
	input: UpdateTradeJournalEntryInput,
): Promise<TradeJournalEntry | null> {
	const db = getDbClient();
	if (db) {
		try {
			return await updateTradeJournalEntryDb(db, profileKey, entryId, input);
		} catch {
			// fall through to file storage
		}
	}
	return updateTradeJournalEntryFile(profileKey, entryId, input);
}

export async function deleteTradeJournalEntry(
	profileKey: string,
	entryId: string,
): Promise<boolean> {
	const db = getDbClient();
	if (db) {
		try {
			return await deleteTradeJournalEntryDb(db, profileKey, entryId);
		} catch {
			// fall through to file storage
		}
	}
	return deleteTradeJournalEntryFile(profileKey, entryId);
}
