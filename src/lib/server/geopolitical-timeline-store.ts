import { randomUUID } from "node:crypto";
import path from "node:path";
import type { GeoTimelineEntry, GeoTimelineStoreFile } from "@/lib/geopolitical/types";
import { createLocalStoreAdapter } from "@/lib/server/local-store-adapter";
import { assertPersistenceFallbackAllowed } from "@/lib/server/persistence-policy";
import { getPrismaClient } from "@/lib/server/prisma";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "timeline.json");

const localStore = createLocalStoreAdapter<GeoTimelineStoreFile>({
	storeName: "geopolitical-timeline-store",
	filePath: STORE_PATH,
	defaultValue: { timeline: [] },
	isValid: (value: unknown): value is GeoTimelineStoreFile =>
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as GeoTimelineStoreFile).timeline),
});

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	return localStore.withWriteLock(task);
}

async function readStore(): Promise<GeoTimelineStoreFile> {
	return localStore.read();
}

async function writeStore(store: GeoTimelineStoreFile): Promise<void> {
	await localStore.write(store);
}

function sortNewestFirst(entries: GeoTimelineEntry[]): GeoTimelineEntry[] {
	return [...entries].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

type DbClient = NonNullable<ReturnType<typeof getPrismaClient>>;

interface GeoTimelineDbRecord {
	id: string;
	eventId: string | null;
	action: string;
	actor: string;
	at: Date;
	diffSummary: string;
}

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

function toTimelineEntry(record: GeoTimelineDbRecord): GeoTimelineEntry {
	return {
		id: String(record.id),
		eventId: record.eventId ?? "",
		action: record.action as GeoTimelineEntry["action"],
		actor: String(record.actor),
		at: new Date(record.at).toISOString(),
		diffSummary: String(record.diffSummary),
	};
}

export async function listGeoTimeline(eventId?: string, limit = 120): Promise<GeoTimelineEntry[]> {
	const db = getDbClient();
	if (db) {
		try {
			const rows = await db.geoTimelineRecord.findMany({
				where: eventId ? { eventId } : undefined,
				orderBy: { at: "desc" },
				take: Math.max(1, Math.min(limit, 500)),
			});
			return rows.map(toTimelineEntry);
		} catch (error) {
			assertPersistenceFallbackAllowed("Geo timeline DB list failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Geo timeline DB client unavailable");
	}

	const store = await readStore();
	const filtered = eventId
		? store.timeline.filter((entry) => entry.eventId === eventId)
		: store.timeline;
	return sortNewestFirst(filtered).slice(0, Math.max(1, Math.min(limit, 500)));
}

export async function appendGeoTimelineEntry(
	entry: Omit<GeoTimelineEntry, "id" | "at"> & { at?: string },
): Promise<GeoTimelineEntry> {
	const db = getDbClient();
	if (db) {
		try {
			const created = await db.geoTimelineRecord.create({
				data: {
					eventId: entry.eventId,
					action: entry.action,
					actor: entry.actor,
					at: entry.at ? new Date(entry.at) : new Date(),
					diffSummary: entry.diffSummary,
				},
			});
			return toTimelineEntry(created);
		} catch (error) {
			assertPersistenceFallbackAllowed("Geo timeline DB append failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Geo timeline DB client unavailable");
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const next: GeoTimelineEntry = {
			id: `gt_${randomUUID()}`,
			at: entry.at ?? new Date().toISOString(),
			eventId: entry.eventId,
			action: entry.action,
			actor: entry.actor,
			diffSummary: entry.diffSummary,
		};
		store.timeline.unshift(next);
		await writeStore(store);
		return next;
	});
}
