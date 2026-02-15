import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { GeoTimelineEntry, GeoTimelineStoreFile } from "@/lib/geopolitical/types";
import { getPrismaClient } from "@/lib/server/prisma";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "timeline.json");

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

async function ensureStoreDir(): Promise<void> {
	await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<GeoTimelineStoreFile> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as GeoTimelineStoreFile;
		if (!parsed || !Array.isArray(parsed.timeline)) {
			return { timeline: [] };
		}
		return { timeline: parsed.timeline };
	} catch (error: unknown) {
		if (isNodeErrorWithCode(error, "ENOENT")) return { timeline: [] };
		throw error;
	}
}

async function writeStore(store: GeoTimelineStoreFile): Promise<void> {
	await ensureStoreDir();
	await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
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
		} catch {
			// fall through
		}
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
		} catch {
			// fall through
		}
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
