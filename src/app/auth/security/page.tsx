import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
	getAuthBypassRole,
	isAuthEnabled,
	isAuthStackBypassEnabled,
} from "@/lib/auth/runtime-flags";

export const dynamic = "force-dynamic";

function statusRow(label: string, value: string) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium">{value}</span>
		</div>
	);
}

export default async function AuthSecurityPage() {
	const authBypass = isAuthStackBypassEnabled();
	const authEnabled = isAuthEnabled();
	const session = authEnabled ? await auth() : null;

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Auth & Security Settings</CardTitle>
					<CardDescription>
						Phase-1 auth/security hub for login, registration, passkeys, consent, and KG encryption
						testing surfaces.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-3 md:grid-cols-2">
						{statusRow("Auth enabled", authEnabled ? "yes" : "no")}
						{statusRow("Auth bypass", authBypass ? `yes (${getAuthBypassRole()})` : "no")}
						{statusRow(
							"Session",
							session?.user ? "active" : authEnabled ? "missing" : "not required",
						)}
						{statusRow(
							"Signed in user",
							session?.user?.email ?? (session?.user?.id ? `id:${session.user.id}` : "—"),
						)}
					</div>

					<div className="grid gap-3 md:grid-cols-2">
						<Link href="/auth/sign-in" className="rounded-md border p-4 hover:bg-muted/40">
							<div className="text-sm font-medium">Sign In</div>
							<div className="mt-1 text-xs text-muted-foreground">
								Credentials + passkey scaffold sign-in.
							</div>
						</Link>
						<Link href="/auth/register" className="rounded-md border p-4 hover:bg-muted/40">
							<div className="text-sm font-medium">Register</div>
							<div className="mt-1 text-xs text-muted-foreground">
								Prisma-backed credentials account creation.
							</div>
						</Link>
						<Link href="/auth/passkeys" className="rounded-md border p-4 hover:bg-muted/40">
							<div className="text-sm font-medium">Passkey Devices</div>
							<div className="mt-1 text-xs text-muted-foreground">
								Device list, register/remove, last-device guard.
							</div>
						</Link>
						<Link href="/auth/privacy" className="rounded-md border p-4 hover:bg-muted/40">
							<div className="text-sm font-medium">Privacy & Consent</div>
							<div className="mt-1 text-xs text-muted-foreground">
								Server-side consent toggles for LLM/analytics/marketing.
							</div>
						</Link>
						<Link
							href="/auth/kg-encryption-lab"
							className="rounded-md border p-4 hover:bg-muted/40 md:col-span-2"
						>
							<div className="text-sm font-medium">KG Encryption Lab</div>
							<div className="mt-1 text-xs text-muted-foreground">
								AES-GCM encrypted IndexedDB proof-of-concept using server fallback key material.
							</div>
						</Link>
					</div>

					<div className="rounded-md border bg-muted/30 p-4 text-xs leading-5 text-muted-foreground">
						Production note: keep auth bypass disabled. `ALLOW_PROD_AUTH_STACK_BYPASS=true` is an
						emergency override only and should not be part of standard deployment config.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
