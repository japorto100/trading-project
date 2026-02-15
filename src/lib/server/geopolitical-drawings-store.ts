import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import type { GeoDrawing, GeoDrawingsStoreFile } from "@/lib/geopolitical/types";
import { getPrismaClient } from "@/lib/server/prisma";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "drawings.json");

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

async function readStore(): Promise<GeoDrawingsStoreFile> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as GeoDrawingsStoreFile;
		if (!parsed || !Array.isArray(parsed.drawings)) return { drawings: [] };
		return { drawings: parsed.drawings };
	} catch (error: unknown) {
		if (isNodeErrorWithCode(error, "ENOENT")) return { drawings: [] };
		throw error;
	}
}

async function writeStore(store: GeoDrawingsStoreFile): Promise<void> {
	await ensureStoreDir();
	await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

type DbClient = NonNullable<ReturnType<typeof getPrismaClient>>;

interface GeoDrawingDbRecord {
	id: string;
	type: string;
	label: string | null;
	points: unknown;
	color: string | null;
	eventId: string | null;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
	updatedBy: string;
}

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

function toDrawing(record: GeoDrawingDbRecord): GeoDrawing {
	return {
		id: String(record.id),
		type: record.type as GeoDrawing["type"],
		label: record.label ?? undefined,
		points: Array.isArray(record.points) ? record.points : [],
		color: record.color ?? undefined,
		eventId: record.eventId ?? undefined,
		createdAt: new Date(record.createdAt).toISOString(),
		updatedAt: new Date(record.updatedAt).toISOString(),
		createdBy: String(record.createdBy),
		updatedBy: String(record.updatedBy),
	};
}

export async function listGeoDrawings(): Promise<GeoDrawing[]> {
	const db = getDbClient();
	if (db) {
		try {
			const rows = await db.geoDrawingRecord.findMany({ orderBy: { updatedAt: "desc" } });
			return rows.map(toDrawing);
		} catch {
			// fall through
		}
	}

	const store = await readStore();
	return [...store.drawings].sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
	);
}

export async function createGeoDrawing(
	input: Omit<GeoDrawing, "id" | "createdAt" | "updatedAt">,
): Promise<GeoDrawing> {
	const db = getDbClient();
	if (db) {
		try {
			const created = await db.geoDrawingRecord.create({
				data: {
					type: input.type,
					label: input.label ?? null,
					points: input.points as unknown as Prisma.InputJsonValue,
					color: input.color ?? null,
					eventId: input.eventId ?? null,
					createdBy: input.createdBy,
					updatedBy: input.updatedBy,
				},
			});
			return toDrawing(created);
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const now = new Date().toISOString();
		const drawing: GeoDrawing = {
			...input,
			id: `gd_${randomUUID()}`,
			createdAt: now,
			updatedAt: now,
		};
		store.drawings.unshift(drawing);
		await writeStore(store);
		return drawing;
	});
}

export async function deleteGeoDrawing(drawingId: string): Promise<boolean> {
	const db = getDbClient();
	if (db) {
		try {
			await db.geoDrawingRecord.delete({ where: { id: drawingId } });
			return true;
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const initialLength = store.drawings.length;
		store.drawings = store.drawings.filter((drawing) => drawing.id !== drawingId);
		if (store.drawings.length === initialLength) return false;
		await writeStore(store);
		return true;
	});
}
