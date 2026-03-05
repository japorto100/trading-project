"use client";

/**
 * SOTA 2026 Elite Registration Panel
 * Features:
 * - No automatic login (security best practice)
 * - Initial Recovery Code generation & display
 * - Hardware-binding ready
 */

import { AlertTriangle, ArrowRight, Copy, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
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
	| { kind: "success"; message: string; recoveryCodes: string[] }
	| { kind: "error"; message: string; details?: string };

function isAuthEnabledClient(): boolean {
	if (process.env.NEXT_PUBLIC_AUTH_STACK_BYPASS === "true") return false;
	return process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";
}

interface RegisterResponse {
	error?: string;
	details?: string;
	recoveryCodes?: string[];
}

export function AuthRegisterPanel({ nextPath }: AuthRegisterPanelProps) {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState<ResultState>({ kind: "idle" });

	async function handleRegister() {
		if (!isAuthEnabledClient()) {
			setResult({
				kind: "error",
				message: "Registration is currently disabled.",
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
				body: JSON.stringify({
					email: email.trim(),
					username: username.trim(),
					name: name.trim() || undefined,
					password,
				}),
			});
			const payload = (await response.json().catch(() => ({}))) as RegisterResponse;

			if (!response.ok) {
				setResult({
					kind: "error",
					message: payload.error || `Registration failed (${response.status})`,
					details: payload.details,
				});
				return;
			}
			// Success: Show recovery codes, do NOT auto-login (SOTA 2026)
			setResult({
				kind: "success",
				message: "Account created successfully.",
				recoveryCodes: payload.recoveryCodes || [],
			});
		} catch (error: unknown) {
			setResult({
				kind: "error",
				message: error instanceof Error ? error.message : "Registration failed",
			});
		} finally {
			setSubmitting(false);
		}
	}

	if (result.kind === "success") {
		return (
			<div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-6">
				<Card className="bg-zinc-950/50 backdrop-blur-xl border-emerald-500/20 shadow-2xl overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/40" />
					<CardHeader className="text-center">
						<div className="mx-auto p-3 bg-emerald-500/10 rounded-full w-fit mb-4 text-emerald-400">
							<ShieldCheck className="h-8 w-8" />
						</div>
						<CardTitle className="text-2xl font-black tracking-tight">Account Secured</CardTitle>
						<CardDescription>Your vault has been initialized.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-xs text-amber-200/80 leading-relaxed italic">
							<AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 not-italic" />
							<div>
								<p className="font-bold mb-1 not-italic">Save these recovery codes now!</p>
								These are the ONLY way to recover your account if you lose access. Next.js will not
								show them again.
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2">
							{result.recoveryCodes.map((code) => (
								<code
									key={code}
									className="bg-black/60 p-2 rounded border border-white/5 text-[10px] font-mono text-center select-all hover:border-white/20 transition-colors"
								>
									{code}
								</code>
							))}
						</div>

						<div className="pt-4 flex flex-col gap-3">
							<Button
								variant="outline"
								className="w-full h-12 rounded-xl group"
								onClick={() => {
									navigator.clipboard.writeText(result.recoveryCodes.join("\n"));
								}}
							>
								<Copy className="mr-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
								Copy All Codes
							</Button>

							<Button
								className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500"
								asChild
							>
								<Link
									href={
										nextPath
											? `/auth/sign-in?next=${encodeURIComponent(nextPath)}`
											: "/auth/sign-in"
									}
								>
									Proceed to Sign In <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
			<Card className="bg-zinc-950/50 backdrop-blur-xl border-white/5 shadow-2xl">
				<CardHeader>
					<CardTitle className="text-2xl font-black uppercase tracking-tight">
						Create Identity
					</CardTitle>
					<CardDescription>Initialize your SOTA 2026 trading profile.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="space-y-2">
						<Label htmlFor="register-email">Email Address</Label>
						<Input
							id="register-email"
							type="email"
							placeholder="name@example.com"
							autoComplete="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className="bg-black/40 border-white/10 h-11"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-username">Unique Username</Label>
						<Input
							id="register-username"
							placeholder="trader_2026"
							autoComplete="username"
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							className="bg-black/40 border-white/10 h-11"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-name">Full Name (optional)</Label>
						<Input
							id="register-name"
							placeholder="Alex Trader"
							autoComplete="name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							className="bg-black/40 border-white/10 h-11"
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
							className="bg-black/40 border-white/10 h-11"
						/>
						<p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
							Min 12 characters
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-password-confirm">Confirm Password</Label>
						<Input
							id="register-password-confirm"
							type="password"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							className="bg-black/40 border-white/10 h-11"
						/>
					</div>

					<Button
						type="button"
						className="w-full h-12 font-bold rounded-xl bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
						disabled={submitting}
						onClick={() => void handleRegister()}
					>
						{submitting ? <Loader2 className="animate-spin" /> : "Create Secured Account"}
					</Button>

					<div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-white/5">
						<div className="flex gap-4">
							<Link href="/auth/sign-in" className="hover:text-white transition-colors">
								Sign In
							</Link>
							<Link href="/auth/security" className="hover:text-white transition-colors">
								Security Hub
							</Link>
						</div>
						<span className="opacity-30">SOTA 2026</span>
					</div>

					{result.kind === "error" && (
						<div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex flex-col gap-1">
							<div className="font-bold uppercase tracking-tight">Identity Error</div>
							<div>{result.message}</div>
							{result.details && <div className="opacity-60">{result.details}</div>}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
