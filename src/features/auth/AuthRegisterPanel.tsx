"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthRegisterPanelProps {
	nextPath?: string;
}

type ResultState =
	| { kind: "idle" }
	| { kind: "success"; message: string }
	| { kind: "error"; message: string; details?: string };

function isAuthEnabledClient(): boolean {
	if (process.env.NEXT_PUBLIC_AUTH_STACK_BYPASS === "true") return false;
	return process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";
}

export function AuthRegisterPanel({ nextPath }: AuthRegisterPanelProps) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState<ResultState>({ kind: "idle" });

	async function handleRegister() {
		if (!isAuthEnabledClient()) {
			setResult({
				kind: "error",
				message:
					process.env.NEXT_PUBLIC_AUTH_STACK_BYPASS === "true"
						? "Registration is disabled while auth bypass is enabled."
						: "Auth is disabled (`NEXT_PUBLIC_ENABLE_AUTH=false`).",
			});
			return;
		}
		if (password !== confirmPassword) {
			setResult({ kind: "error", message: "Passwords do not match." });
			return;
		}

		setSubmitting(true);
		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					email: email.trim(),
					name: name.trim() || undefined,
					password,
				}),
			});
			const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
			if (!response.ok) {
				setResult({
					kind: "error",
					message:
						typeof payload.error === "string"
							? payload.error
							: `Registration failed (${response.status})`,
					details: typeof payload.details === "string" ? payload.details : undefined,
				});
				return;
			}

			const signInResponse = await signIn("credentials", {
				redirect: false,
				username: email.trim(),
				password,
			});
			if (!signInResponse?.ok) {
				setResult({
					kind: "success",
					message: "Account created. Please sign in.",
				});
				return;
			}

			setResult({ kind: "success", message: "Account created and signed in." });
			if (nextPath) {
				router.replace(nextPath);
				return;
			}
			router.replace("/");
		} catch (error: unknown) {
			setResult({
				kind: "error",
				message: error instanceof Error ? error.message : "Registration failed",
			});
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Create Account</CardTitle>
					<CardDescription>
						Transitional Phase-1 credentials registration (Prisma-backed). Passkey registration can
						be added after sign-in under <code>/auth/passkeys</code>.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="register-email">Email</Label>
						<Input
							id="register-email"
							type="email"
							autoComplete="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-name">Display name (optional)</Label>
						<Input
							id="register-name"
							autoComplete="name"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-password">Password</Label>
						<Input
							id="register-password"
							type="password"
							autoComplete="new-password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
						<p className="text-xs text-muted-foreground">Minimum 12 characters.</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-password-confirm">Confirm password</Label>
						<Input
							id="register-password-confirm"
							type="password"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
						/>
					</div>
					<Button
						type="button"
						className="w-full"
						disabled={submitting}
						onClick={() => void handleRegister()}
					>
						{submitting ? "Creating account..." : "Create Account"}
					</Button>
					<div className="text-xs text-muted-foreground">
						Already have an account?{" "}
						<Link
							href={
								nextPath ? `/auth/sign-in?next=${encodeURIComponent(nextPath)}` : "/auth/sign-in"
							}
							className="underline underline-offset-4"
						>
							Sign in
						</Link>
					</div>
					<div className="text-xs text-muted-foreground">
						Security settings and consent/passkey flows live under{" "}
						<Link href="/auth/security" className="underline underline-offset-4">
							/auth/security
						</Link>
						.
					</div>
					<div className="rounded-md border bg-muted/30 p-3 text-xs leading-5">
						{result.kind === "idle" ? (
							<p className="text-muted-foreground">No registration attempt yet.</p>
						) : result.kind === "success" ? (
							<p className="text-emerald-700 dark:text-emerald-400">{result.message}</p>
						) : (
							<div className="text-red-700 dark:text-red-400">
								<div>{result.message}</div>
								{result.details ? <div className="mt-1">{result.details}</div> : null}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
