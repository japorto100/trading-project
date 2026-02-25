import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "hard-signal-deltas.json");

let writeChain: Promise<void> = Promise.resolve();

interface HardSignalDeltaStoreEntry {
	provider: string;
	url: string;
	contentHash: string;
	etag?: string;
	lastModified?: string;
	publishedAt?: string;
	updatedAt: string;
}

interface HardSignalDeltaStoreFile {
	entries: Record<string, HardSignalDeltaStoreEntry>;
}

export interface HardSignalSourceSnapshot {
	provider: string;
	url: string;
	contentHash: string;
	etag?: string;
	lastModified?: string;
	publishedAt?: string;
}

export interface HardSignalSourceDeltaDecision {
	key: string;
	changed: boolean;
	reason:
		| "first_seen"
		| "etag_changed"
		| "last_modified_changed"
		| "published_at_changed"
		| "content_hash_changed"
		| "no_change";
}

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

async function readStore(): Promise<HardSignalDeltaStoreFile> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as HardSignalDeltaStoreFile;
		return parsed?.entries && typeof parsed.entries === "object" ? parsed : { entries: {} };
	} catch (error) {
		if (isNodeErrorWithCode(error, "ENOENT")) {
			return { entries: {} };
		}
		throw error;
	}
}

async function writeStore(store: HardSignalDeltaStoreFile): Promise<void> {
	await ensureStoreDir();
	await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function computeHardSignalContentHash(input: string): string {
	return createHash("sha256").update(input).digest("hex");
}

export function getHardSignalSourceDeltaKey(
	source: Pick<HardSignalSourceSnapshot, "provider" | "url">,
): string {
	return `${source.provider}|${source.url}`;
}

export function evaluateHardSignalSourceDelta(
	previous: HardSignalDeltaStoreEntry | undefined,
	next: HardSignalSourceSnapshot,
): HardSignalSourceDeltaDecision["reason"] {
	if (!previous) return "first_seen";
	if (next.etag && previous.etag && next.etag !== previous.etag) return "etag_changed";
	if (next.lastModified && previous.lastModified && next.lastModified !== previous.lastModified) {
		return "last_modified_changed";
	}
	if (next.publishedAt && previous.publishedAt && next.publishedAt !== previous.publishedAt) {
		return "published_at_changed";
	}
	if (next.contentHash !== previous.contentHash) return "content_hash_changed";
	return "no_change";
}

export async function evaluateAndPersistHardSignalSourceDeltas(
	snapshots: HardSignalSourceSnapshot[],
): Promise<Map<string, HardSignalSourceDeltaDecision>> {
	return withWriteLock(async () => {
		const store = await readStore();
		const now = new Date().toISOString();
		const results = new Map<string, HardSignalSourceDeltaDecision>();

		for (const snapshot of snapshots) {
			const key = getHardSignalSourceDeltaKey(snapshot);
			const previous = store.entries[key];
			const reason = evaluateHardSignalSourceDelta(previous, snapshot);
			results.set(key, { key, changed: reason !== "no_change", reason });
			store.entries[key] = {
				provider: snapshot.provider,
				url: snapshot.url,
				contentHash: snapshot.contentHash,
				etag: snapshot.etag,
				lastModified: snapshot.lastModified,
				publishedAt: snapshot.publishedAt,
				updatedAt: now,
			};
		}

		if (snapshots.length > 0) {
			await writeStore(store);
		}
		return results;
	});
}
