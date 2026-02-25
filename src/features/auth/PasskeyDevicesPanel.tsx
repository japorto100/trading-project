"use client";

import Link from "next/link";
import { signIn as signInWithWebAuthn } from "next-auth/webauthn";
import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasskeyClientError, registerPasskey } from "@/lib/auth/passkey-client";

interface PasskeyDeviceItem {
	id: string;
	name: string | null;
	credentialId: string;
	deviceType: string;
	backedUp: boolean;
	counter: number;
	transports: string[];
	createdAt: string;
	lastUsedAt: string | null;
}

interface PasskeyDevicesResponse {
	user: {
		id: string;
		email: string | null;
		role: string;
	};
	items: PasskeyDeviceItem[];
	total: number;
}

type LoadState =
	| { kind: "idle" }
	| { kind: "loading" }
	| { kind: "loaded"; data: PasskeyDevicesResponse }
	| { kind: "error"; status?: number; message: string; details?: string };

function formatDate(value: string | null): string {
	if (!value) return "Never";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

async function readJSONSafe<T>(response: Response): Promise<T | null> {
	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
}

function isPasskeyProviderEnabledClient(): boolean {
	const raw = process.env.NEXT_PUBLIC_AUTH_PASSKEY_PROVIDER_ENABLED;
	if (raw === "false") return false;
	return true;
}

export function PasskeyDevicesPanel() {
	const [state, setState] = useState<LoadState>({ kind: "idle" });
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [registering, setRegistering] = useState(false);
	const [registerEmail, setRegisterEmail] = useState("");
	const [registerDisplayName, setRegisterDisplayName] = useState("");
	const [registerNickname, setRegisterNickname] = useState("Secondary Passkey");
	const passkeyProviderEnabled = isPasskeyProviderEnabledClient();

	const loadDevices = useEffectEvent(async () => {
		setState({ kind: "loading" });
		const response = await fetch("/api/auth/passkeys/devices", {
			method: "GET",
			credentials: "include",
			cache: "no-store",
			headers: {
				Accept: "application/json",
			},
		});
		const payload = await readJSONSafe<
			PasskeyDevicesResponse & { error?: string; details?: string }
		>(response);
		if (!response.ok || !payload || "error" in payload) {
			setState({
				kind: "error",
				status: response.status,
				message: payload?.error ?? `request failed (${response.status})`,
				details: payload?.details,
			});
			return;
		}
		if (!registerEmail && payload.user.email) {
			setRegisterEmail(payload.user.email);
		}
		if (!registerDisplayName && payload.user.email) {
			setRegisterDisplayName(payload.user.email.split("@")[0] ?? "User");
		}
		setState({ kind: "loaded", data: payload });
	});

	useEffect(() => {
		void loadDevices();
	}, []);

	const onDelete = async (authenticatorId: string) => {
		setDeletingId(authenticatorId);
		try {
			const response = await fetch("/api/auth/passkeys/devices", {
				method: "DELETE",
				credentials: "include",
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ authenticatorId }),
			});
			const payload = await readJSONSafe<{ error?: string; details?: string }>(response);
			if (!response.ok) {
				setState({
					kind: "error",
					status: response.status,
					message: payload?.error ?? `delete failed (${response.status})`,
					details: payload?.details,
				});
				return;
			}
			startTransition(() => {
				void loadDevices();
			});
		} finally {
			setDeletingId(null);
		}
	};

	const onRegister = async () => {
		setRegistering(true);
		try {
			if (passkeyProviderEnabled) {
				const response = await signInWithWebAuthn("passkey", {
					redirect: false,
					action: "register",
					redirectTo: "/auth/passkeys",
				});
				if (!response?.ok) {
					setState({
						kind: "error",
						message: response?.error ?? "Passkey registration via provider failed.",
					});
					return;
				}
			} else {
				const email = registerEmail.trim().toLowerCase();
				if (!email) {
					setState({
						kind: "error",
						message: "Email is required to register a passkey.",
					});
					return;
				}
				await registerPasskey({
					email,
					displayName: registerDisplayName.trim() || undefined,
					nickname: registerNickname.trim() || undefined,
				});
			}
			startTransition(() => {
				void loadDevices();
			});
		} catch (error: unknown) {
			if (error instanceof PasskeyClientError) {
				setState({
					kind: "error",
					message: error.message,
					details: error.details,
				});
			} else {
				setState({
					kind: "error",
					message: error instanceof Error ? error.message : "Passkey registration failed",
				});
			}
		} finally {
			setRegistering(false);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Passkey Devices</CardTitle>
					<CardDescription>
						Transitional passkey device management (Phase 1a scaffold) for the signed-in user.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-2">
						<Button type="button" variant="outline" onClick={() => void loadDevices()}>
							Refresh
						</Button>
						<Button asChild type="button" variant="secondary">
							<Link href="/auth/sign-in">Open Sign In</Link>
						</Button>
						<Button asChild type="button" variant="secondary">
							<Link href="/auth/passkeys-lab">Open Passkey Lab</Link>
						</Button>
						<Button asChild type="button" variant="secondary">
							<Link href="/auth/security">Security Hub</Link>
						</Button>
					</div>

					<div className="rounded-md border p-4">
						<div className="mb-3 text-sm font-medium">
							Register New Passkey (
							{passkeyProviderEnabled ? "Auth.js Provider" : "Scaffold Fallback"})
						</div>
						<div className="grid gap-3 md:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="register-email">Email</Label>
								<Input
									id="register-email"
									value={registerEmail}
									onChange={(event) => setRegisterEmail(event.target.value)}
									placeholder="trader@example.com"
									autoComplete="email"
									disabled={passkeyProviderEnabled}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="register-display-name">Display name</Label>
								<Input
									id="register-display-name"
									value={registerDisplayName}
									onChange={(event) => setRegisterDisplayName(event.target.value)}
									placeholder="Trader"
									disabled={passkeyProviderEnabled}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="register-nickname">Device nickname</Label>
								<Input
									id="register-nickname"
									value={registerNickname}
									onChange={(event) => setRegisterNickname(event.target.value)}
									placeholder="Laptop Passkey"
									disabled={passkeyProviderEnabled}
								/>
							</div>
						</div>
						<div className="mt-3 flex flex-wrap gap-2">
							<Button
								type="button"
								disabled={registering || deletingId !== null}
								onClick={() => void onRegister()}
							>
								{registering ? "Registering..." : "Register Passkey"}
							</Button>
							<span className="text-xs text-muted-foreground">
								{passkeyProviderEnabled
									? "Uses the real Auth.js Passkey Provider (`passkey`, action=register) and refreshes the device list afterwards."
									: "Uses the scaffold flow (`/api/auth/passkeys/*`) and refreshes the device list on success."}
							</span>
						</div>
					</div>

					{state.kind === "loading" || state.kind === "idle" ? (
						<div className="rounded-md border p-4 text-sm text-muted-foreground">
							Loading passkey devices...
						</div>
					) : state.kind === "error" ? (
						<div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
							<div>{state.message}</div>
							{state.details ? <div className="mt-1 text-xs">{state.details}</div> : null}
							{state.status === 401 ? (
								<div className="mt-2 text-xs">
									Sign in first at <code>/auth/sign-in</code>.
								</div>
							) : null}
						</div>
					) : state.data.items.length === 0 ? (
						<div className="rounded-md border p-4 text-sm text-muted-foreground">
							No passkeys registered for this account yet. Use the passkey lab to register the first
							device.
						</div>
					) : (
						<div className="space-y-3">
							<div className="text-sm text-muted-foreground">
								{state.data.total} device{state.data.total === 1 ? "" : "s"} registered
							</div>
							<div className="grid gap-3">
								{state.data.items.map((item) => (
									<div key={item.id} className="rounded-md border p-4">
										<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
											<div className="space-y-1 text-sm">
												<div className="font-medium">{item.name ?? "Unnamed Passkey"}</div>
												<div className="text-muted-foreground">
													Type: {item.deviceType} | Backed up: {item.backedUp ? "yes" : "no"}
												</div>
												<div className="text-muted-foreground">
													Last used: {formatDate(item.lastUsedAt)}
												</div>
												<div className="text-muted-foreground">
													Created: {formatDate(item.createdAt)}
												</div>
												<div className="text-muted-foreground">Counter: {item.counter}</div>
												<div className="text-muted-foreground">
													Transports: {item.transports.join(", ") || "n/a"}
												</div>
												<div className="font-mono text-xs text-muted-foreground">
													{item.credentialId.slice(0, 20)}...
												</div>
											</div>
											<Button
												type="button"
												variant="destructive"
												disabled={deletingId !== null}
												onClick={() => void onDelete(item.id)}
											>
												{deletingId === item.id ? "Removing..." : "Remove"}
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
