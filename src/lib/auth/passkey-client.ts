import {
	browserSupportsWebAuthn,
	browserSupportsWebAuthnAutofill,
	platformAuthenticatorIsAvailable,
	startAuthentication,
	startRegistration,
} from "@simplewebauthn/browser";
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { signIn } from "next-auth/react";

type PasskeyScaffoldMode = "scaffold";
type PasskeyFlow = "register" | "authenticate";

interface PasskeyScaffoldMeta {
	mode: PasskeyScaffoldMode;
	flow: PasskeyFlow;
	rpID: string;
}

interface RegisterOptionsMeta extends PasskeyScaffoldMeta {
	flow: "register";
	existingAuthenticators: number;
}

interface AuthenticateOptionsMeta extends PasskeyScaffoldMeta {
	flow: "authenticate";
	allowCredentialsCount: number;
	discoverableAllowed: boolean;
}

interface PasskeyRegisterOptionsResponse {
	options: PublicKeyCredentialCreationOptionsJSON;
	meta: RegisterOptionsMeta;
}

interface PasskeyAuthenticateOptionsResponse {
	options: PublicKeyCredentialRequestOptionsJSON;
	meta: AuthenticateOptionsMeta;
}

export interface PasskeyRegisterVerifyResponse {
	verified: true;
	sessionEstablished: boolean;
	nextStep: string;
	userId: string;
	credential: {
		id: string;
		deviceType: string;
		backedUp: boolean;
		counter: number;
	};
}

export interface PasskeyAuthenticateVerifyResponse {
	verified: true;
	sessionEstablished: boolean;
	nextStep: string;
	user: {
		id: string;
		email: string | null;
		role: string;
	};
	credential: {
		id: string;
		newCounter: number;
		userVerified: boolean;
	};
	sessionBootstrap?: {
		provider: "passkey-scaffold";
		userId: string;
		proof: string;
		expiresAt: number;
	};
}

export interface PasskeySessionExchangeResult {
	ok: boolean;
	status?: number;
	error?: string;
	url?: string | null;
}

interface APIErrorResponse {
	error?: string;
	details?: string;
}

export interface PasskeyBrowserCapabilities {
	webAuthnSupported: boolean;
	platformAuthenticatorAvailable: boolean;
	autofillSupported: boolean;
}

export interface RegisterPasskeyInput {
	email: string;
	displayName?: string;
	nickname?: string;
}

export interface AuthenticatePasskeyInput {
	email?: string;
	useBrowserAutofill?: boolean;
}

export class PasskeyClientError extends Error {
	status: number;
	details?: string;

	constructor(message: string, status: number, details?: string) {
		super(message);
		this.name = "PasskeyClientError";
		this.status = status;
		this.details = details;
	}
}

function assertBrowserContext() {
	if (typeof window === "undefined") {
		throw new PasskeyClientError("passkey client can only run in the browser", 0);
	}
}

async function readJSONSafe<T>(response: Response): Promise<T | null> {
	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
}

async function postJSON<TResponse>(url: string, body: Record<string, unknown>): Promise<TResponse> {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		credentials: "include",
		cache: "no-store",
		body: JSON.stringify(body),
	});

	const payload = await readJSONSafe<TResponse & APIErrorResponse>(response);
	if (!response.ok) {
		throw new PasskeyClientError(
			payload?.error || `passkey request failed (${response.status})`,
			response.status,
			payload?.details,
		);
	}
	if (!payload) {
		throw new PasskeyClientError("empty or invalid passkey response", response.status);
	}
	return payload;
}

function assertPasskeySupported(capabilities: PasskeyBrowserCapabilities) {
	if (!capabilities.webAuthnSupported) {
		throw new PasskeyClientError("WebAuthn is not supported in this browser", 0);
	}
}

export async function getPasskeyBrowserCapabilities(): Promise<PasskeyBrowserCapabilities> {
	assertBrowserContext();
	const webAuthnSupported = browserSupportsWebAuthn();
	if (!webAuthnSupported) {
		return {
			webAuthnSupported,
			platformAuthenticatorAvailable: false,
			autofillSupported: false,
		};
	}

	const [platformAuthenticatorAvailable, autofillSupported] = await Promise.all([
		platformAuthenticatorIsAvailable().catch(() => false),
		browserSupportsWebAuthnAutofill().catch(() => false),
	]);

	return {
		webAuthnSupported,
		platformAuthenticatorAvailable,
		autofillSupported,
	};
}

export async function registerPasskey(
	input: RegisterPasskeyInput,
): Promise<PasskeyRegisterVerifyResponse> {
	assertBrowserContext();
	const capabilities = await getPasskeyBrowserCapabilities();
	assertPasskeySupported(capabilities);

	const optionsPayload = await postJSON<PasskeyRegisterOptionsResponse>(
		"/api/auth/passkeys/register/options",
		{
			email: input.email,
			displayName: input.displayName,
		},
	);

	const credential: RegistrationResponseJSON = await startRegistration(optionsPayload.options);

	return postJSON<PasskeyRegisterVerifyResponse>("/api/auth/passkeys/register/verify", {
		credential,
		nickname: input.nickname,
	});
}

export async function authenticateWithPasskey(
	input: AuthenticatePasskeyInput = {},
): Promise<PasskeyAuthenticateVerifyResponse> {
	assertBrowserContext();
	const capabilities = await getPasskeyBrowserCapabilities();
	assertPasskeySupported(capabilities);

	const optionsPayload = await postJSON<PasskeyAuthenticateOptionsResponse>(
		"/api/auth/passkeys/authenticate/options",
		{
			email: input.email,
		},
	);

	const useBrowserAutofill =
		Boolean(input.useBrowserAutofill) && capabilities.autofillSupported && !input.email;
	const credential: AuthenticationResponseJSON = await startAuthentication(
		optionsPayload.options,
		useBrowserAutofill,
	);

	return postJSON<PasskeyAuthenticateVerifyResponse>("/api/auth/passkeys/authenticate/verify", {
		credential,
	});
}

export async function exchangePasskeySessionBootstrap(
	verify: PasskeyAuthenticateVerifyResponse,
): Promise<PasskeySessionExchangeResult> {
	assertBrowserContext();
	const bootstrap = verify.sessionBootstrap;
	if (!bootstrap) {
		throw new PasskeyClientError("no passkey session bootstrap returned by verify endpoint", 0);
	}

	const result = await signIn(bootstrap.provider, {
		redirect: false,
		userId: bootstrap.userId,
		proof: bootstrap.proof,
	});

	if (!result) {
		throw new PasskeyClientError("empty next-auth signIn response", 0);
	}

	return {
		ok: Boolean(result.ok),
		status: result.status,
		error: result.error ?? undefined,
		url: result.url,
	};
}

export async function authenticateWithPasskeyAndCreateSession(
	input: AuthenticatePasskeyInput = {},
): Promise<{
	verify: PasskeyAuthenticateVerifyResponse;
	session: PasskeySessionExchangeResult;
}> {
	const verify = await authenticateWithPasskey(input);
	const session = await exchangePasskeySessionBootstrap(verify);
	return { verify, session };
}
