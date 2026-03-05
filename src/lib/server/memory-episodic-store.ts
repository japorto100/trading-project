import { randomUUID } from "node:crypto";
import path from "node:path";
import { createLocalStoreAdapter } from "@/lib/server/local-store-adapter";
import { assertPersistenceFallbackAllowed } from "@/lib/server/persistence-policy";
import { getPrismaClient } from "@/lib/server/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentEpisode {
	id: string;
	sessionId: string;
	agentRole: string;
	inputJson: string;
	outputJson: string;
	toolsUsed: string[];
	durationMs: number;
	tokenCount: number;
	confidence: number;
	tags: string[];
	metadata: Record<string, unknown>;
	retainUntil: string;
	createdAt: string;
}

export interface CreateAgentEpisodeInput {
	sessionId: string;
	agentRole: string;
	inputJson: string;
	outputJson: string;
	toolsUsed?: string[];
	durationMs: number;
	tokenCount?: number;
	confidence?: number;
	tags?: string[];
	metadata?: Record<string, unknown>;
	retainUntil: string;
}

export interface AnalysisSnapshot {
	id: string;
	symbol?: string;
	region?: string;
	analysisType: string;
	inputJson: string;
	outputJson: string;
	confidence: number;
	modelId: string;
	retainUntil: string;
	createdAt: string;
}

export interface CreateAnalysisSnapshotInput {
	symbol?: string;
	region?: string;
	analysisType: string;
	inputJson: string;
	outputJson: string;
	confidence?: number;
	modelId: string;
	retainUntil: string;
}

interface EpisodicStoreFile {
	episodes: AgentEpisode[];
	snapshots: AnalysisSnapshot[];
}

// ---------------------------------------------------------------------------
// Local file store (fallback)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "memory-episodic.json");

const localStore = createLocalStoreAdapter<EpisodicStoreFile>({
	storeName: "memory-episodic-store",
	filePath: STORE_PATH,
	defaultValue: { episodes: [], snapshots: [] },
	isValid: (value: unknown): value is EpisodicStoreFile =>
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as EpisodicStoreFile).episodes) &&
		Array.isArray((value as EpisodicStoreFile).snapshots),
});

type DbClient = NonNullable<ReturnType<typeof getPrismaClient>>;

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

function parseJson<T>(raw: string, fallback: T): T {
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

// ---------------------------------------------------------------------------
// DB helpers — AgentEpisode
// ---------------------------------------------------------------------------

interface DbEpisodeRow {
	id: string;
	sessionId: string;
	agentRole: string;
	inputJson: string;
	outputJson: string;
	toolsUsed: string;
	durationMs: number;
	tokenCount: number;
	confidence: number;
	tagsJson: string;
	metadataJson: string;
	retainUntil: Date;
	createdAt: Date;
}

function dbRowToEpisode(row: DbEpisodeRow): AgentEpisode {
	return {
		id: row.id,
		sessionId: row.sessionId,
		agentRole: row.agentRole,
		inputJson: row.inputJson,
		outputJson: row.outputJson,
		toolsUsed: parseJson<string[]>(row.toolsUsed, []),
		durationMs: row.durationMs,
		tokenCount: row.tokenCount,
		confidence: row.confidence,
		tags: parseJson<string[]>(row.tagsJson, []),
		metadata: parseJson<Record<string, unknown>>(row.metadataJson, {}),
		retainUntil: new Date(row.retainUntil).toISOString(),
		createdAt: new Date(row.createdAt).toISOString(),
	};
}

async function createAgentEpisodeDb(
	db: DbClient,
	input: CreateAgentEpisodeInput,
): Promise<AgentEpisode> {
	const row = await db.agentEpisode.create({
		data: {
			sessionId: input.sessionId,
			agentRole: input.agentRole,
			inputJson: input.inputJson,
			outputJson: input.outputJson,
			toolsUsed: JSON.stringify(input.toolsUsed ?? []),
			durationMs: input.durationMs,
			tokenCount: input.tokenCount ?? 0,
			confidence: input.confidence ?? 0,
			tagsJson: JSON.stringify(input.tags ?? []),
			metadataJson: JSON.stringify(input.metadata ?? {}),
			retainUntil: new Date(input.retainUntil),
		},
	});
	return dbRowToEpisode(row as DbEpisodeRow);
}

async function listAgentEpisodesDb(
	db: DbClient,
	agentRole: string | undefined,
	limit: number,
): Promise<AgentEpisode[]> {
	const rows = await db.agentEpisode.findMany({
		where: agentRole ? { agentRole } : undefined,
		orderBy: { createdAt: "desc" },
		take: limit,
	});
	return rows.map((row) => dbRowToEpisode(row as DbEpisodeRow));
}

async function pruneExpiredEpisodesDb(db: DbClient): Promise<number> {
	const result = await db.agentEpisode.deleteMany({
		where: { retainUntil: { lt: new Date() } },
	});
	return result.count;
}

// ---------------------------------------------------------------------------
// DB helpers — AnalysisSnapshot
// ---------------------------------------------------------------------------

interface DbSnapshotRow {
	id: string;
	symbol: string | null;
	region: string | null;
	analysisType: string;
	inputJson: string;
	outputJson: string;
	confidence: number;
	modelId: string;
	retainUntil: Date;
	createdAt: Date;
}

function dbRowToSnapshot(row: DbSnapshotRow): AnalysisSnapshot {
	return {
		id: row.id,
		symbol: row.symbol ?? undefined,
		region: row.region ?? undefined,
		analysisType: row.analysisType,
		inputJson: row.inputJson,
		outputJson: row.outputJson,
		confidence: row.confidence,
		modelId: row.modelId,
		retainUntil: new Date(row.retainUntil).toISOString(),
		createdAt: new Date(row.createdAt).toISOString(),
	};
}

async function createAnalysisSnapshotDb(
	db: DbClient,
	input: CreateAnalysisSnapshotInput,
): Promise<AnalysisSnapshot> {
	const row = await db.analysisSnapshot.create({
		data: {
			symbol: input.symbol ?? null,
			region: input.region ?? null,
			analysisType: input.analysisType,
			inputJson: input.inputJson,
			outputJson: input.outputJson,
			confidence: input.confidence ?? 0,
			modelId: input.modelId,
			retainUntil: new Date(input.retainUntil),
		},
	});
	return dbRowToSnapshot(row as DbSnapshotRow);
}

async function listAnalysisSnapshotsDb(
	db: DbClient,
	analysisType: string | undefined,
	limit: number,
): Promise<AnalysisSnapshot[]> {
	const rows = await db.analysisSnapshot.findMany({
		where: analysisType ? { analysisType } : undefined,
		orderBy: { createdAt: "desc" },
		take: limit,
	});
	return rows.map((row) => dbRowToSnapshot(row as DbSnapshotRow));
}

// ---------------------------------------------------------------------------
// File store helpers — AgentEpisode
// ---------------------------------------------------------------------------

async function createAgentEpisodeFile(input: CreateAgentEpisodeInput): Promise<AgentEpisode> {
	return localStore.withWriteLock(async () => {
		const store = await localStore.read();
		const now = new Date().toISOString();
		const episode: AgentEpisode = {
			id: `ep_${randomUUID()}`,
			sessionId: input.sessionId,
			agentRole: input.agentRole,
			inputJson: input.inputJson,
			outputJson: input.outputJson,
			toolsUsed: input.toolsUsed ?? [],
			durationMs: input.durationMs,
			tokenCount: input.tokenCount ?? 0,
			confidence: input.confidence ?? 0,
			tags: input.tags ?? [],
			metadata: input.metadata ?? {},
			retainUntil: input.retainUntil,
			createdAt: now,
		};
		store.episodes.unshift(episode);
		await localStore.write(store);
		return episode;
	});
}

async function listAgentEpisodesFile(
	agentRole: string | undefined,
	limit: number,
): Promise<AgentEpisode[]> {
	const store = await localStore.read();
	return store.episodes
		.filter((e) => !agentRole || e.agentRole === agentRole)
		.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
		.slice(0, limit);
}

async function pruneExpiredEpisodesFile(): Promise<number> {
	return localStore.withWriteLock(async () => {
		const store = await localStore.read();
		const now = Date.now();
		const before = store.episodes.length;
		store.episodes = store.episodes.filter((e) => Date.parse(e.retainUntil) > now);
		const pruned = before - store.episodes.length;
		if (pruned > 0) await localStore.write(store);
		return pruned;
	});
}

// ---------------------------------------------------------------------------
// File store helpers — AnalysisSnapshot
// ---------------------------------------------------------------------------

async function createAnalysisSnapshotFile(
	input: CreateAnalysisSnapshotInput,
): Promise<AnalysisSnapshot> {
	return localStore.withWriteLock(async () => {
		const store = await localStore.read();
		const now = new Date().toISOString();
		const snapshot: AnalysisSnapshot = {
			id: `snap_${randomUUID()}`,
			symbol: input.symbol,
			region: input.region,
			analysisType: input.analysisType,
			inputJson: input.inputJson,
			outputJson: input.outputJson,
			confidence: input.confidence ?? 0,
			modelId: input.modelId,
			retainUntil: input.retainUntil,
			createdAt: now,
		};
		store.snapshots.unshift(snapshot);
		await localStore.write(store);
		return snapshot;
	});
}

async function listAnalysisSnapshotsFile(
	analysisType: string | undefined,
	limit: number,
): Promise<AnalysisSnapshot[]> {
	const store = await localStore.read();
	return store.snapshots
		.filter((s) => !analysisType || s.analysisType === analysisType)
		.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
		.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function createAgentEpisode(input: CreateAgentEpisodeInput): Promise<AgentEpisode> {
	const db = getDbClient();
	if (db) {
		try {
			return await createAgentEpisodeDb(db, input);
		} catch (error) {
			assertPersistenceFallbackAllowed("AgentEpisode DB write failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("AgentEpisode DB client unavailable");
	}
	return createAgentEpisodeFile(input);
}

export async function listAgentEpisodes(agentRole?: string, limit = 100): Promise<AgentEpisode[]> {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 1000) : 100;
	const db = getDbClient();
	if (db) {
		try {
			return await listAgentEpisodesDb(db, agentRole, safeLimit);
		} catch (error) {
			assertPersistenceFallbackAllowed("AgentEpisode DB read failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("AgentEpisode DB client unavailable");
	}
	return listAgentEpisodesFile(agentRole, safeLimit);
}

export async function pruneExpiredEpisodes(): Promise<number> {
	const db = getDbClient();
	if (db) {
		try {
			return await pruneExpiredEpisodesDb(db);
		} catch (error) {
			assertPersistenceFallbackAllowed("AgentEpisode DB prune failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("AgentEpisode DB client unavailable");
	}
	return pruneExpiredEpisodesFile();
}

export async function createAnalysisSnapshot(
	input: CreateAnalysisSnapshotInput,
): Promise<AnalysisSnapshot> {
	const db = getDbClient();
	if (db) {
		try {
			return await createAnalysisSnapshotDb(db, input);
		} catch (error) {
			assertPersistenceFallbackAllowed("AnalysisSnapshot DB write failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("AnalysisSnapshot DB client unavailable");
	}
	return createAnalysisSnapshotFile(input);
}

export async function listAnalysisSnapshots(
	analysisType?: string,
	limit = 50,
): Promise<AnalysisSnapshot[]> {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 500) : 50;
	const db = getDbClient();
	if (db) {
		try {
			return await listAnalysisSnapshotsDb(db, analysisType, safeLimit);
		} catch (error) {
			assertPersistenceFallbackAllowed("AnalysisSnapshot DB read failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("AnalysisSnapshot DB client unavailable");
	}
	return listAnalysisSnapshotsFile(analysisType, safeLimit);
}
