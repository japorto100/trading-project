import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MFASetupPanel } from "@/features/auth/MFASetupPanel";
import { PasskeyDevicesPanel } from "@/features/auth/PasskeyDevicesPanel";
import { PasswordChangePanel } from "@/features/auth/PasswordChangePanel";
import { auth } from "@/lib/auth";
import {
	getAuthBypassRole,
	isAuthEnabled,
	isAuthStackBypassEnabled,
} from "@/lib/auth/runtime-flags";

function statusRow(label: string, value: string) {
	return (
		<div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
			<span className="text-xs text-muted-foreground uppercase tracking-tight font-medium">
				{label}
			</span>
			<span className="text-xs font-mono text-foreground">{value}</span>
		</div>
	);
}

async function SecurityHubContent() {
	const session = await auth();

	const authEnabled = isAuthEnabled();
	const bypassEnabled = isAuthStackBypassEnabled();
	const bypassRole = getAuthBypassRole();

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-black uppercase tracking-tighter">Security Hub</h1>
				<p className="text-muted-foreground">
					Manage your identification keys, session lifecycle and hardware authentication.
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="bg-zinc-950/50 border-white/5">
					<CardHeader>
						<CardTitle className="text-lg">System Status</CardTitle>
						<CardDescription>Core authentication engine parameters (SOTA 2026).</CardDescription>
					</CardHeader>
					<CardContent className="space-y-1">
						{statusRow("Auth Engine", authEnabled ? "ACTIVE" : "DISABLED")}
						{statusRow("Bypass Stack", bypassEnabled ? "ENABLED" : "SECURED")}
						{statusRow("Virtual Role", bypassRole)}
						{statusRow(
							"Identity",
							session?.user?.email ?? (session?.user?.id ? `id:${session.user.id}` : "ANONYMOUS"),
						)}
					</CardContent>
				</Card>

				<Card className="bg-zinc-950/50 border-white/5">
					<CardHeader>
						<CardTitle className="text-lg">Session Lifecycle</CardTitle>
						<CardDescription>JWT Transport & Sliding Window configuration.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-1 text-xs text-muted-foreground leading-relaxed">
						Your session uses a **short-lived JWT** (15 min) with a **sliding window** update every
						5 minutes. Revocations are synced across the Go-Gateway every 60 seconds.
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				{session?.user ? (
					<div className="md:col-span-2 space-y-6 mt-4">
						<PasswordChangePanel />
						<MFASetupPanel />
						<PasskeyDevicesPanel />
					</div>
				) : null}

				<Link href="/auth/sign-in" className="rounded-md border p-4 hover:bg-muted/40">
					<div className="text-sm font-medium">Sign In</div>
					<div className="mt-1 text-xs text-muted-foreground">
						Credentials + passkey scaffold sign-in.
					</div>
				</Link>
				<Link href="/auth/register" className="rounded-md border p-4 hover:bg-muted/40">
					<div className="text-sm font-medium">Register</div>
					<div className="mt-1 text-xs text-muted-foreground">
						Create a new account with hardware binding.
					</div>
				</Link>
				<Link href="/auth/passkeys" className="rounded-md border p-4 hover:bg-muted/40">
					<div className="text-sm font-medium">Passkey Management</div>
					<div className="mt-1 text-xs text-muted-foreground">
						View and manage your registered hardware keys.
					</div>
				</Link>
				<Link href="/auth/passkeys-lab" className="rounded-md border p-4 hover:bg-muted/40">
					<div className="text-sm font-medium">Passkey Lab</div>
					<div className="mt-1 text-xs text-muted-foreground">
						Debug WebAuthn flows and examine raw credentials.
					</div>
				</Link>
				<Link href="/auth/admin/users" className="rounded-md border p-4 hover:bg-muted/40">
					<div className="text-sm font-medium">User Administration</div>
					<div className="mt-1 text-xs text-muted-foreground">
						Manage roles and permissions (Admin only).
					</div>
				</Link>
				<Link href="/auth/privacy" className="rounded-md border p-4 hover:bg-muted/40">
					<div className="text-sm font-medium">Privacy Settings</div>
					<div className="mt-1 text-xs text-muted-foreground">
						Data retention and OTel observability consent.
					</div>
				</Link>
			</div>

			<Card className="border-destructive/20 bg-destructive/5">
				<CardHeader>
					<CardTitle className="text-sm text-destructive">Security Advisory</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-xs text-muted-foreground">
						Production note: keep auth bypass disabled. `ALLOW_PROD_AUTH_STACK_BYPASS=true` is an
						emergency override only and should not be part of standard deployment config.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function AuthSecurityPage() {
	return (
		<Suspense
			fallback={
				<div className="p-8 text-center text-xs animate-pulse">Synchronizing Security State...</div>
			}
		>
			<SecurityHubContent />
		</Suspense>
	);
}
