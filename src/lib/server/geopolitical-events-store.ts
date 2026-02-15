import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Prisma } from "@prisma/client";
import type {
	GeoAssetLink,
	GeoEvent,
	GeoEventsStoreFile,
	GeoSourceRef,
} from "@/lib/geopolitical/types";
import type { CreateGeoEventInput, UpdateGeoEventInput } from "@/lib/geopolitical/validation";
import { getPrismaClient } from "@/lib/server/prisma";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const EVENTS_STORE_PATH = path.join(DATA_DIR, "events.json");

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

interface GeoEventDbRecord {
	id: string;
	title: string;
	symbol: string;
	category: string;
	subcategory: string | null;
	status: string;
	severity: number;
	confidence: number;
	countryCodes: unknown;
	regionIds: unknown;
	hotspotIds: unknown;
	coordinates: unknown;
	summary: string | null;
	analystNote: string | null;
	sources: unknown;
	assets: unknown;
	createdAt: Date;
	updatedAt: Date;
	validFrom: Date | null;
	validTo: Date | null;
	createdBy: string;
	updatedBy: string;
}

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

async function ensureStoreDir(): Promise<void> {
	await fs.mkdir(DATA_DIR, { recursive: true });
}

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	const chained = writeChain.then(task, task);
	writeChain = chained.then(
		() => undefined,
		() => undefined,
	);
	return chained;
}

function sortNewestFirst(events: GeoEvent[]): GeoEvent[] {
	return [...events].sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
	);
}

function toGeoEvent(record: GeoEventDbRecord): GeoEvent {
	return {
		id: String(record.id),
		title: String(record.title),
		symbol: String(record.symbol),
		category: String(record.category),
		subcategory: record.subcategory ?? undefined,
		status: record.status as GeoEvent["status"],
		severity: Number(record.severity) as GeoEvent["severity"],
		confidence: Number(record.confidence) as GeoEvent["confidence"],
		countryCodes: Array.isArray(record.countryCodes) ? record.countryCodes : [],
		regionIds: Array.isArray(record.regionIds) ? record.regionIds : [],
		hotspotIds: Array.isArray(record.hotspotIds) ? record.hotspotIds : undefined,
		coordinates: Array.isArray(record.coordinates) ? record.coordinates : undefined,
		summary: record.summary ?? undefined,
		analystNote: record.analystNote ?? undefined,
		sources: Array.isArray(record.sources) ? (record.sources as GeoSourceRef[]) : [],
		assets: Array.isArray(record.assets) ? (record.assets as GeoAssetLink[]) : [],
		createdAt: new Date(record.createdAt).toISOString(),
		updatedAt: new Date(record.updatedAt).toISOString(),
		validFrom: record.validFrom ? new Date(record.validFrom).toISOString() : undefined,
		validTo: record.validTo ? new Date(record.validTo).toISOString() : undefined,
		createdBy: String(record.createdBy),
		updatedBy: String(record.updatedBy),
	};
}

async function readStore(): Promise<GeoEventsStoreFile> {
	try {
		const raw = await fs.readFile(EVENTS_STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as GeoEventsStoreFile;
		if (!parsed || !Array.isArray(parsed.events)) {
			return { events: [] };
		}
		return { events: parsed.events };
	} catch (error: unknown) {
		if (isNodeErrorWithCode(error, "ENOENT")) {
			return { events: [] };
		}
		throw error;
	}
}

async function writeStore(store: GeoEventsStoreFile): Promise<void> {
	await ensureStoreDir();
	await fs.writeFile(EVENTS_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function listGeoEvents(filters?: {
	status?: GeoEvent["status"];
	category?: string;
	regionId?: string;
	minSeverity?: number;
	q?: string;
}): Promise<GeoEvent[]> {
	const db = getDbClient();
	const normalizedQuery = filters?.q?.trim().toLowerCase();
	if (db) {
		try {
			const rows = await db.geoEventRecord.findMany({
				where: {
					...(filters?.status ? { status: filters.status } : {}),
					...(filters?.category ? { category: filters.category } : {}),
					...(Number.isFinite(filters?.minSeverity)
						? { severity: { gte: Number(filters?.minSeverity) } }
						: {}),
				},
				orderBy: { updatedAt: "desc" },
			});

			let mapped = rows.map(toGeoEvent);
			if (filters?.regionId) {
				mapped = mapped.filter((event: GeoEvent) =>
					event.regionIds.includes(filters.regionId as string),
				);
			}
			if (normalizedQuery) {
				mapped = mapped.filter(
					(event: GeoEvent) =>
						event.title.toLowerCase().includes(normalizedQuery) ||
						event.summary?.toLowerCase().includes(normalizedQuery) ||
						event.category.toLowerCase().includes(normalizedQuery),
				);
			}
			return mapped;
		} catch {
			// fall through to file storage
		}
	}

	const store = await readStore();
	let rows = sortNewestFirst(store.events);
	if (filters?.status) rows = rows.filter((event) => event.status === filters.status);
	if (filters?.category) rows = rows.filter((event) => event.category === filters.category);
	if (Number.isFinite(filters?.minSeverity)) {
		rows = rows.filter((event) => event.severity >= Number(filters?.minSeverity));
	}
	if (filters?.regionId) {
		rows = rows.filter((event) => event.regionIds.includes(filters.regionId as string));
	}
	if (normalizedQuery) {
		rows = rows.filter(
			(event) =>
				event.title.toLowerCase().includes(normalizedQuery) ||
				event.summary?.toLowerCase().includes(normalizedQuery) ||
				event.category.toLowerCase().includes(normalizedQuery),
		);
	}
	return rows;
}

export async function getGeoEvent(eventId: string): Promise<GeoEvent | null> {
	const db = getDbClient();
	if (db) {
		try {
			const row = await db.geoEventRecord.findUnique({ where: { id: eventId } });
			return row ? toGeoEvent(row) : null;
		} catch {
			// fall through
		}
	}

	const store = await readStore();
	return store.events.find((event) => event.id === eventId) ?? null;
}

export async function createGeoEvent(input: CreateGeoEventInput, actor: string): Promise<GeoEvent> {
	const db = getDbClient();
	if (db) {
		try {
			const created = await db.geoEventRecord.create({
				data: {
					title: input.title,
					symbol: input.symbol,
					category: input.category,
					status: input.status,
					severity: input.severity,
					confidence: input.confidence,
					countryCodes: input.countryCodes,
					regionIds: input.regionIds,
					hotspotIds: [],
					coordinates: [{ lat: input.lat, lng: input.lng }],
					summary: input.summary ?? null,
					analystNote: input.analystNote ?? null,
					sources: [],
					assets: [],
					createdBy: actor,
					updatedBy: actor,
				},
			});
			return toGeoEvent(created);
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const nowIso = new Date().toISOString();
		const event: GeoEvent = {
			id: `ge_${randomUUID()}`,
			title: input.title,
			category: input.category,
			status: input.status,
			severity: input.severity,
			confidence: input.confidence,
			countryCodes: input.countryCodes,
			regionIds: input.regionIds,
			coordinates: [{ lat: input.lat, lng: input.lng }],
			summary: input.summary,
			analystNote: input.analystNote,
			sources: [],
			assets: [],
			createdAt: nowIso,
			updatedAt: nowIso,
			createdBy: actor,
			updatedBy: actor,
			symbol: input.symbol,
		};

		store.events.unshift(event);
		await writeStore(store);
		return event;
	});
}

export async function updateGeoEvent(
	eventId: string,
	input: UpdateGeoEventInput,
	actor: string,
): Promise<GeoEvent | null> {
	const db = getDbClient();
	if (db) {
		try {
			const existing = await db.geoEventRecord.findUnique({ where: { id: eventId } });
			if (!existing) return null;

			const nextCoordinates: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =
				input.lat !== undefined && input.lng !== undefined
					? ([{ lat: input.lat, lng: input.lng }] as Prisma.InputJsonValue)
					: existing.coordinates === null
						? Prisma.JsonNull
						: (existing.coordinates as Prisma.InputJsonValue);

			const updated = await db.geoEventRecord.update({
				where: { id: eventId },
				data: {
					title: input.title ?? undefined,
					symbol: input.symbol ?? undefined,
					category: input.category ?? undefined,
					status: input.status ?? undefined,
					severity: input.severity ?? undefined,
					confidence: input.confidence ?? undefined,
					summary: input.summary ?? undefined,
					analystNote: input.analystNote ?? undefined,
					countryCodes: input.countryCodes ?? undefined,
					regionIds: input.regionIds ?? undefined,
					coordinates: nextCoordinates,
					updatedBy: actor,
				},
			});

			return toGeoEvent(updated);
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const index = store.events.findIndex((event) => event.id === eventId);
		if (index < 0) {
			return null;
		}

		const current = store.events[index];
		const nextCoordinates =
			input.lat !== undefined && input.lng !== undefined
				? [{ lat: input.lat, lng: input.lng }]
				: current.coordinates;

		const next: GeoEvent = {
			...current,
			title: input.title ?? current.title,
			symbol: input.symbol ?? current.symbol,
			category: input.category ?? current.category,
			status: input.status ?? current.status,
			severity: input.severity ?? current.severity,
			confidence: input.confidence ?? current.confidence,
			summary: input.summary ?? current.summary,
			analystNote: input.analystNote ?? current.analystNote,
			countryCodes: input.countryCodes ?? current.countryCodes,
			regionIds: input.regionIds ?? current.regionIds,
			coordinates: nextCoordinates,
			updatedAt: new Date().toISOString(),
			updatedBy: actor,
		};

		store.events[index] = next;
		await writeStore(store);
		return next;
	});
}

export async function addGeoEventSource(
	eventId: string,
	source: GeoSourceRef,
	actor: string,
): Promise<GeoEvent | null> {
	const event = await getGeoEvent(eventId);
	if (!event) return null;

	const nextSources = [...event.sources, source];
	const db = getDbClient();
	if (db) {
		try {
			const updated = await db.geoEventRecord.update({
				where: { id: eventId },
				data: {
					sources: nextSources as unknown as Prisma.InputJsonValue,
					updatedBy: actor,
				},
			});
			return toGeoEvent(updated);
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const idx = store.events.findIndex((row) => row.id === eventId);
		if (idx < 0) return null;
		store.events[idx] = {
			...store.events[idx],
			sources: nextSources,
			updatedAt: new Date().toISOString(),
			updatedBy: actor,
		};
		await writeStore(store);
		return store.events[idx];
	});
}

export async function addGeoEventAsset(
	eventId: string,
	asset: GeoAssetLink,
	actor: string,
): Promise<GeoEvent | null> {
	const event = await getGeoEvent(eventId);
	if (!event) return null;

	const nextAssets = [...event.assets, asset];
	const db = getDbClient();
	if (db) {
		try {
			const updated = await db.geoEventRecord.update({
				where: { id: eventId },
				data: {
					assets: nextAssets as unknown as Prisma.InputJsonValue,
					updatedBy: actor,
				},
			});
			return toGeoEvent(updated);
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const idx = store.events.findIndex((row) => row.id === eventId);
		if (idx < 0) return null;
		store.events[idx] = {
			...store.events[idx],
			assets: nextAssets,
			updatedAt: new Date().toISOString(),
			updatedBy: actor,
		};
		await writeStore(store);
		return store.events[idx];
	});
}

export async function archiveGeoEvent(eventId: string, actor: string): Promise<GeoEvent | null> {
	return updateGeoEvent(eventId, { status: "archived" }, actor);
}

export async function deleteGeoEvent(eventId: string): Promise<boolean> {
	const db = getDbClient();
	if (db) {
		try {
			await db.geoEventRecord.delete({ where: { id: eventId } });
			return true;
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const initialLength = store.events.length;
		store.events = store.events.filter((event) => event.id !== eventId);
		if (store.events.length === initialLength) {
			return false;
		}
		await writeStore(store);
		return true;
	});
}
