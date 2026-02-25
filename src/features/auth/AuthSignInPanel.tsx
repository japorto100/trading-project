"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signIn as signInWithWebAuthn } from "next-auth/webauthn";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	authenticateWithPasskeyAndCreateSession,
	PasskeyClientError,
} from "@/lib/auth/passkey-client";

type SignInResult =
	| { kind: "none" }
	| { kind: "success"; message: string }
	| { kind: "error"; message: string; details?: string };

interface AuthSignInPanelProps {
	nextPath?: string;
}

function isAuthEnabledClient(): boolean {
	if (isAuthStackBypassEnabledClient()) {
		return false;
	}
	return process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";
}

function isAuthStackBypassEnabledClient(): boolean {
	return process.env.NEXT_PUBLIC_AUTH_STACK_BYPASS === "true";
}

function isPasskeyProviderEnabledClient(): boolean {
	const raw = process.env.NEXT_PUBLIC_AUTH_PASSKEY_PROVIDER_ENABLED;
	if (raw === "false") return false;
	return true;
}

export function AuthSignInPanel({ nextPath }: AuthSignInPanelProps) {
	const router = useRouter();
	const [username, setUsername] = useState("admin");
	const [password, setPassword] = useState("");
	const [passkeyEmail, setPasskeyEmail] = useState("");
	const [loadingAction, setLoadingAction] = useState<string | null>(null);
	const [result, setResult] = useState<SignInResult>({ kind: "none" });

	const authEnabled = isAuthEnabledClient();
	const authBypassed = isAuthStackBypassEnabledClient();
	const passkeyProviderEnabled = isPasskeyProviderEnabledClient();

	async function runCredentialsSignIn() {
		setLoadingAction("credentials");
		try {
			if (!authEnabled) {
				setResult({
					kind: "error",
					message: authBypassed
						? "Auth stack bypass is enabled (`NEXT_PUBLIC_AUTH_STACK_BYPASS=true`)."
						: "Auth is disabled (`NEXT_PUBLIC_ENABLE_AUTH=false`).",
				});
				return;
			}

			const response = await signIn("credentials", {
				redirect: false,
				username,
				password,
			});

			if (!response) {
				setResult({ kind: "error", message: "No response from NextAuth signIn." });
				return;
			}
			if (!response.ok) {
				setResult({
					kind: "error",
					message: response.error ?? "Credentials sign-in failed.",
				});
				return;
			}

			setResult({
				kind: "success",
				message: "Credentials session created successfully.",
			});
			if (nextPath) {
				router.replace(nextPath);
				return;
			}
		} catch (error: unknown) {
			setResult({
				kind: "error",
				message: error instanceof Error ? error.message : "Credentials sign-in error",
			});
		} finally {
			setLoadingAction(null);
		}
	}

	async function runPasskeySignIn() {
		setLoadingAction("passkey");
		try {
			if (!authEnabled) {
				setResult({
					kind: "error",
					message: authBypassed
						? "Auth stack bypass is enabled (`NEXT_PUBLIC_AUTH_STACK_BYPASS=true`)."
						: "Auth is disabled (`NEXT_PUBLIC_ENABLE_AUTH=false`).",
				});
				return;
			}
			if (passkeyProviderEnabled) {
				const response = await signInWithWebAuthn("passkey", {
					redirect: false,
					redirectTo: nextPath ?? "/auth/security",
				});
				if (!response?.ok) {
					setResult({
						kind: "error",
						message: response?.error ?? "Passkey sign-in failed.",
					});
					return;
				}
				setResult({
					kind: "success",
					message: "Passkey session created via Auth.js Passkey Provider.",
				});
			} else {
				const { verify, session } = await authenticateWithPasskeyAndCreateSession({
					email: passkeyEmail.trim() || undefined,
					useBrowserAutofill: true,
				});

				if (!session.ok) {
					setResult({
						kind: "error",
						message: session.error ?? "Passkey session exchange failed.",
					});
					return;
				}

				setResult({
					kind: "success",
					message: `Passkey session created for ${verify.user.email ?? verify.user.id}.`,
				});
			}
			if (nextPath) {
				router.replace(nextPath);
				return;
			}
		} catch (error: unknown) {
			if (error instanceof PasskeyClientError) {
				setResult({
					kind: "error",
					message: error.message,
					details: error.details,
				});
			} else {
				setResult({
					kind: "error",
					message: error instanceof Error ? error.message : "Passkey sign-in error",
				});
			}
		} finally {
			setLoadingAction(null);
		}
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>
						Transitional auth surface for Phase 1a. Supports credentials and passkey scaffold
						sign-in.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-4">
							<div className="text-sm font-medium">Credentials</div>
							<div className="space-y-2">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									value={username}
									onChange={(event) => setUsername(event.target.value)}
									autoComplete="username"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									autoComplete="current-password"
								/>
							</div>
							<Button
								type="button"
								className="w-full"
								disabled={loadingAction !== null}
								onClick={() => void runCredentialsSignIn()}
							>
								{loadingAction === "credentials" ? "Signing in..." : "Sign In (Credentials)"}
							</Button>
						</div>

						<div className="space-y-4">
							<div className="text-sm font-medium">
								Passkey ({passkeyProviderEnabled ? "Auth.js Provider" : "Scaffold Fallback"})
							</div>
							<div className="space-y-2">
								<Label htmlFor="passkey-email">Email (optional)</Label>
								<Input
									id="passkey-email"
									value={passkeyEmail}
									onChange={(event) => setPasskeyEmail(event.target.value)}
									placeholder="Leave empty for discoverable passkeys"
									autoComplete="email webauthn"
								/>
							</div>
							<Button
								type="button"
								variant="secondary"
								className="w-full"
								disabled={loadingAction !== null}
								onClick={() => void runPasskeySignIn()}
							>
								{loadingAction === "passkey" ? "Signing in..." : "Sign In With Passkey"}
							</Button>
							<p className="text-xs text-muted-foreground">
								{passkeyProviderEnabled
									? "Uses the real Auth.js/next-auth Passkey Provider (`passkey`) for final session issuance."
									: "Uses `/api/auth/passkeys/*` scaffold endpoints and transitional NextAuth provider `passkey-scaffold`."}
							</p>
						</div>
					</div>

					<div className="rounded-md border bg-muted/30 p-3 text-xs leading-5">
						<div className="font-medium">Status</div>
						{result.kind === "none" ? (
							<p className="mt-2 text-muted-foreground">No sign-in attempt yet.</p>
						) : result.kind === "success" ? (
							<p className="mt-2 text-emerald-700 dark:text-emerald-400">{result.message}</p>
						) : (
							<div className="mt-2 text-red-700 dark:text-red-400">
								<div>{result.message}</div>
								{result.details ? <div className="mt-1 text-xs">{result.details}</div> : null}
							</div>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
						<span>
							Flags required: `NEXT_PUBLIC_ENABLE_AUTH=true` and (for passkeys)
							{passkeyProviderEnabled
								? " Auth.js Passkey Provider enabled (default)."
								: " `AUTH_PASSKEY_SCAFFOLD_ENABLED=true` (scaffold fallback)."}
						</span>
						<Link
							href={
								nextPath ? `/auth/register?next=${encodeURIComponent(nextPath)}` : "/auth/register"
							}
							className="underline underline-offset-4"
						>
							Create Account
						</Link>
						<Link href="/auth/passkeys-lab" className="underline underline-offset-4">
							Open Passkey Lab
						</Link>
						<Link href="/auth/security" className="underline underline-offset-4">
							Auth & Security Hub
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
