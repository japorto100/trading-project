import { randomUUID } from "node:crypto";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import type { GeoDrawing, GeoDrawingsStoreFile } from "@/lib/geopolitical/types";
import { createLocalStoreAdapter } from "@/lib/server/local-store-adapter";
import { assertPersistenceFallbackAllowed } from "@/lib/server/persistence-policy";
import { getPrismaClient } from "@/lib/server/prisma";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "drawings.json");

const localStore = createLocalStoreAdapter<GeoDrawingsStoreFile>({
	storeName: "geopolitical-drawings-store",
	filePath: STORE_PATH,
	defaultValue: { drawings: [] },
	isValid: (value: unknown): value is GeoDrawingsStoreFile =>
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as GeoDrawingsStoreFile).drawings),
});

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	return localStore.withWriteLock(task);
}

async function readStore(): Promise<GeoDrawingsStoreFile> {
	return localStore.read();
}

async function writeStore(store: GeoDrawingsStoreFile): Promise<void> {
	await localStore.write(store);
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
		} catch (error) {
			assertPersistenceFallbackAllowed("Geo drawings DB list failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Geo drawings DB client unavailable");
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
		} catch (error) {
			assertPersistenceFallbackAllowed("Geo drawings DB create failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Geo drawings DB client unavailable");
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
		} catch (error) {
			assertPersistenceFallbackAllowed("Geo drawings DB delete failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Geo drawings DB client unavailable");
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
