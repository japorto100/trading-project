"use client";

const DB_NAME = "tvf_kg_secure_store";
const DB_VERSION = 1;
const STORE_NAME = "records";

interface CipherRecord {
	id: string;
	alg: "AES-GCM";
	ivB64Url: string;
	ciphertextB64Url: string;
	updatedAt: string;
}

interface KGKeyEnvelopeResponse {
	key: {
		source: "fallback";
		prfSupported: boolean;
		algorithm: string;
		keyMaterialB64Url: string;
	};
}

function toBase64Url(bytes: Uint8Array): string {
	const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
	const padded = value
		.replaceAll("-", "+")
		.replaceAll("_", "/")
		.padEnd(Math.ceil(value.length / 4) * 4, "=");
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onerror = () => reject(request.error ?? new Error("indexedDB open failed"));
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};
		request.onsuccess = () => resolve(request.result);
	});
}

async function getKGCryptoKey(): Promise<CryptoKey> {
	const response = await fetch("/api/auth/kg/encryption-key", {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { Accept: "application/json" },
	});
	const payload = (await response.json()) as KGKeyEnvelopeResponse & { error?: string };
	if (!response.ok || payload.error) {
		throw new Error(payload.error ?? `kg key request failed (${response.status})`);
	}

	const keyBytes = fromBase64Url(payload.key.keyMaterialB64Url);
	return crypto.subtle.importKey("raw", toArrayBuffer(keyBytes), { name: "AES-GCM" }, false, [
		"encrypt",
		"decrypt",
	]);
}

export async function putEncryptedKGRecord(id: string, value: unknown): Promise<CipherRecord> {
	const db = await openDatabase();
	const key = await getKGCryptoKey();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const plaintext = new TextEncoder().encode(JSON.stringify(value));
	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt(
			{
				name: "AES-GCM",
				iv: toArrayBuffer(iv),
			},
			key,
			plaintext,
		),
	);

	const record: CipherRecord = {
		id,
		alg: "AES-GCM",
		ivB64Url: toBase64Url(iv),
		ciphertextB64Url: toBase64Url(ciphertext),
		updatedAt: new Date().toISOString(),
	};

	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).put(record);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? new Error("indexedDB write failed"));
		tx.onabort = () => reject(tx.error ?? new Error("indexedDB write aborted"));
	});

	return record;
}

export async function getEncryptedKGRecordRaw(id: string): Promise<CipherRecord | null> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const req = tx.objectStore(STORE_NAME).get(id);
		req.onsuccess = () => resolve((req.result as CipherRecord | undefined) ?? null);
		req.onerror = () => reject(req.error ?? new Error("indexedDB read failed"));
	});
}

export async function getDecryptedKGRecord<T = unknown>(id: string): Promise<T | null> {
	const raw = await getEncryptedKGRecordRaw(id);
	if (!raw) return null;

	const key = await getKGCryptoKey();
	const iv = fromBase64Url(raw.ivB64Url);
	const ciphertext = fromBase64Url(raw.ciphertextB64Url);
	const plaintext = await crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv: toArrayBuffer(iv),
		},
		key,
		toArrayBuffer(ciphertext),
	);
	return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
