export const PROVIDER_CREDENTIALS_COOKIE = "tradeview_provider_credentials";
export const PROVIDER_CREDENTIALS_HEADER = "X-Tradeview-Provider-Credentials";

export type StoredProviderCredentials = Record<string, string>;

function normalizeProviderName(provider: string): string {
	return provider.trim().toLowerCase();
}

export function parseProviderCredentialsCookie(raw: string | null | undefined): StoredProviderCredentials {
	if (!raw) return {};

	try {
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		const out: StoredProviderCredentials = {};
		for (const [provider, value] of Object.entries(parsed)) {
			const name = normalizeProviderName(provider);
			const key = typeof value === "string" ? value.trim() : "";
			if (!name || !key) continue;
			out[name] = key;
		}
		return out;
	} catch {
		return {};
	}
}

export function serializeProviderCredentialsCookie(input: Record<string, unknown>): string {
	const normalized = parseProviderCredentialsCookie(JSON.stringify(input));
	return JSON.stringify(normalized);
}

export function encodeProviderCredentialsHeader(
	input: StoredProviderCredentials,
): string | undefined {
	const entries = Object.entries(input)
		.map(([provider, key]) => [normalizeProviderName(provider), key.trim()] as const)
		.filter(([, key]) => key.length > 0);
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
