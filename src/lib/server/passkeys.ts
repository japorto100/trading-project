import { Buffer } from "node:buffer";
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
	AuthenticationResponseJSON,
	AuthenticatorTransportFuture,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { type NextRequest, NextResponse } from "next/server";
import { createPasskeySessionBootstrap } from "@/lib/server/passkey-session-bootstrap";

const REG_CHALLENGE_COOKIE = "tvf_passkey_reg_challenge";
const AUTH_CHALLENGE_COOKIE = "tvf_passkey_auth_challenge";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

type PasskeyFlow = "register" | "authenticate";

interface ChallengeCookiePayload {
	flow: PasskeyFlow;
	challenge: string;
	expiresAt: number;
	userId?: string;
	email?: string;
}

interface WebAuthnRuntimeConfig {
	rpID: string;
	rpName: string;
	expectedOrigins: string[];
}

type JsonResponse = { error: string; details?: string };

type GoPasskeyUser = {
	id: string;
	email?: string | null;
	name?: string | null;
	role?: string | null;
};

type GoPasskeyAuthenticator = {
	id: string;
	name?: string | null;
	credentialId: string;
	deviceType: string;
	backedUp: boolean;
	counter: number;
	transports: string[];
	createdAt: string;
	lastUsedAt?: string | null;
};

function isPasskeyScaffoldEnabled(): boolean {
	return (process.env.AUTH_PASSKEY_SCAFFOLD_ENABLED ?? "false").trim().toLowerCase() === "true";
}

function isAuthSessionScaffoldEnabled(): boolean {
	return (process.env.NEXT_PUBLIC_ENABLE_AUTH ?? "false").trim().toLowerCase() === "true";
}

export function passkeyFeatureDisabledResponse(): NextResponse<JsonResponse> {
	return NextResponse.json(
		{ error: "passkey auth scaffold disabled" },
		{ status: 501, headers: { "Cache-Control": "no-store" } },
	);
}

export function resolveWebAuthnConfig(request: NextRequest): WebAuthnRuntimeConfig {
	const requestOrigin = request.nextUrl.origin;
	const configuredOrigins = (process.env.AUTH_WEBAUTHN_ORIGINS ?? "")
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);
	const expectedOrigins = configuredOrigins.length > 0 ? configuredOrigins : [requestOrigin];
	const rpID = (process.env.AUTH_WEBAUTHN_RP_ID ?? request.nextUrl.hostname).trim();
	const rpName =
		(process.env.AUTH_WEBAUTHN_RP_NAME ?? "TradeView Fusion").trim() || "TradeView Fusion";
	return {
		rpID,
		rpName,
		expectedOrigins,
	};
}

function challengeCookieName(flow: PasskeyFlow): string {
	return flow === "register" ? REG_CHALLENGE_COOKIE : AUTH_CHALLENGE_COOKIE;
}

function encodeChallengeCookie(payload: ChallengeCookiePayload): string {
	return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeChallengeCookie(value: string | undefined): ChallengeCookiePayload | null {
	if (!value) return null;
	try {
		const parsed = JSON.parse(
			Buffer.from(value, "base64url").toString("utf8"),
		) as Partial<ChallengeCookiePayload>;
		if (parsed.flow !== "register" && parsed.flow !== "authenticate") return null;
		if (typeof parsed.challenge !== "string" || !parsed.challenge.trim()) return null;
		if (typeof parsed.expiresAt !== "number" || !Number.isFinite(parsed.expiresAt)) return null;
		return {
			flow: parsed.flow,
			challenge: parsed.challenge,
			expiresAt: parsed.expiresAt,
			userId: typeof parsed.userId === "string" ? parsed.userId : undefined,
			email: typeof parsed.email === "string" ? parsed.email : undefined,
		};
	} catch {
		return null;
	}
}

export function setPasskeyChallengeCookie(
	request: NextRequest,
	response: NextResponse,
	flow: PasskeyFlow,
	payload: Omit<ChallengeCookiePayload, "flow" | "expiresAt">,
) {
	const cookiePayload: ChallengeCookiePayload = {
		flow,
		challenge: payload.challenge,
		userId: payload.userId,
		email: payload.email,
		expiresAt: Date.now() + CHALLENGE_TTL_MS,
	};
	response.cookies.set(challengeCookieName(flow), encodeChallengeCookie(cookiePayload), {
		httpOnly: true,
		secure: request.nextUrl.protocol === "https:",
		sameSite: "strict",
		path: "/",
		maxAge: Math.floor(CHALLENGE_TTL_MS / 1000),
	});
}

export function clearPasskeyChallengeCookie(
	request: NextRequest,
	response: NextResponse,
	flow: PasskeyFlow,
) {
	response.cookies.set(challengeCookieName(flow), "", {
		httpOnly: true,
		secure: request.nextUrl.protocol === "https:",
		sameSite: "strict",
		path: "/",
		maxAge: 0,
	});
}

function readPasskeyChallengeCookie(
	request: NextRequest,
	flow: PasskeyFlow,
): ChallengeCookiePayload | null {
	const parsed = decodeChallengeCookie(request.cookies.get(challengeCookieName(flow))?.value);
	if (!parsed || parsed.flow !== flow) return null;
	if (parsed.expiresAt < Date.now()) return null;
	return parsed;
}

function normalizeEmail(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const email = value.trim().toLowerCase();
	if (!email || !email.includes("@")) return null;
	return email;
}

function normalizeDisplayName(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const displayName = value.trim();
	return displayName ? displayName.slice(0, 80) : null;
}

function isAuthenticatorTransport(value: string): value is AuthenticatorTransportFuture {
	return ["ble", "cable", "hybrid", "internal", "nfc", "smart-card", "usb"].includes(value);
}

function encodeUint8ArrayBase64URL(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString("base64url");
}

function decodeUint8ArrayBase64URL(value: string): Uint8Array {
	const buffer = Buffer.from(value, "base64url");
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

function parseRegistrationBody(
	body: unknown,
): { email: string; displayName: string | null } | null {
	if (!body || typeof body !== "object") return null;
	const candidate = body as Record<string, unknown>;
	const email = normalizeEmail(candidate.email);
	if (!email) return null;
	return {
		email,
		displayName: normalizeDisplayName(candidate.displayName),
	};
}

function parseAuthOptionsBody(body: unknown): { email: string | null } | null {
	if (!body || typeof body !== "object") return { email: null };
	const candidate = body as Record<string, unknown>;
	return {
		email: normalizeEmail(candidate.email),
	};
}

function parseVerifyBody<T extends "register" | "authenticate">(
	body: unknown,
	mode: T,
):
	| (T extends "register"
			? { credential: RegistrationResponseJSON; nickname: string | null }
			: { credential: AuthenticationResponseJSON })
	| null {
	if (!body || typeof body !== "object") return null;
	const candidate = body as Record<string, unknown>;
	if (!candidate.credential || typeof candidate.credential !== "object") return null;

	if (mode === "register") {
		return {
			credential: candidate.credential as RegistrationResponseJSON,
			nickname: normalizeDisplayName(candidate.nickname),
		} as T extends "register"
			? { credential: RegistrationResponseJSON; nickname: string | null }
			: never;
	}

	return {
		credential: candidate.credential as AuthenticationResponseJSON,
	} as T extends "register" ? never : { credential: AuthenticationResponseJSON };
}

function noStoreJson<T>(body: T, init?: ResponseInit): NextResponse<T> {
	const response = NextResponse.json(body, init);
	response.headers.set("Cache-Control", "no-store");
	return response;
}

function getGoGatewayUrl(): string {
	return process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
}

async function postGoPasskeyAction<T>(path: string, body: Record<string, unknown>): Promise<T> {
	const response = await fetch(`${getGoGatewayUrl()}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		cache: "no-store",
	});
	const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
	if (!response.ok) {
		throw new Error(
			typeof payload.error === "string" && payload.error.trim() !== ""
				? payload.error
				: `Go passkey action failed with ${response.status}`,
		);
	}
	return payload as T;
}

export async function handlePasskeyRegistrationOptions(
	request: NextRequest,
): Promise<
	NextResponse<
		| JsonResponse
		| { options: PublicKeyCredentialCreationOptionsJSON; meta: Record<string, unknown> }
	>
> {
	if (!isPasskeyScaffoldEnabled()) {
		return passkeyFeatureDisabledResponse();
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return noStoreJson({ error: "invalid json body" }, { status: 400 });
	}
	const parsed = parseRegistrationBody(body);
	if (!parsed) {
		return noStoreJson({ error: "email is required" }, { status: 400 });
	}

	const context = await postGoPasskeyAction<{
		user: GoPasskeyUser;
		authenticators: GoPasskeyAuthenticator[];
	}>("/api/v1/auth/passkeys/registration-context", {
		email: parsed.email,
		displayName: parsed.displayName,
		role: (process.env.AUTH_DEFAULT_ROLE ?? "viewer").trim() || "viewer",
	});
	const user = context.user;

	const cfg = resolveWebAuthnConfig(request);
	const options = await generateRegistrationOptions({
		rpName: cfg.rpName,
		rpID: cfg.rpID,
		userName: user.email ?? parsed.email,
		userDisplayName: parsed.displayName ?? user.name ?? user.email ?? "user",
		userID: Buffer.from(user.id, "utf8"),
		excludeCredentials: context.authenticators.map((authenticator) => ({
			id: authenticator.credentialId,
			transports: authenticator.transports?.filter(isAuthenticatorTransport),
		})),
		authenticatorSelection: {
			residentKey: "preferred",
			userVerification: "preferred",
		},
		attestationType: "none",
	});

	const response = noStoreJson({
		options,
		meta: {
			mode: "scaffold",
			flow: "register",
			existingAuthenticators: context.authenticators.length,
			rpID: cfg.rpID,
		},
	});
	setPasskeyChallengeCookie(request, response, "register", {
		challenge: options.challenge,
		userId: user.id,
		email: user.email ?? parsed.email,
	});
	return response;
}

export async function handlePasskeyRegistrationVerify(
	request: NextRequest,
): Promise<NextResponse<JsonResponse | Record<string, unknown>>> {
	if (!isPasskeyScaffoldEnabled()) {
		return passkeyFeatureDisabledResponse();
	}
	const challenge = readPasskeyChallengeCookie(request, "register");
	if (!challenge?.challenge || !challenge.userId) {
		return noStoreJson({ error: "missing or expired registration challenge" }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return noStoreJson({ error: "invalid json body" }, { status: 400 });
	}
	const parsed = parseVerifyBody(body, "register");
	if (!parsed) {
		return noStoreJson({ error: "credential payload is required" }, { status: 400 });
	}

	const cfg = resolveWebAuthnConfig(request);
	let verification: Awaited<ReturnType<typeof verifyRegistrationResponse>>;
	try {
		verification = await verifyRegistrationResponse({
			response: parsed.credential,
			expectedChallenge: challenge.challenge,
			expectedOrigin: cfg.expectedOrigins,
			expectedRPID: cfg.rpID,
			requireUserVerification: false,
		});
	} catch (error: unknown) {
		return noStoreJson(
			{
				error: "registration verification failed",
				details: error instanceof Error ? error.message : "unknown error",
			},
			{ status: 400 },
		);
	}

	if (!verification.verified || !verification.registrationInfo) {
		return noStoreJson({ error: "registration not verified" }, { status: 400 });
	}

	const info = verification.registrationInfo;
	await postGoPasskeyAction<{ authenticator: GoPasskeyAuthenticator }>(
		"/api/v1/auth/passkeys/registration-verify",
		{
			userId: challenge.userId,
			providerAccountId: info.credentialID,
			credentialId: info.credentialID,
			credentialPublicKey: encodeUint8ArrayBase64URL(info.credentialPublicKey),
			counter: info.counter,
			credentialDeviceType: info.credentialDeviceType,
			credentialBackedUp: info.credentialBackedUp,
			transports: parsed.credential.response.transports ?? [],
			name: parsed.nickname ?? "Passkey",
		},
	);

	const response = noStoreJson({
		verified: true,
		sessionEstablished: false,
		nextStep: "wire-passkey-verify-to-next-auth-session",
		userId: challenge.userId,
		credential: {
			id: info.credentialID,
			deviceType: info.credentialDeviceType,
			backedUp: info.credentialBackedUp,
			counter: info.counter,
		},
	});
	clearPasskeyChallengeCookie(request, response, "register");
	return response;
}

export async function handlePasskeyAuthenticationOptions(
	request: NextRequest,
): Promise<
	NextResponse<
		JsonResponse | { options: PublicKeyCredentialRequestOptionsJSON; meta: Record<string, unknown> }
	>
> {
	if (!isPasskeyScaffoldEnabled()) {
		return passkeyFeatureDisabledResponse();
	}
	let body: unknown = {};
	try {
		body = await request.json();
	} catch {
		// allow empty body
	}
	const parsed = parseAuthOptionsBody(body);
	if (!parsed) {
		return noStoreJson({ error: "invalid body" }, { status: 400 });
	}

	const context = parsed.email
		? await postGoPasskeyAction<{
				user: GoPasskeyUser | null;
				authenticators: GoPasskeyAuthenticator[];
			}>("/api/v1/auth/passkeys/authentication-context", { email: parsed.email })
		: { user: null, authenticators: [] };

	const cfg = resolveWebAuthnConfig(request);
	const options = await generateAuthenticationOptions({
		rpID: cfg.rpID,
		allowCredentials: context.user
			? context.authenticators.map((authenticator) => ({
					id: authenticator.credentialId,
					transports: authenticator.transports?.filter(isAuthenticatorTransport),
				}))
			: undefined,
		userVerification: "preferred",
	});

	const response = noStoreJson({
		options,
		meta: {
			mode: "scaffold",
			flow: "authenticate",
			allowCredentialsCount: context.authenticators.length,
			discoverableAllowed: !context.user,
			rpID: cfg.rpID,
		},
	});
	setPasskeyChallengeCookie(request, response, "authenticate", {
		challenge: options.challenge,
		userId: context.user?.id,
		email: parsed.email ?? undefined,
	});
	return response;
}

export async function handlePasskeyAuthenticationVerify(
	request: NextRequest,
): Promise<NextResponse<JsonResponse | Record<string, unknown>>> {
	if (!isPasskeyScaffoldEnabled()) {
		return passkeyFeatureDisabledResponse();
	}
	const challenge = readPasskeyChallengeCookie(request, "authenticate");
	if (!challenge?.challenge) {
		return noStoreJson({ error: "missing or expired authentication challenge" }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return noStoreJson({ error: "invalid json body" }, { status: 400 });
	}
	const parsed = parseVerifyBody(body, "authenticate");
	if (!parsed) {
		return noStoreJson({ error: "credential payload is required" }, { status: 400 });
	}

	let record: {
		authenticator: GoPasskeyAuthenticator;
		user: GoPasskeyUser;
		credentialPublicKey: string;
	};
	try {
		record = await postGoPasskeyAction<{
			authenticator: GoPasskeyAuthenticator;
			user: GoPasskeyUser;
			credentialPublicKey: string;
		}>("/api/v1/auth/passkeys/credential-record", {
			credentialId: parsed.credential.id,
		});
	} catch (error: unknown) {
		return noStoreJson(
			{ error: error instanceof Error ? error.message : "authenticator not found" },
			{ status: 404 },
		);
	}

	const cfg = resolveWebAuthnConfig(request);
	let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>;
	try {
		verification = await verifyAuthenticationResponse({
			response: parsed.credential,
			expectedChallenge: challenge.challenge,
			expectedOrigin: cfg.expectedOrigins,
			expectedRPID: cfg.rpID,
			authenticator: {
				credentialID: record.authenticator.credentialId,
				credentialPublicKey: decodeUint8ArrayBase64URL(record.credentialPublicKey),
				counter: record.authenticator.counter,
				transports: record.authenticator.transports?.filter(isAuthenticatorTransport),
			},
			requireUserVerification: false,
		});
	} catch (error: unknown) {
		return noStoreJson(
			{
				error: "authentication verification failed",
				details: error instanceof Error ? error.message : "unknown error",
			},
			{ status: 400 },
		);
	}

	if (!verification.verified) {
		return noStoreJson({ error: "authentication not verified" }, { status: 400 });
	}

	await postGoPasskeyAction<{ authenticator: GoPasskeyAuthenticator; user: GoPasskeyUser }>(
		"/api/v1/auth/passkeys/authentication-verify",
		{
			credentialId: record.authenticator.credentialId,
			counter: verification.authenticationInfo.newCounter,
			credentialDeviceType: verification.authenticationInfo.credentialDeviceType,
			credentialBackedUp: verification.authenticationInfo.credentialBackedUp,
		},
	);

	const response = noStoreJson({
		verified: true,
		sessionEstablished: false,
		nextStep: "exchange-passkey-verification-for-next-auth-session",
		user: {
			id: record.user.id,
			email: record.user.email ?? null,
			role: record.user.role ?? "viewer",
		},
		credential: {
			id: verification.authenticationInfo.credentialID,
			newCounter: verification.authenticationInfo.newCounter,
			userVerified: verification.authenticationInfo.userVerified,
		},
		...(isAuthSessionScaffoldEnabled()
			? {
					sessionBootstrap: {
						provider: "passkey-scaffold",
						userId: record.user.id,
						...createPasskeySessionBootstrap({
							userId: record.user.id,
							email: record.user.email ?? null,
							role: record.user.role ?? "viewer",
						}),
					},
				}
			: {}),
	});
	clearPasskeyChallengeCookie(request, response, "authenticate");
	return response;
}
