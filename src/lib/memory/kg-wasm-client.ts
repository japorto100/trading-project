"use client";

/**
 * Client-side KG accessor — lazy-loads the KG sync snapshot from the server
 * and caches it in IndexedDB for offline / fast access.
 *
 * The KG WASM integration (kuzu-wasm) is deferred to Phase 12 when the
 * KGExplorer panel is built. This module handles the sync/cache layer.
 *
 * Encryption: not applied at this layer (data is non-sensitive analytics).
 * IndexedDB key: "tradeview:memory:kg:snapshot"
 */

const IDB_DB_NAME = "tradeview-memory";
const IDB_STORE_NAME = "kg-cache";
const IDB_KEY = "kg-snapshot";
const SYNC_TTL_MS = 60 * 60 * 1000; // 1 hour

interface KGSnapshot {
	stratagems: Array<{
		id: string;
		name: string;
		category: string;
		market_bias: string;
		confidence_base: number;
	}>;
	regimes?: Array<{ id: string; name: string; description: string }>;
}

interface KGCacheEntry {
	snapshot: KGSnapshot;
	checksum: string;
	syncedAt: number; // Unix ms
}

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

async function openIDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(IDB_DB_NAME, 1);
		req.onupgradeneeded = () => {
			req.result.createObjectStore(IDB_STORE_NAME);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function idbGet<T>(key: string): Promise<T | null> {
	const db = await openIDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(IDB_STORE_NAME, "readonly");
		const req = tx.objectStore(IDB_STORE_NAME).get(key);
		req.onsuccess = () => resolve((req.result ?? null) as T | null);
		req.onerror = () => reject(req.error);
	});
}

async function idbSet<T>(key: string, value: T): Promise<void> {
	const db = await openIDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(IDB_STORE_NAME, "readwrite");
		tx.objectStore(IDB_STORE_NAME).put(value, key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the KG snapshot — from IndexedDB cache if fresh, otherwise fetch from API.
 */
export async function getKGSnapshot(forceRefresh = false): Promise<KGSnapshot | null> {
	if (!forceRefresh) {
		const cached = await idbGet<KGCacheEntry>(IDB_KEY);
		if (cached && Date.now() - cached.syncedAt < SYNC_TTL_MS) {
			return cached.snapshot;
		}
	}
	return refreshKGSnapshot();
}

/**
 * Force-fetch the KG snapshot from /api/memory/kg/sync and update the cache.
 */
export async function refreshKGSnapshot(): Promise<KGSnapshot | null> {
	try {
		const res = await fetch("/api/memory/kg/sync", { cache: "no-store" });
		if (!res.ok) return null;
		const data = (await res.json()) as {
			ok: boolean;
			snapshot: KGSnapshot;
			checksum: string;
		};
		if (!data.ok || !data.snapshot) return null;
		const entry: KGCacheEntry = {
			snapshot: data.snapshot,
			checksum: data.checksum ?? "",
			syncedAt: Date.now(),
		};
		await idbSet(IDB_KEY, entry);
		return data.snapshot;
	} catch {
		return null;
	}
}

/**
 * Get all Stratagem nodes from the cached snapshot.
 */
export async function getStratagems() {
	const snapshot = await getKGSnapshot();
	return snapshot?.stratagems ?? [];
}

/**
 * Get all Regime nodes from the cached snapshot.
 */
export async function getRegimes() {
	const snapshot = await getKGSnapshot();
	return snapshot?.regimes ?? [];
}

/**
 * Clear the local KG cache.
 */
export async function clearKGCache(): Promise<void> {
	const db = await openIDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(IDB_STORE_NAME, "readwrite");
		tx.objectStore(IDB_STORE_NAME).delete(IDB_KEY);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
