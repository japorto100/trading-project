import { randomUUID } from "node:crypto";
import path from "node:path";
import { getGatewayBaseURL } from "@/lib/server/gateway";
import { createLocalStoreAdapter } from "@/lib/server/local-store-adapter";

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
	snapshots: AnalysisSnapshot[];
}

interface EpisodesGatewayPayload {
	ok?: boolean;
	id?: string;
	created_at?: string;
	total?: number;
	episodes?: Array<Record<string, unknown>>;
	error?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "memory-episodic.json");

const localSnapshotStore = createLocalStoreAdapter<EpisodicStoreFile>({
	storeName: "memory-episodic-store",
	filePath: STORE_PATH,
	defaultValue: { snapshots: [] },
	isValid: (value: unknown): value is EpisodicStoreFile =>
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as EpisodicStoreFile).snapshots),
});

function memoryGatewayBaseURL(): string {
	return new URL("/api/v1/memory", getGatewayBaseURL()).toString();
}

async function readGatewayJSON(response: Response): Promise<EpisodesGatewayPayload> {
	return (await response.json().catch(() => ({}))) as EpisodesGatewayPayload;
}

function daysUntil(retainUntil: string): number {
	const target = Date.parse(retainUntil);
	if (!Number.isFinite(target)) return 90;
	const diffMs = target - Date.now();
	if (diffMs <= 0) return 1;
	return Math.max(1, Math.ceil(diffMs / 86_400_000));
}

function asStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === "string");
}

function asObjectRecord(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return {};
	}
	return value as Record<string, unknown>;
}

function toAgentEpisode(row: Record<string, unknown>): AgentEpisode {
	return {
		id: typeof row.id === "string" ? row.id : "",
		sessionId: typeof row.session_id === "string" ? row.session_id : "",
		agentRole: typeof row.agent_role === "string" ? row.agent_role : "",
		inputJson: typeof row.input_json === "string" ? row.input_json : "{}",
		outputJson: typeof row.output_json === "string" ? row.output_json : "{}",
		toolsUsed: asStringArray(row.tools_used),
		durationMs: typeof row.duration_ms === "number" ? row.duration_ms : 0,
		tokenCount: typeof row.token_count === "number" ? row.token_count : 0,
		confidence: typeof row.confidence === "number" ? row.confidence : 0,
		tags: asStringArray(row.tags),
		metadata: asObjectRecord(row.metadata),
		retainUntil: typeof row.retain_until === "string" ? row.retain_until : "",
		createdAt: typeof row.created_at === "string" ? row.created_at : "",
	};
}

async function postEpisodeToGateway(input: CreateAgentEpisodeInput): Promise<AgentEpisode> {
	const response = await fetch(`${memoryGatewayBaseURL()}/episode`, {
		method: "POST",
		cache: "no-store",
		headers: {
			"Content-Type": "application/json",
			"X-Request-ID": randomUUID(),
		},
		body: JSON.stringify({
			session_id: input.sessionId,
			agent_role: input.agentRole,
			input_json: input.inputJson,
			output_json: input.outputJson,
			tools_used: input.toolsUsed ?? [],
			duration_ms: input.durationMs,
			token_count: input.tokenCount ?? 0,
			confidence: input.confidence ?? 0,
			tags: input.tags ?? [],
			metadata: input.metadata ?? {},
			retain_days: daysUntil(input.retainUntil),
		}),
	});
	const payload = await readGatewayJSON(response);
	if (!response.ok || !payload.id || !payload.created_at) {
		throw new Error(payload.error || "memory episode create failed");
	}
	return {
		id: payload.id,
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
		createdAt: payload.created_at,
	};
}

async function getEpisodesFromGateway(
	agentRole: string | undefined,
	limit: number,
): Promise<AgentEpisode[]> {
	const query = new URLSearchParams({ limit: String(limit) });
	if (agentRole?.trim()) {
		query.set("agentRole", agentRole.trim());
	}
	const response = await fetch(`${memoryGatewayBaseURL()}/episodes?${query.toString()}`, {
		method: "GET",
		cache: "no-store",
		headers: {
			Accept: "application/json",
			"X-Request-ID": randomUUID(),
		},
	});
	const payload = await readGatewayJSON(response);
	if (!response.ok) {
		throw new Error(payload.error || "memory episodes list failed");
	}
	if (!Array.isArray(payload.episodes)) return [];
	return payload.episodes.map((row) => toAgentEpisode(asObjectRecord(row)));
}

async function createAnalysisSnapshotFile(
	input: CreateAnalysisSnapshotInput,
): Promise<AnalysisSnapshot> {
	return localSnapshotStore.withWriteLock(async () => {
		const store = await localSnapshotStore.read();
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
		await localSnapshotStore.write(store);
		return snapshot;
	});
}

async function listAnalysisSnapshotsFile(
	analysisType: string | undefined,
	limit: number,
): Promise<AnalysisSnapshot[]> {
	const store = await localSnapshotStore.read();
	return store.snapshots
		.filter((snapshot) => !analysisType || snapshot.analysisType === analysisType)
		.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
		.slice(0, limit);
}

export async function createAgentEpisode(input: CreateAgentEpisodeInput): Promise<AgentEpisode> {
	return postEpisodeToGateway(input);
}

export async function listAgentEpisodes(agentRole?: string, limit = 100): Promise<AgentEpisode[]> {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 1000) : 100;
	return getEpisodesFromGateway(agentRole, safeLimit);
}

export async function pruneExpiredEpisodes(): Promise<number> {
	// Episodic retention is enforced by the canonical Python memory-service store.
	// This compatibility facade no longer owns local episode persistence.
	return 0;
}

export async function createAnalysisSnapshot(
	input: CreateAnalysisSnapshotInput,
): Promise<AnalysisSnapshot> {
	// No backend-owned snapshots API exists yet. Keep this as an explicit local
	// compatibility helper until an agent-side snapshot contract is defined.
	return createAnalysisSnapshotFile(input);
}

export async function listAnalysisSnapshots(
	analysisType?: string,
	limit = 50,
): Promise<AnalysisSnapshot[]> {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 500) : 50;
	return listAnalysisSnapshotsFile(analysisType, safeLimit);
}
