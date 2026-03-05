import { randomUUID } from "node:crypto";
import path from "node:path";
import type { PortfolioSnapshot } from "@/lib/orders/portfolio";
import { createLocalStoreAdapter } from "@/lib/server/local-store-adapter";
import { assertPersistenceFallbackAllowed } from "@/lib/server/persistence-policy";
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

const localStore = createLocalStoreAdapter<SnapshotStoreFile>({
	storeName: "portfolio-history",
	filePath: STORE_PATH,
	defaultValue: { entries: [] },
	isValid: (value: unknown): value is SnapshotStoreFile =>
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as SnapshotStoreFile).entries),
});

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

async function readStore(): Promise<SnapshotStoreFile> {
	return localStore.read();
}

async function writeStore(data: SnapshotStoreFile): Promise<void> {
	await localStore.write(data);
}

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	return localStore.withWriteLock(task);
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
		} catch (error) {
			assertPersistenceFallbackAllowed("Portfolio snapshots DB read failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Portfolio snapshots DB client unavailable");
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
		} catch (error) {
			assertPersistenceFallbackAllowed("Portfolio snapshots DB write failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Portfolio snapshots DB client unavailable");
	}

	return saveSnapshotFile(profileKey, snapshot);
}
