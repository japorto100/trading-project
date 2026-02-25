"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	authenticateWithPasskey,
	authenticateWithPasskeyAndCreateSession,
	getPasskeyBrowserCapabilities,
	type PasskeyAuthenticateVerifyResponse,
	type PasskeyBrowserCapabilities,
	PasskeyClientError,
	type PasskeyRegisterVerifyResponse,
	type PasskeySessionExchangeResult,
	registerPasskey,
} from "@/lib/auth/passkey-client";

type LabResult =
	| { kind: "none" }
	| { kind: "capabilities"; data: PasskeyBrowserCapabilities }
	| { kind: "register"; data: PasskeyRegisterVerifyResponse }
	| { kind: "authenticate"; data: PasskeyAuthenticateVerifyResponse }
	| {
			kind: "authenticate-session";
			data: {
				verify: PasskeyAuthenticateVerifyResponse;
				session: PasskeySessionExchangeResult;
			};
	  }
	| { kind: "error"; message: string; status?: number; details?: string };

function stringifyResult(result: LabResult): string {
	if (result.kind === "none") return "No result yet.";
	if (result.kind === "error") {
		return JSON.stringify(
			{
				error: result.message,
				status: result.status,
				details: result.details,
			},
			null,
			2,
		);
	}
	return JSON.stringify(result.data, null, 2);
}

function getErrorPayload(error: unknown): Extract<LabResult, { kind: "error" }> {
	if (error instanceof PasskeyClientError) {
		return {
			kind: "error",
			message: error.message,
			status: error.status,
			details: error.details,
		};
	}
	if (error instanceof Error) {
		return {
			kind: "error",
			message: error.message,
		};
	}
	return {
		kind: "error",
		message: "Unknown passkey error",
	};
}

export function PasskeyScaffoldLab() {
	const [email, setEmail] = useState("trader@example.com");
	const [displayName, setDisplayName] = useState("Trader");
	const [nickname, setNickname] = useState("Primary Passkey");
	const [authEmail, setAuthEmail] = useState("trader@example.com");
	const [loadingAction, setLoadingAction] = useState<string | null>(null);
	const [result, setResult] = useState<LabResult>({ kind: "none" });

	const runAction = async <T,>(
		action: string,
		fn: () => Promise<T>,
		map: (data: T) => LabResult,
	) => {
		setLoadingAction(action);
		try {
			const data = await fn();
			setResult(map(data));
		} catch (error: unknown) {
			setResult(getErrorPayload(error));
		} finally {
			setLoadingAction(null);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Passkey Scaffold Lab</CardTitle>
					<CardDescription>
						Manual test surface for Phase 1a scaffold endpoints (`/api/auth/passkeys/*`).
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="passkey-email">Register email</Label>
							<Input
								id="passkey-email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								autoComplete="email"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="passkey-display">Display name</Label>
							<Input
								id="passkey-display"
								value={displayName}
								onChange={(event) => setDisplayName(event.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="passkey-nickname">Device nickname</Label>
							<Input
								id="passkey-nickname"
								value={nickname}
								onChange={(event) => setNickname(event.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="passkey-auth-email">Auth email (optional)</Label>
							<Input
								id="passkey-auth-email"
								value={authEmail}
								onChange={(event) => setAuthEmail(event.target.value)}
								placeholder="Leave empty for discoverable passkeys"
							/>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							disabled={loadingAction !== null}
							onClick={() =>
								void runAction(
									"capabilities",
									() => getPasskeyBrowserCapabilities(),
									(data) => ({ kind: "capabilities", data }),
								)
							}
						>
							{loadingAction === "capabilities" ? "Checking..." : "Check Capabilities"}
						</Button>
						<Button
							type="button"
							disabled={loadingAction !== null}
							onClick={() =>
								void runAction(
									"register",
									() =>
										registerPasskey({
											email,
											displayName,
											nickname,
										}),
									(data) => ({ kind: "register", data }),
								)
							}
						>
							{loadingAction === "register" ? "Registering..." : "Register Passkey"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							disabled={loadingAction !== null}
							onClick={() =>
								void runAction(
									"authenticate",
									() =>
										authenticateWithPasskey({
											email: authEmail.trim() || undefined,
											useBrowserAutofill: true,
										}),
									(data) => ({ kind: "authenticate", data }),
								)
							}
						>
							{loadingAction === "authenticate" ? "Authenticating..." : "Authenticate Passkey"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							disabled={loadingAction !== null}
							onClick={() =>
								void runAction(
									"authenticate-session",
									() =>
										authenticateWithPasskeyAndCreateSession({
											email: authEmail.trim() || undefined,
											useBrowserAutofill: true,
										}),
									(data) => ({ kind: "authenticate-session", data }),
								)
							}
						>
							{loadingAction === "authenticate-session"
								? "Authenticating + Signing In..."
								: "Authenticate + Create Session"}
						</Button>
					</div>

					<div className="rounded-md border bg-muted/30 p-3 text-xs leading-5">
						<div className="font-medium">Notes</div>
						<ul className="mt-2 list-disc pl-5">
							<li>
								Enable `AUTH_PASSKEY_SCAFFOLD_ENABLED=true` in root `.env` for backend responses.
							</li>
							<li>
								Use "Authenticate + Create Session" to test optional scaffold session exchange via
								NextAuth credentials provider `passkey-scaffold`.
							</li>
							<li>Challenge cookies require same-origin requests (`credentials: include`).</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Result</CardTitle>
					<CardDescription>
						Latest capability check / registration / authentication result
					</CardDescription>
				</CardHeader>
				<CardContent>
					<pre className="max-h-[420px] overflow-auto rounded-md border bg-background p-4 text-xs">
						{stringifyResult(result)}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
