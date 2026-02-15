import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { findDuplicateCandidate } from "@/lib/geopolitical/dedup";
import type { GeoCandidate, GeoCandidatesStoreFile } from "@/lib/geopolitical/types";
import { getPrismaClient } from "@/lib/server/prisma";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "candidates.json");
const DEFAULT_CANDIDATE_TTL_HOURS = 72;

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

async function readStore(): Promise<GeoCandidatesStoreFile> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as GeoCandidatesStoreFile;
		if (!parsed || !Array.isArray(parsed.candidates)) {
			return { candidates: [] };
		}
		return { candidates: parsed.candidates };
	} catch (error: unknown) {
		if (isNodeErrorWithCode(error, "ENOENT")) return { candidates: [] };
		throw error;
	}
}

async function writeStore(store: GeoCandidatesStoreFile): Promise<void> {
	await ensureStoreDir();
	await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function sortNewestFirst(candidates: GeoCandidate[]): GeoCandidate[] {
	return [...candidates].sort(
		(a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
	);
}

function getCandidateTtlHours(): number {
	const parsed = Number(process.env.GEOPOLITICAL_CANDIDATE_TTL_HOURS);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CANDIDATE_TTL_HOURS;
}

function getCandidateExpiryCutoff(now = Date.now()): Date {
	return new Date(now - getCandidateTtlHours() * 60 * 60 * 1000);
}

function isStaleOpenCandidate(
	candidate: Pick<GeoCandidate, "state" | "generatedAt">,
	nowMs: number,
): boolean {
	if (candidate.state !== "open") return false;
	const generatedAtMs = new Date(candidate.generatedAt).getTime();
	if (!Number.isFinite(generatedAtMs)) return false;
	return generatedAtMs <= nowMs - getCandidateTtlHours() * 60 * 60 * 1000;
}

type DbClient = NonNullable<ReturnType<typeof getPrismaClient>>;

interface GeoCandidateDbRecord {
	id: string;
	generatedAt: Date;
	triggerType: string;
	confidence: number;
	severityHint: number;
	headline: string;
	regionHint: string | null;
	countryHints: unknown;
	sourceRefs: unknown;
	mergedIntoEventId: string | null;
	state: string;
	reviewNote: string | null;
	symbol: string | null;
	category: string | null;
	hotspotIds: unknown;
}

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

function toCandidate(record: GeoCandidateDbRecord): GeoCandidate {
	return {
		id: String(record.id),
		generatedAt: new Date(record.generatedAt).toISOString(),
		triggerType: record.triggerType as GeoCandidate["triggerType"],
		confidence: Number(record.confidence),
		severityHint: Number(record.severityHint) as GeoCandidate["severityHint"],
		headline: String(record.headline),
		regionHint: record.regionHint ?? undefined,
		countryHints: Array.isArray(record.countryHints)
			? (record.countryHints as string[])
			: undefined,
		sourceRefs: Array.isArray(record.sourceRefs) ? record.sourceRefs : [],
		mergedIntoEventId: record.mergedIntoEventId ?? undefined,
		state: record.state as GeoCandidate["state"],
		reviewNote: record.reviewNote ?? undefined,
		symbol: record.symbol ?? undefined,
		category: record.category ?? undefined,
		hotspotIds: Array.isArray(record.hotspotIds) ? (record.hotspotIds as string[]) : undefined,
	};
}

export async function listGeoCandidates(filters?: {
	state?: GeoCandidate["state"];
	regionHint?: string;
	minConfidence?: number;
	q?: string;
}): Promise<GeoCandidate[]> {
	await expireStaleGeoCandidates();

	const db = getDbClient();
	const state = filters?.state;
	const regionHint = filters?.regionHint?.trim();
	const minConfidence = Number.isFinite(filters?.minConfidence)
		? Number(filters?.minConfidence)
		: undefined;
	const query = filters?.q?.trim().toLowerCase();

	if (db) {
		try {
			const rows = await db.geoCandidateRecord.findMany({
				where: {
					...(state ? { state } : {}),
					...(regionHint ? { regionHint } : {}),
					...(minConfidence !== undefined ? { confidence: { gte: minConfidence } } : {}),
				},
				orderBy: { generatedAt: "desc" },
			});

			const mapped = rows.map(toCandidate);
			if (!query) return mapped;
			return mapped.filter((candidate: GeoCandidate) =>
				candidate.headline.toLowerCase().includes(query),
			);
		} catch {
			// fall through
		}
	}

	const store = await readStore();
	let rows = sortNewestFirst(store.candidates);
	if (state) rows = rows.filter((candidate) => candidate.state === state);
	if (regionHint) rows = rows.filter((candidate) => candidate.regionHint === regionHint);
	if (minConfidence !== undefined)
		rows = rows.filter((candidate) => candidate.confidence >= minConfidence);
	if (query) rows = rows.filter((candidate) => candidate.headline.toLowerCase().includes(query));
	return rows;
}

export async function createGeoCandidate(
	input: Omit<GeoCandidate, "id" | "generatedAt" | "state"> & {
		generatedAt?: string;
		state?: GeoCandidate["state"];
	},
): Promise<{ candidate: GeoCandidate; deduped: boolean }> {
	await expireStaleGeoCandidates();

	const db = getDbClient();
	if (db) {
		try {
			const existingRows = await db.geoCandidateRecord.findMany({
				where: {
					state: { in: ["open", "snoozed"] },
				},
				orderBy: { generatedAt: "desc" },
				take: 300,
			});
			const existing = existingRows.map(toCandidate);
			const incoming = {
				headline: input.headline,
				sourceRefs: input.sourceRefs,
				generatedAt: input.generatedAt ?? new Date().toISOString(),
			};
			const duplicate = findDuplicateCandidate(incoming, existing);
			if (duplicate) {
				return { candidate: duplicate, deduped: true };
			}

			const created = await db.geoCandidateRecord.create({
				data: {
					triggerType: input.triggerType,
					confidence: input.confidence,
					severityHint: input.severityHint,
					headline: input.headline,
					regionHint: input.regionHint ?? null,
					countryHints: (input.countryHints ?? []) as unknown as Prisma.InputJsonValue,
					sourceRefs: (input.sourceRefs ?? []) as unknown as Prisma.InputJsonValue,
					mergedIntoEventId: input.mergedIntoEventId ?? null,
					state: input.state ?? "open",
					reviewNote: input.reviewNote ?? null,
					symbol: input.symbol ?? null,
					category: input.category ?? null,
					hotspotIds: (input.hotspotIds ?? []) as unknown as Prisma.InputJsonValue,
					generatedAt: input.generatedAt ? new Date(input.generatedAt) : new Date(),
				},
			});
			return { candidate: toCandidate(created), deduped: false };
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const incoming = {
			headline: input.headline,
			sourceRefs: input.sourceRefs,
			generatedAt: input.generatedAt ?? new Date().toISOString(),
		};
		const duplicate = findDuplicateCandidate(incoming, store.candidates);
		if (duplicate) {
			return { candidate: duplicate, deduped: true };
		}

		const candidate: GeoCandidate = {
			id: `gc_${randomUUID()}`,
			generatedAt: input.generatedAt ?? new Date().toISOString(),
			triggerType: input.triggerType,
			confidence: input.confidence,
			severityHint: input.severityHint,
			headline: input.headline,
			regionHint: input.regionHint,
			countryHints: input.countryHints,
			sourceRefs: input.sourceRefs,
			mergedIntoEventId: input.mergedIntoEventId,
			state: input.state ?? "open",
			reviewNote: input.reviewNote,
			symbol: input.symbol,
			category: input.category,
			hotspotIds: input.hotspotIds,
		};

		store.candidates.unshift(candidate);
		await writeStore(store);
		return { candidate, deduped: false };
	});
}

export async function updateGeoCandidateState(
	candidateId: string,
	state: GeoCandidate["state"],
	options?: { reviewNote?: string; mergedIntoEventId?: string },
): Promise<GeoCandidate | null> {
	const db = getDbClient();
	if (db) {
		try {
			const updated = await db.geoCandidateRecord.update({
				where: { id: candidateId },
				data: {
					state,
					reviewNote: options?.reviewNote ?? undefined,
					mergedIntoEventId: options?.mergedIntoEventId ?? undefined,
				},
			});
			return toCandidate(updated);
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		const index = store.candidates.findIndex((candidate) => candidate.id === candidateId);
		if (index < 0) return null;
		const next: GeoCandidate = {
			...store.candidates[index],
			state,
			reviewNote: options?.reviewNote ?? store.candidates[index].reviewNote,
			mergedIntoEventId: options?.mergedIntoEventId ?? store.candidates[index].mergedIntoEventId,
		};
		store.candidates[index] = next;
		await writeStore(store);
		return next;
	});
}

export async function getGeoCandidate(candidateId: string): Promise<GeoCandidate | null> {
	await expireStaleGeoCandidates();

	const db = getDbClient();
	if (db) {
		try {
			const row = await db.geoCandidateRecord.findUnique({ where: { id: candidateId } });
			return row ? toCandidate(row) : null;
		} catch {
			// fall through
		}
	}

	const store = await readStore();
	return store.candidates.find((candidate) => candidate.id === candidateId) ?? null;
}

export async function expireStaleGeoCandidates(): Promise<number> {
	const nowMs = Date.now();
	const cutoff = getCandidateExpiryCutoff(nowMs);
	const db = getDbClient();

	if (db) {
		try {
			const result = await db.geoCandidateRecord.updateMany({
				where: {
					state: "open",
					generatedAt: { lte: cutoff },
				},
				data: {
					state: "expired",
				},
			});
			return Number(result?.count ?? 0);
		} catch {
			// fall through
		}
	}

	return withWriteLock(async () => {
		const store = await readStore();
		let changed = 0;
		store.candidates = store.candidates.map((candidate) => {
			if (!isStaleOpenCandidate(candidate, nowMs)) {
				return candidate;
			}
			changed += 1;
			return {
				...candidate,
				state: "expired",
			};
		});
		if (changed > 0) {
			await writeStore(store);
		}
		return changed;
	});
}
