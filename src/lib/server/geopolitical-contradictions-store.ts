import { randomUUID } from "node:crypto";
import path from "node:path";
import type {
	GeoContradiction,
	GeoContradictionEvidence,
	GeoContradictionResolution,
	GeoContradictionsStoreFile,
	GeoSourceRef,
} from "@/lib/geopolitical/types";
import { createLocalStoreAdapter } from "@/lib/server/local-store-adapter";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "contradictions.json");

const localStore = createLocalStoreAdapter<GeoContradictionsStoreFile>({
	storeName: "geopolitical-contradictions-store",
	filePath: STORE_PATH,
	defaultValue: { contradictions: [] },
	isValid: (value: unknown): value is GeoContradictionsStoreFile =>
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as GeoContradictionsStoreFile).contradictions),
});

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	return localStore.withWriteLock(task);
}

async function readStore(): Promise<GeoContradictionsStoreFile> {
	const parsed = await localStore.read();
	return {
		contradictions: parsed.contradictions.map((item) => ({
			...item,
			evidence: Array.isArray(item.evidence) ? item.evidence : [],
			resolution:
				typeof item.resolution === "object" && item.resolution !== null
					? item.resolution
					: undefined,
		})),
	};
}

async function writeStore(store: GeoContradictionsStoreFile): Promise<void> {
	await localStore.write(store);
}

function sortNewestFirst(items: GeoContradiction[]): GeoContradiction[] {
	return [...items].sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
	);
}

export async function listGeoContradictions(filters?: {
	state?: GeoContradiction["state"];
	regionId?: string;
}): Promise<GeoContradiction[]> {
	const store = await readStore();
	let rows = sortNewestFirst(store.contradictions);
	if (filters?.state) rows = rows.filter((row) => row.state === filters.state);
	if (filters?.regionId) rows = rows.filter((row) => row.regionId === filters.regionId);
	return rows;
}

export async function createGeoContradiction(input: {
	title: string;
	severityHint: GeoContradiction["severityHint"];
	regionId?: string;
	countryCode?: string;
	summary?: string;
	statementA: string;
	statementB: string;
	sourceRefs?: GeoSourceRef[];
	candidateIds?: string[];
	createdBy: string;
}): Promise<GeoContradiction> {
	return withWriteLock(async () => {
		const store = await readStore();
		const now = new Date().toISOString();
		const next: GeoContradiction = {
			id: `gctx_${randomUUID()}`,
			title: input.title,
			state: "open",
			severityHint: input.severityHint,
			regionId: input.regionId,
			countryCode: input.countryCode,
			summary: input.summary,
			statementA: input.statementA,
			statementB: input.statementB,
			sourceRefs: input.sourceRefs ?? [],
			candidateIds: input.candidateIds,
			evidence: [],
			createdAt: now,
			updatedAt: now,
			createdBy: input.createdBy,
			updatedBy: input.createdBy,
		};
		store.contradictions.unshift(next);
		await writeStore(store);
		return next;
	});
}

export interface PatchGeoContradictionInput {
	state?: GeoContradiction["state"];
	summary?: string;
	resolution?: {
		outcome?: GeoContradictionResolution["outcome"];
		note?: string;
		mergedEventId?: string;
		mergedCandidateId?: string;
		clear?: boolean;
	};
	addEvidence?: Array<{
		kind: GeoContradictionEvidence["kind"];
		label: string;
		note?: string;
		url?: string;
		candidateId?: string;
		eventId?: string;
	}>;
	removeEvidenceIds?: string[];
}

export async function getGeoContradiction(
	contradictionId: string,
): Promise<GeoContradiction | null> {
	const store = await readStore();
	return store.contradictions.find((item) => item.id === contradictionId) ?? null;
}

export async function updateGeoContradictionState(
	contradictionId: string,
	state: GeoContradiction["state"],
	actor: string,
	options?: PatchGeoContradictionInput,
): Promise<GeoContradiction | null> {
	return withWriteLock(async () => {
		const store = await readStore();
		const index = store.contradictions.findIndex((item) => item.id === contradictionId);
		if (index < 0) return null;
		const current = store.contradictions[index];
		const now = new Date().toISOString();
		let nextEvidence = [...(current.evidence ?? [])];
		if (options?.addEvidence && options.addEvidence.length > 0) {
			const appended = options.addEvidence
				.map((item) => ({
					id: `gctxe_${randomUUID()}`,
					kind: item.kind,
					label: item.label.trim().slice(0, 180),
					note: item.note?.trim().slice(0, 500) || undefined,
					url: item.url?.trim().slice(0, 500) || undefined,
					candidateId: item.candidateId?.trim().slice(0, 64) || undefined,
					eventId: item.eventId?.trim().slice(0, 64) || undefined,
					createdAt: now,
					createdBy: actor,
				}))
				.filter((item) => item.label.length > 0);
			nextEvidence = [...nextEvidence, ...appended];
		}
		if (options?.removeEvidenceIds && options.removeEvidenceIds.length > 0) {
			const removeSet = new Set(options.removeEvidenceIds);
			nextEvidence = nextEvidence.filter((item) => !removeSet.has(item.id));
		}

		let nextResolution = current.resolution;
		if (options?.resolution?.clear) {
			nextResolution = undefined;
		}
		if (options?.resolution && !options.resolution.clear) {
			const prev = current.resolution;
			const hasPayload =
				options.resolution.outcome !== undefined ||
				options.resolution.note !== undefined ||
				options.resolution.mergedEventId !== undefined ||
				options.resolution.mergedCandidateId !== undefined;
			if (hasPayload) {
				nextResolution = {
					outcome: options.resolution.outcome ?? prev?.outcome ?? "defer_monitoring",
					note:
						options.resolution.note !== undefined
							? options.resolution.note.trim().slice(0, 2000) || undefined
							: prev?.note,
					mergedEventId:
						options.resolution.mergedEventId !== undefined
							? options.resolution.mergedEventId.trim().slice(0, 64) || undefined
							: prev?.mergedEventId,
					mergedCandidateId:
						options.resolution.mergedCandidateId !== undefined
							? options.resolution.mergedCandidateId.trim().slice(0, 64) || undefined
							: prev?.mergedCandidateId,
					resolvedAt: now,
					resolvedBy: actor,
				};
			}
		}

		const next: GeoContradiction = {
			...current,
			state,
			summary: options?.summary ?? current.summary,
			evidence: nextEvidence,
			resolution: nextResolution,
			updatedAt: now,
			updatedBy: actor,
		};
		store.contradictions[index] = next;
		await writeStore(store);
		return next;
	});
}
