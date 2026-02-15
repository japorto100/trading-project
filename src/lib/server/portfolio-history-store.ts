import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { PortfolioSnapshot } from "@/lib/orders/portfolio";
import { getPrismaClient } from "@/lib/server/prisma";

interface SnapshotStoreFile {
	entries: PortfolioSnapshotEntry[];
}

export interface PortfolioSnapshotEntry {
	id: string;
	profileKey: string;
	generatedAt: string;
	snapshot: PortfolioSnapshot;
	createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "portfolio-snapshots.json");

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

interface DbSnapshotRecord {
	id: string;
	generatedAt: Date;
	createdAt: Date;
	snapshot: unknown;
	profile?: {
		profileKey: string;
	} | null;
}

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

async function ensureStoreDir(): Promise<void> {
	await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<SnapshotStoreFile> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as SnapshotStoreFile;
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

async function writeStore(data: SnapshotStoreFile): Promise<void> {
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

function toEntry(record: DbSnapshotRecord): PortfolioSnapshotEntry {
	const snapshot = record.snapshot as PortfolioSnapshot;
	const generatedAt =
		record.generatedAt instanceof Date
			? record.generatedAt.toISOString()
			: (snapshot?.generatedAt ?? new Date().toISOString());

	return {
		id: String(record.id),
		profileKey: String(record.profile?.profileKey ?? ""),
		generatedAt,
		snapshot,
		createdAt:
			record.createdAt instanceof Date ? record.createdAt.toISOString() : new Date().toISOString(),
	};
}

async function ensureDbProfile(db: DbClient, profileKey: string): Promise<{ id: string }> {
	const profile = await db.userProfile.upsert({
		where: { profileKey },
		update: {},
		create: { profileKey },
	});
	return { id: String(profile.id) };
}

async function listSnapshotsDb(
	db: DbClient,
	profileKey: string,
	limit: number,
): Promise<PortfolioSnapshotEntry[]> {
	const profile = await ensureDbProfile(db, profileKey);
	const rows = await db.portfolioSnapshotRecord.findMany({
		where: { profileId: profile.id },
		include: {
			profile: {
				select: { profileKey: true },
			},
		},
		orderBy: { generatedAt: "desc" },
		take: limit,
	});
	return rows.map((row) => toEntry(row));
}

async function saveSnapshotDb(
	db: DbClient,
	profileKey: string,
	snapshot: PortfolioSnapshot,
): Promise<PortfolioSnapshotEntry> {
	const profile = await ensureDbProfile(db, profileKey);
	const created = await db.portfolioSnapshotRecord.create({
		data: {
			profileId: profile.id,
			generatedAt: new Date(snapshot.generatedAt),
			snapshot: snapshot as unknown as object,
		},
		include: {
			profile: {
				select: { profileKey: true },
			},
		},
	});
	return toEntry(created);
}

async function listSnapshotsFile(
	profileKey: string,
	limit: number,
): Promise<PortfolioSnapshotEntry[]> {
	const store = await readStore();
	return store.entries
		.filter((entry) => entry.profileKey === profileKey)
		.sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt))
		.slice(0, limit);
}

async function saveSnapshotFile(
	profileKey: string,
	snapshot: PortfolioSnapshot,
): Promise<PortfolioSnapshotEntry> {
	return withWriteLock(async () => {
		const store = await readStore();
		const now = new Date().toISOString();
		const entry: PortfolioSnapshotEntry = {
			id: `ps_${randomUUID()}`,
			profileKey,
			generatedAt: snapshot.generatedAt,
			snapshot,
			createdAt: now,
		};

		store.entries.unshift(entry);
		await writeStore(store);
		return entry;
	});
}

export async function listPortfolioSnapshots(
	profileKey: string,
	limit = 100,
): Promise<PortfolioSnapshotEntry[]> {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 500) : 100;
	const db = getDbClient();
	if (db) {
		try {
			return await listSnapshotsDb(db, profileKey, safeLimit);
		} catch {
			// fall through to file storage
		}
	}

	return listSnapshotsFile(profileKey, safeLimit);
}

export async function savePortfolioSnapshot(
	profileKey: string,
	snapshot: PortfolioSnapshot,
): Promise<PortfolioSnapshotEntry> {
	const db = getDbClient();
	if (db) {
		try {
			return await saveSnapshotDb(db, profileKey, snapshot);
		} catch {
			// fall through to file storage
		}
	}

	return saveSnapshotFile(profileKey, snapshot);
}
