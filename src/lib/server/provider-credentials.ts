import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const PROVIDER_CREDENTIALS_COOKIE = "tradeview_provider_credentials";
export const PROVIDER_CREDENTIALS_HEADER = "X-Tradeview-Provider-Credentials";

const COOKIE_FORMAT_VERSION = "enc-v1";
const DEFAULT_COOKIE_SECRET = "tradeview-fusion-dev-provider-cookie-secret";
const MAX_PROVIDER_COUNT = 16;
const MAX_PROVIDER_NAME_LENGTH = 64;
const MAX_PROVIDER_KEY_LENGTH = 4096;

export type StoredProviderCredentials = Record<string, string>;

function normalizeProviderName(provider: string): string {
	return provider.trim().toLowerCase();
}

function isAllowedProviderName(provider: string): boolean {
	return /^[a-z0-9_-]+$/.test(provider);
}

function normalizeProviderCredentialValue(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

export function normalizeProviderCredentialsInput(
	input: Record<string, unknown>,
): StoredProviderCredentials {
	const out: StoredProviderCredentials = {};
	const entries = Object.entries(input).slice(0, MAX_PROVIDER_COUNT);
	for (const [provider, rawValue] of entries) {
		const name = normalizeProviderName(provider);
		if (!name || name.length > MAX_PROVIDER_NAME_LENGTH || !isAllowedProviderName(name)) continue;
		const key = normalizeProviderCredentialValue(rawValue);
		if (!key || key.length > MAX_PROVIDER_KEY_LENGTH) continue;
		out[name] = key;
	}
	return out;
}

function resolveProviderCredentialsCookieSecret(): string {
	const configuredSecret =
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET?.trim() ||
		process.env.AUTH_SECRET?.trim() ||
		process.env.NEXTAUTH_SECRET?.trim();
	if (configuredSecret) {
		return configuredSecret;
	}
	if (process.env.NODE_ENV === "production") {
		throw new Error("PROVIDER_CREDENTIALS_COOKIE_SECRET is required in production");
	}
	return DEFAULT_COOKIE_SECRET;
}

function deriveCookieEncryptionKey(secret: string): Buffer {
	return createHash("sha256").update(secret, "utf8").digest();
}

function encodeBase64Url(input: Buffer): string {
	return input.toString("base64url");
}

function decodeBase64Url(input: string): Buffer {
	return Buffer.from(input, "base64url");
}

function encryptProviderCredentialsPayload(payload: string): string {
	const key = deriveCookieEncryptionKey(resolveProviderCredentialsCookieSecret());
	const iv = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const ciphertext = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [
		COOKIE_FORMAT_VERSION,
		encodeBase64Url(iv),
		encodeBase64Url(tag),
		encodeBase64Url(ciphertext),
	].join(".");
}

function decryptProviderCredentialsPayload(raw: string): string | null {
	const parts = raw.split(".");
	if (parts.length !== 4 || parts[0] !== COOKIE_FORMAT_VERSION) {
		return null;
	}
	try {
		const key = deriveCookieEncryptionKey(resolveProviderCredentialsCookieSecret());
		const iv = decodeBase64Url(parts[1]);
		const tag = decodeBase64Url(parts[2]);
		const ciphertext = decodeBase64Url(parts[3]);
		const decipher = createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(tag);
		return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
	} catch {
		return null;
	}
}

export function parseProviderCredentialsCookie(
	raw: string | null | undefined,
): StoredProviderCredentials {
	if (!raw) return {};

	const decryptedPayload = raw.startsWith(`${COOKIE_FORMAT_VERSION}.`)
		? decryptProviderCredentialsPayload(raw)
		: raw;
	if (!decryptedPayload) return {};

	try {
		const parsed = JSON.parse(decryptedPayload) as Record<string, unknown>;
		return normalizeProviderCredentialsInput(parsed);
	} catch {
		return {};
	}
}

export function serializeProviderCredentialsCookie(input: Record<string, unknown>): string {
	const normalized = normalizeProviderCredentialsInput(input);
	return encryptProviderCredentialsPayload(JSON.stringify(normalized));
}

export function encodeProviderCredentialsHeader(
	input: StoredProviderCredentials,
): string | undefined {
	const entries = Object.entries(input)
		.map(([provider, key]) => [normalizeProviderName(provider), key.trim()] as const)
		.filter(
			([provider, key]) =>
				provider.length > 0 &&
				provider.length <= MAX_PROVIDER_NAME_LENGTH &&
				isAllowedProviderName(provider) &&
				key.length > 0 &&
				key.length <= MAX_PROVIDER_KEY_LENGTH,
		)
		.slice(0, MAX_PROVIDER_COUNT);
	if (entries.length === 0) return undefined;

	const payload = Object.fromEntries(entries.map(([provider, key]) => [provider, { key }]));
	return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

export function resolveGatewayProviderCredentialsHeader(params: {
	incomingHeader?: string | null;
	cookieValue?: string | null;
}): string | undefined {
	const header = params.incomingHeader?.trim();
	if (header) return header;
	return encodeProviderCredentialsHeader(parseProviderCredentialsCookie(params.cookieValue));
}
